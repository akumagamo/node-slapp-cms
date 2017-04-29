import * as fs from 'fs';

import { IDataConnector, 
         DataResourceCallback, 
         DataFormItemCallback } from './dataconnector';

import { ICMSResource, CMSResource } from '../cms/resource';
import { ICMSFormItem } from '../cms/formitem';

import { CMSBase } from '../cms/base';


const RESOURCES_DATA = require('../../setup/resources.json');

let ResourceTypes = CMSBase.ResourceTypes;

export class FileConnector implements IDataConnector {

    public static FormItemsFolder: string = "/form_items/";
    public static MasterpagesFolder: string = "/masterpages/";
    public static ResourcesFolder: string = "/resources/";
    public static DefaultEncoding: string = "utf8";

    constructor(private dataFolder: string) { }

    public getDataSubFolder(type: string): string{
        let subFolder: string = this.dataFolder;
        switch (type) {
            case ResourceTypes.MASTER_PAGE:
                subFolder += FileConnector.MasterpagesFolder;
                break;
            case ResourceTypes.FORM:
                subFolder += FileConnector.FormItemsFolder;
                break;
            case ResourceTypes.BINARY:
            case ResourceTypes.PAGE:
            case ResourceTypes.SYSTEM_PAGE:
            case ResourceTypes.UPLOAD:
                subFolder += FileConnector.ResourcesFolder;
                break;
            default:
                /* ERROR */
                break;
        }
        return subFolder;
    }

    public getResourceWithSlug(slug: string, ismasterpage:boolean=false): Promise<ICMSResource> {
        let fullPath = this.getDataSubFolder(ismasterpage?ResourceTypes.MASTER_PAGE:ResourceTypes.PAGE) + (slug === "" ? "_root":slug);
        return this.getJSONFile(fullPath);
    }

    public updateResource(resource: ICMSResource): Promise<any> {
        return this.createResource(resource);
    }

    public createResource(resource: ICMSResource): Promise<any>{
        return new Promise((resolve, reject) => {
            let slug = resource.slug === "" ? "_root" : resource.slug;
            fs.writeFile(this.getDataSubFolder(resource.resourceType  === ResourceTypes.MASTER_PAGE?ResourceTypes.MASTER_PAGE:ResourceTypes.PAGE) + slug, 
                JSON.stringify(resource) ,{ encoding: "utf8" }, 
                (error: any) => {   
                    if(error !== undefined) {
                        resolve(resource);
                    }
            });
        });
    }

    public getMasterPages(): Promise<ICMSResource[]> {
        let that = this;
        return new Promise( resolve => {
            fs.readdir(this.getDataSubFolder(ResourceTypes.MASTER_PAGE), (error, files) =>{
                let promise: any = Promise.resolve([]);        
                for(let idx in files) {
                    let filename: string = files[idx];
                    promise = promise.then((resources: any[]) =>
                        that.getResourceWithSlug(filename, true).then(resource => {
                            resources.push(resource);
                            return resources;
                        })
                    );
                }
                promise.then((resources:ICMSResource[]) => resolve(resources));
            });
        });
    }

    public getFormItemPromiseWithId(id: number): Promise<ICMSFormItem> {
        let fullPath = this.getDataSubFolder(ResourceTypes.FORM) + id;
        return this.getJSONFile(fullPath);
    }

    public getAllFormItems(datatype:string): Promise<ICMSFormItem[]> {
        let that = this;
        let formItemRootFolder: string = this.getDataSubFolder(ResourceTypes.FORM);
        return new Promise( (resolve, reject) => {
            fs.readdir(formItemRootFolder, (error, files) =>{
                let promise: any = Promise.resolve([]);        
                for(let idx in files) {
                    let fullFilepath: string = formItemRootFolder + files[idx];
                    promise = promise.then((formitems: any[]) =>
                        that.getJSONFile(fullFilepath).then(fileitem => {
                            formitems.push(fileitem);
                            return formitems;
                        })
                    );
                }
                promise.then((formitems:ICMSFormItem[]) => resolve(formitems.filter((formitem:ICMSFormItem) => formitem.dataType === datatype)));
            });
        });
    }

