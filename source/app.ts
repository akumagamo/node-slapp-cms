import * as http from 'http';
import { DatabaseConnector } from './libs/dataconnector/databaseconnector';
//import { FileConnector } from './libs/dataconnector/fileconnector';
import { CMSResources } from './libs/cmsresources';
import { CMSFormItems } from './libs/cmsformitems';
import { RequestHandler } from './libs/requesthandler';

const WEBSERVER_PORT = process.env.PORT || 80;
let databaseConnector = new DatabaseConnector();
//let databaseConnector = new FileConnector("file_data");
let cmsResources = new CMSResources(databaseConnector);
let cmsFormItems = new CMSFormItems(databaseConnector);
let requesthandler = new RequestHandler(cmsResources, cmsFormItems, true);

requesthandler.initialize().then(( ) => {
    console.info("Starting Webserver ...");
    http.createServer(requesthandler.handle.bind(requesthandler)).listen(WEBSERVER_PORT);
    console.info("Webserver running on port: " + WEBSERVER_PORT);
});