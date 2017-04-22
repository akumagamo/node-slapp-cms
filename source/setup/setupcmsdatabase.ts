import * as pg from 'pg';
import * as fs from 'fs';

import { CMSResource } from '../libs/cms/resource';


const CREATE_TABLE_FILE = "./setup/sql/setup-create-table.sql";
const EXTRA_DATA: { [key: string]: any } = {
    /*"slug" : "filename"*/

    "_login": { file: "_login.html", mime: "text/html" },
    "_edit": { file: "_edit.html", mime: "text/html" },
    "_addin_page_is_loaded": { file: "_pageloaded.html", mime: "text/html" },
    "_addin_backend_buttons": { file: "_backend.html", mime: "text/html" },
    "_upload": { file: "_upload.html", mime: "text/html" },
    "_error_not_found": { file: "_not_found.html", mime: "text/html" },
    "_error": { file: "_error.html", mime: "text/html" },

    "_close.svg": { file: "images/close.svg", mime: "image/svg+xml" },
    "_open.svg": { file: "images/open.svg", mime: "image/svg+xml" },
    "_edit.svg": { file: "images/edit.svg", mime: "image/svg+xml" },
    "_settings.svg": { file: "images/settings.svg", mime: "image/svg+xml" },
    "_upload.svg": { file: "images/upload.svg", mime: "image/svg+xml" },
    "_save.svg": { file: "images/save.svg", mime: "image/svg+xml" },

    "_backend.css": { file: "styles/backend.css", mime: "text/css" },
    "_backend.js": { file: "scripts/backend.js", mime: "text/javascript" },
    "touch.js": { file: "scripts/touch.js", mime: "text/javascript" },

    "favicon.ico": { file: "images/favicon.ico", mime: "image/x-icon", isBinary: true },
    "landingpage": { file: "landingpage.html", mime: "text/html", resourceType: "masterpage" },
    "masterpage": { file: "masterpage.html", mime: "text/html", resourceType: "masterpage" },
    "master.css": { file: "styles/masterpage/master.css", mime: "text/css" },
    "customizable.png": { file: "images/masterpage/customizable.png", mime: "image/png", isBinary: true },
    "forms.png": { file: "images/masterpage/forms.png", mime: "image/png", isBinary: true },
    "logo.png": { file: "images/masterpage/logo.png", mime: "image/png", isBinary: true },
    "mobile.png": { file: "images/masterpage/mobile.png", mime: "image/png", isBinary: true },
    "social.png": { file: "images/masterpage/social.png", mime: "image/png", isBinary: true },
    "background.png": { file: "images/masterpage/background.png", mime: "image/png", isBinary: true },
    "empty.png": { file: "images/masterpage/empty.png", mime: "image/png", isBinary: true },
    "database.png": { file: "images/masterpage/database.png", mime: "image/png", isBinary: true },
    "file.png": { file: "images/masterpage/file.png", mime: "image/png", isBinary: true },
    "article_0.jpg": { file: "images/masterpage/article_0.jpg", mime: "image/jpeg", isBinary: true },
    "article_1.jpg": { file: "images/masterpage/article_1.jpg", mime: "image/jpeg", isBinary: true },
    "article_2.jpg": { file: "images/masterpage/article_2.jpg", mime: "image/jpeg", isBinary: true },
    "article_3.jpg": { file: "images/masterpage/article_3.jpg", mime: "image/jpeg", isBinary: true },
    "": { file: "root.html", mime: "text/html", resourceType: "page" },
    "test-form": { file: "_test_form", mime: "application/json", resourceType: "form"  },
    "test-form-ui": { file: "_test_form_ui.html", mime: "text/html", resourceType: "page"  }

};

export class SetupCMSDatabase {
    private dbClient: any;
    constructor(private useDatabase:boolean, private fileDatabaseFolder?:string) { }

    public start(): Promise<any> {
        let that = this;
        let promise: Promise<any>;
        if(this.useDatabase){
            promise = new Promise( (resolve: any, reject: any): void => {
                this.dbClient = new pg.Client(process.env.DATABASE_URL);
                this.dbClient.connect(function connectToDatabase(err: Error) {
                    if (err) {
                       reject("Error onConnecting", err);
                    } else {
                        resolve("Connection Successful");
                    }
                });
            })
            .then(that.createDatabase.bind(that))
            .then(that.insertResources.bind(that));
        } else {
            promise = new Promise( (resolve: any, reject: any): void  => {
                that.createFileDatabase(that.fileDatabaseFolder)
                    .then(resolve);
            });
        }

        return promise;
    }

    private executeSQLCommand(sqlcommand: string, parameters: any[]): Promise<any> {
        let that = this;
        return this.dbClient.query(sqlcommand, parameters);
    }

    private createDatabase(): Promise<any> {
        let that = this;
        let sqlCommand = fs.readFileSync(CREATE_TABLE_FILE, "utf-8");
        return this.executeSQLCommand(sqlCommand, []);
    }

    private insertResources(): Promise<any> {
        return this.executeSQLCommand(this.createInsertResourcesText(), []);
    }

    private createInsertResourcesText(): string {
        let sqlCommand = `DELETE FROM cms_form_items;
                          DELETE FROM cms_resources;
                          ALTER SEQUENCE cms_form_items_id_seq  RESTART WITH 1;
                          ALTER SEQUENCE cms_resources_id_seq  RESTART WITH 1;`;

        for (let name in EXTRA_DATA) {
            let item = EXTRA_DATA[name];
            let isBinary = (item && item.isBinary);

            let content: any = fs.readFileSync("./setup/default_pages/" + item.file, isBinary ? "binary" : "utf-8") || "";

            let resourceType: string = isBinary ? "binary" : ((item && item.resourceType) || "systempage");

            content = isBinary ? new Buffer(content, "binary").toString('base64') : content.replace(/'/gi, "''");

            sqlCommand += `insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
                           values ('${name}', '${item.mime}', '${content}', '${resourceType}', null);\r\n`;
        }

        sqlCommand += `UPDATE cms_resources AS u SET parent_resource_id = x.id
                       FROM cms_resources AS x WHERE u.resource_type='page' AND x.slug='landingpage';`

        return sqlCommand;
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

        for (let name in EXTRA_DATA) {
            let item = EXTRA_DATA[name];
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

if(process.argv.length === 3 && (process.argv[2] === "true")){
    let setupDatabase = new SetupCMSDatabase(true);
    setupDatabase.start().then(x => {
        console.info("Datenbank erstellt!");
        process.exit();
    });
} else if(process.argv.length === 4 && (process.argv[2] === "false")){
    let setupDatabase = new SetupCMSDatabase(false, process.argv[3]);
    setupDatabase.start().then(x => {
        console.info("FileDatenbank erstellt!");
        process.exit();
    });
} else {
    console.info("Programm wurde nicht korrekt aufgerufen!");
}
