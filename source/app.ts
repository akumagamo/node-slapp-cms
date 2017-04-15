import * as http from 'http';
import { IDataConnector } from './libs/dataconnector/dataconnector';
import { DatabaseConnector } from './libs/dataconnector/databaseconnector';
import { FileConnector } from './libs/dataconnector/fileconnector';
import { CMSResources } from './libs/cms/resources';
import { CMSFormItems } from './libs/cms/formitems';
import { RequestHandler } from './libs/requesthandler';

const WEBSERVER_PORT = process.env.PORT || 80;
let connector: IDataConnector;

if(process.env.npm_package_at_slapps_connection === "file") {
    connector =  new FileConnector(process.env.npm_package_at_slapps_folder);
} else { 
    connector  = new DatabaseConnector();
}

let cmsResources = new CMSResources(connector);
let cmsFormItems = new CMSFormItems(connector);
let requesthandler = new RequestHandler(cmsResources, cmsFormItems, true);

requesthandler.initialize().then(( ) => {
    console.info("Starting Webserver ...");
    http.createServer(requesthandler.handle.bind(requesthandler)).listen(WEBSERVER_PORT);
    console.info("Webserver running on port: " + WEBSERVER_PORT);
});