    public createFormItem(item: ICMSFormItem): Promise<ICMSFormItem> {
        return new Promise((resolve, reject) => {
            fs.readdir(this.getDataSubFolder(ResourceTypes.FORM), (error, files) => {
                item.id = files.length;
                fs.writeFile(this.getDataSubFolder(ResourceTypes.FORM) + item.id, 
                    JSON.stringify(item) ,{ encoding: FileConnector.DefaultEncoding }, 
                    (error: any) => {   
                        if(error !== undefined) {
                            resolve(item);
                        }
                });
            });
        });
    }

    public updateFormItem(item: ICMSFormItem): Promise<ICMSFormItem> {
         return new Promise((resolve, reject) => {
            fs.readdir(this.getDataSubFolder(ResourceTypes.FORM), (error, files) => {
                fs.writeFile(this.getDataSubFolder(ResourceTypes.FORM) + item.id, 
                    JSON.stringify(item) ,{ encoding: FileConnector.DefaultEncoding }, 
                    (error: any) => {   
                        if(error !== undefined) {
                            resolve(item);
                        }
                });
            });
        });
    }

    public deleteFormItemWithId(id: number): Promise<boolean> {
         return new Promise((resolve, reject) => {
            fs.unlink(this.getDataSubFolder(ResourceTypes.FORM) + id, (error) => 
                resolve(error !== undefined)
            );
        });
    }

    private getJSONFile(fullpath:string): Promise<any>{
         return new Promise((resolve, reject) => {
            fs.readFile(fullpath , 
                { encoding: FileConnector.DefaultEncoding }, 
                (error, data) => {   
                    if(error === null) {
                        resolve(JSON.parse(data));
                    } else {
                        resolve(undefined);
                    }
                }
            );
        });
    }

    public setupDatabase(): Promise<any> {
        this.createDirectory(this.dataFolder);
        this.createFileDatabase(this.dataFolder);
        return null;
    }


    private createDirectory(directory:string): void {
        if (!fs.existsSync(directory)){
            fs.mkdirSync(directory);
        } else {
            let files = fs.readdirSync(directory);
            for (let file of files) {
                fs.unlinkSync(directory + "/"+ file);
            }
        }
    }

    private createFileDatabase(folder: string): Promise<any> {
        let that = this;
        let objects: any = [];
        let counter: number = 0;
        let masterpageHelper:  number = 0;
        let landingpageHelper:  number = 0;

        that.createDirectory(folder + "/resources");
        that.createDirectory(folder + "/masterpages");
        that.createDirectory(folder + "/form_items");

        for (let name in RESOURCES_DATA) {
            let item = RESOURCES_DATA[name];
            let isBinary = (item && item.isBinary);

            let content: any = fs.readFileSync("./setup/default_pages/" + item.file, isBinary ? "binary" : "utf-8") || "";

            let resourceType: string = isBinary ? "binary" : ((item && item.resourceType) || "systempage");

            content = isBinary ? new Buffer(content, "binary").toString('base64') : content;

            if(name==="landingpage"){
                landingpageHelper = counter;
            }

            if(name==="masterpage"){
                masterpageHelper = counter;
            }

            let obj = new CMSResource((name===""?"_root":name), content);
            obj.id = counter;
            obj.resourceType = resourceType;
            obj.mimeType = item.mime;
            obj.parentResourceId = resourceType==="page"?(name===""?landingpageHelper: masterpageHelper):-1;

            objects.push(obj);
            counter++;
        }

        return new Promise( resolve =>
            that.writeFile(objects, folder).then(resolve)
        );
    }

    private writeFile(objects: any[], folder: string): Promise<any> {
        let that = this;
        let promise: Promise<any>;
        let obj = objects.pop();

        if (obj !== undefined) {
            promise = new Promise((resolve: any): void => {
                fs.writeFile(folder + "/"+ (obj.resourceType === "masterpage"? "masterpages": "resources") + "/" + obj.slug, JSON.stringify(obj), err => {
                    that.writeFile(objects, folder).then(resolve);
                });
            });
        }
        else {
            promise = Promise.resolve("DONE");
        }

        return promise;
    }
    
}