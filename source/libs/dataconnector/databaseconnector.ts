import * as pg from 'pg';
import * as fs from 'fs';

import { IDataConnector, 
         DataResourceCallback, 
         DataFormItemCallback } from './dataconnector';
import { ICMSResource } from '../cms/resource';
import { ICMSFormItem } from '../cms/formitem';


const INSERT_RESOURCE_SQL_COMMAND : string = `INSERT INTO cms_resources 
        (slug, mime_type, value, resource_type, parent_resource_id,
        publish_from, publish_to, create_datetime, modify_datetime, delete_datetime) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;

const UPDATE_RESOURCE_SQL_COMMAND: string = `UPDATE cms_resources SET mime_type = $2, value = $3, 
        resource_type = $4, parent_resource_id = $5, publish_from = $6,
        publish_to = $7, create_datetime = $8, modify_datetime = $9, delete_datetime = $10 WHERE slug = $1 ;`;

const SELECT_RESOURCE_SQL_COMMAND: string = `SELECT slug, mime_type, value, resource_type, 
        parent_resource_id, publish_from, publish_to, create_datetime, modify_datetime, 
        delete_datetime from cms_resources WHERE slug = $1 ;`;
const SELECT_MASTER_PAGES_SQL_COMMAND: string = `SELECT id, slug, mime_type, value, resource_type, 
        parent_resource_id, publish_from, publish_to, create_datetime, modify_datetime, 
        delete_datetime from cms_resources WHERE resource_type = 'masterpage' ;`;
const LOGICAL_DELETE_RESOURCE_SQL_COMMAND: string = `UPDATE cms_resources SET delete_datetime = current_timestamp WHERE slug = $1;`;

const INSERT_FORM_ITEM_SQL_COMMAND: string = `INSERT INTO cms_form_items ( data_type, value, create_datetime, modify_datetime, delete_datetime)
        VALUES ( $1, $2, $3, $4, $5);`;

const UPDATE_FORM_ITEM_SQL_COMMAND: string = `UPDATE cms_form_items set data_type = $1, value = $2, 
        create_datetime = $3, modify_datetime = $4, delete_datetime = $5
        WHERE id = $6;`;

const SELECT_FORM_ITEM_SQL_COMMAND: string = `SELECT id, data_type, value, create_datetime, modify_datetime, delete_datetime FROM cms_form_items
        WHERE id = $1 AND delete_datetime IS NULL;`;
const SELECT_ALL_FORM_ITEM_SQL_COMMAND: string = `SELECT id, data_type, value, create_datetime, modify_datetime, delete_datetime FROM cms_form_items
        WHERE data_type = $1 AND delete_datetime IS NULL`;

const LOGICAL_DELETE_FORM_ITEM_SQL_COMMAND : string = `UPDATE cms_form_items SET delete_datetime = current_timestamp WHERE id = $1;`;

const CREATE_TABLES_SQL_COMMAND = `
    DROP TABLE IF EXISTS cms_resources;
    DROP TABLE IF EXISTS cms_form_items;
    create table cms_resources(
        id serial primary key,
        slug text not null,
        mime_type text default 'text/html',
        value text,
        resource_type text, /* page, master, binary, system */
        parent_resource_id integer default null,
        publish_from timestamp DEFAULT now(),
        publish_to timestamp DEFAULT null,
        create_datetime timestamp DEFAULT now(),
        modify_datetime timestamp DEFAULT null,
        delete_datetime timestamp DEFAULT null
    );

    create table cms_form_items (
        id serial primary key,
        data_type text not null,
        value text default '{}',
        create_datetime timestamp DEFAULT now(),
        modify_datetime timestamp DEFAULT null,
        delete_datetime timestamp DEFAULT null
    );`;


const UPDATE_RESOURCES_PARENT_ID = `UPDATE cms_resources AS u SET parent_resource_id = x.id
                       FROM cms_resources AS x WHERE u.resource_type='page' AND x.slug='landingpage';`


const RESOURCES_DATA = require('../../setup/resources.json');

export class DatabaseConnector implements IDataConnector {
    private client: pg.Client;
    constructor(connectionstring: string) {     
        this.client = new pg.Client(connectionstring); 

        this.client.connect((err: Error): void => {
            if (err) {
                console.info("Error onConnecting", err)
            }
        });
    }

    public createFormItem(formitem: ICMSFormItem): Promise<ICMSFormItem> {
        return this.executeSQLCommand(INSERT_FORM_ITEM_SQL_COMMAND, 
                [formitem.dataType, formitem.value, formitem.createDatetime, formitem.modityDatetime, formitem.deleteDatetime])
                .then((sql:any) => formitem);
    }

    public updateFormItem(formitem: ICMSFormItem): Promise<ICMSFormItem> {
        return this.executeSQLCommand(UPDATE_FORM_ITEM_SQL_COMMAND, 
                [formitem.dataType, formitem.value, formitem.createDatetime, formitem.modityDatetime, formitem.deleteDatetime, formitem.id])
                .then((sql:any) => formitem);
    }

    public deleteFormItemWithId(id: number): Promise<boolean> {
        return this.executeSQLCommand(LOGICAL_DELETE_FORM_ITEM_SQL_COMMAND, [id])
                .then((sql:any) => true);
    }

    public getAllFormItems(datatype:string): Promise<ICMSFormItem[]> {
        return this.executeSQLCommand(SELECT_ALL_FORM_ITEM_SQL_COMMAND, [datatype])
            .then(this.dbResultToObjectList);    
    }

    public getMasterPages(): Promise<ICMSResource[]>{
        return this.executeSQLCommand(SELECT_MASTER_PAGES_SQL_COMMAND, [])
            .then(this.dbResultToObjectList);  
    }

    public getFormItemPromiseWithId(id: number): Promise<ICMSFormItem> {
        return this.executeSQLCommand(SELECT_FORM_ITEM_SQL_COMMAND, [id])
            .then(this.dbResultToObjectList)
                .then((formitem:ICMSFormItem[])=> Promise.resolve(formitem[0]));
    }

    public getResourceWithSlug(slug: string): Promise<ICMSResource> {
        return this.executeSQLCommand(SELECT_RESOURCE_SQL_COMMAND, [slug])
                .then(this.dbResultToObjectList)
                .then((resources:ICMSResource[])=> Promise.resolve(resources[0]));    
    }

    public updateResource(resource: ICMSResource): Promise<any>{
        return this.executeSQLCommand(UPDATE_RESOURCE_SQL_COMMAND, 
                [resource.slug, resource.mimeType, resource.value, resource.resourceType,
                resource.parentResourceId, resource.publishFrom, resource.publishTo,
                resource.createDateTime, resource.modifyDateTime, resource.deleteDateTime])
                .then((sql:any) => resource);
    }

    public createResource(resource: ICMSResource): Promise<any>{
        return this.executeSQLCommand(INSERT_RESOURCE_SQL_COMMAND, 
                [resource.slug, resource.mimeType, resource.value, resource.resourceType,
                resource.parentResourceId, resource.publishFrom, resource.publishTo,
                resource.createDateTime, resource.modifyDateTime, resource.deleteDateTime])
                .then((sql:any) => resource);
    }

    public executeSQLCommand( sqlcommand: string, parameters: any[]): Promise<pg.QueryResult>{
        return this.client.query(sqlcommand, parameters); 
    }

    public setupDatabase(): Promise<any> {
        return this.executeSQLCommand(CREATE_TABLES_SQL_COMMAND, [])
            .then(this.insertResources.bind(this))
        ;
    }

    public insertResources(): Promise<any> {
        let sqlCommand = "";
        for (let name in RESOURCES_DATA) {
            let item = RESOURCES_DATA[name];
            let isBinary = (item && item.isBinary);
            let content: any = fs.readFileSync("./setup/default_pages/" + item.file, isBinary ? "binary" : "utf-8") || "";
            let resourceType: string = isBinary ? "binary" : ((item && item.resourceType) || "systempage");

            content = isBinary ? new Buffer(content, "binary").toString('base64') : content.replace(/'/gi, "''");

            sqlCommand += `insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
                           values ('${name}', '${item.mime}', '${content}', '${resourceType}', null);\r\n`;
        }

        sqlCommand += UPDATE_RESOURCES_PARENT_ID;

        return this.executeSQLCommand(sqlCommand, []);
    }

    private dbResultToObjectList(result : pg.QueryResult): Promise<ICMSResource[]|ICMSFormItem[]> {
        let resource : ICMSResource[] = [];
        if(result!== undefined){
            let firstRun = true;
            let columns: string[];
            let properties: string[] = [];
            for(let row of result.rows){
                let newObject: any = {};
                if(firstRun){
                    firstRun = false;
                    columns = Object.keys(row);
                    for(let column of columns) {
                        properties.push(DatabaseConnector.dbColumnNameToPropertyName(column));
                    }
                }
                for(let idx in columns){
                    newObject[properties[idx]] = row[columns[idx]];
                }
                resource.push(newObject);
            }  
        }
        return Promise.resolve(resource);
    }

    private static dbColumnNameToPropertyName(columnname: string): string {
        return columnname.replace(/_(.)/gi, function(match, partial){ 
            return partial.toUpperCase();
        });
    }
}
