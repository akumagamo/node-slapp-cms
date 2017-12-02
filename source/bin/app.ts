import * as http from 'http';
import * as fs from 'fs';

import { IDataConnector } from '../libs/dataconnector/dataconnector';
import { DatabaseConnector } from '../libs/dataconnector/databaseconnector';
import { FileConnector } from '../libs/dataconnector/fileconnector';
import { CMSResources } from '../libs/cms/resources';
import { CMSFormItems } from '../libs/cms/formitems';
import { RequestHandler } from '../libs/requesthandler';

const DEPLOY_FOLDER = "../out";

let packageJson = require('../package.json');

class App {

    private connector: IDataConnector;

    public handleCommandLineCall(command: string, type: string, folder?: string): void {
        try {
            
            if(!this.isValidEnvocation(command, type, folder)) {
                throw Error ("Invalid Invocation");
            }

            console.info("Command Arguments:", command, type, folder);

            if(command === "run") {
                console.info("Starting Webserver ");
                this.startWebserver(type, folder);
            } else if(command === "setup") {
                console.info("Starting Setup ");
                if(type === "file") {
                    console.info("\tFILE ");
                    this.connector = new FileConnector(folder);
                } else if(type === "database") {
                    console.info("\tDATABASE ");
                    this.connector = new DatabaseConnector(process.env.DATABASE_URL);
                } else {
                    throw Error ("Invalid Type");
                }
                this.connector.setupDatabase().then(
                    x => process.exit()
                );
            } else if(command === "deploy") {
                this.deploy();
            } else {
                throw Error ("Invalid Command");
            }
           
        } catch (error) {
            console.info(error.message);
        }
    }

    private deleteDirectory(directory: string, deleteparent: boolean): void {
        let that = this;
        let files = fs.readdirSync(directory);

        for(let file of files) {
            if(fs.statSync(directory + "/" + file).isDirectory()) {
                that.deleteDirectory(directory + "/" + file, true);
            } else {
                that.deleteFile(directory + "/" + file);
            }
        }
        if(deleteparent){
            fs.rmdirSync(directory);
        }
    }

    private deleteFile(file: string): void {
        fs.unlinkSync(file);
    }

    private createDirectory(directory: string): void {
        if(!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
    }

    private copyFile(source: string, destination: string): void {
        let that = this;
        let dir = (/^[^\/]*\/(.*)(?=\/[^\/]+$)/gi.exec(destination)[0]);

        dir.split("/").reduce( (p: any, c: any): any => { 
            let directory = p + (p !==""? "/" :"") + c;
            that.createDirectory(directory);
            return directory;
        }, "");
  
        fs.createReadStream(source).pipe(fs.createWriteStream(destination));
    }

    private copyFiles(source: string, destination: string): void {
        let files = fs.readdirSync(source);

        for(let file of files) {
            let currentFile = source + "/" + file;
            if(fs.statSync(currentFile).isDirectory()){
                if(/(\.\/bin)|(\.\/libs)|(\.\/setup)/.test(currentFile)) {
                    this.copyFiles(currentFile, destination + "/" + file );
                }
            } else {
                if(!/\.?(ts)|(map)|(npmignore)|(gitignore)|(package.json)$/.test(file)){
                    this.copyFile(currentFile, destination + "/" + file);
                }
            }
        }
    }

    public deploy(): void {
        this.deleteDirectory(DEPLOY_FOLDER, false);
        this.copyFiles(".", DEPLOY_FOLDER);

        let deploy_file = DEPLOY_FOLDER + "/package.json";
        
        let newPackage: any = {
            "scripts" : {"start": "node bin/app.js run database"}
        }

        newPackage.name = packageJson.name;
        newPackage.version = packageJson.version;
        newPackage.dependencies = packageJson.dependencies;

        fs.writeFile(deploy_file, JSON.stringify(newPackage) , function(innerexception: any){
            if(innerexception) {
                throw innerexception;
            }
        });

    }

    public isValidEnvocation(command: string, type: string, folder: string): boolean {
        return new RegExp("run").test(command) || 
            new RegExp("deploy").test(command) || 
            (new RegExp("setup").test(command) && 
            (new RegExp("database").test(type)  ||
            (new RegExp("file").test(type)  && folder !== undefined)));
    }

    public startWebserver(mode: string, folder: string): void {
        let webserverPort = process.env.PORT || 80;
        
        this.connector = 
            mode === "file" ? 
            new FileConnector(folder) : 
            new DatabaseConnector(process.env.DATABASE_URL);

        let cmsResources = new CMSResources(this.connector);
        let cmsFormItems = new CMSFormItems(this.connector);
        let requesthandler = new RequestHandler(cmsResources, cmsFormItems, true);

        requesthandler.initialize().then(( ) => {
            http.createServer(requesthandler.handle.bind(requesthandler)).listen(webserverPort);
            console.info("Webserver running on port: " + webserverPort);
        });
    }
}

let app = new App();

app.handleCommandLineCall(process.argv[2],process.argv[3], process.argv[4]);