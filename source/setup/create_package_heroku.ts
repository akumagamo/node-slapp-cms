import * as fs from "fs";

const HEROKU_CONFIG_FILENAME = "./out/package.json";
let herokuPackageFile = require("../package.json");

delete herokuPackageFile.scripts;
delete herokuPackageFile.keywords;
delete herokuPackageFile.devDependencies;

herokuPackageFile.scripts = {
    "start" : "node app.js"
};

fs.unlink(HEROKU_CONFIG_FILENAME, function(exception : any) : void {
    fs.writeFile(HEROKU_CONFIG_FILENAME, JSON.stringify(herokuPackageFile) , function(innerexception : any){
        if(innerexception){
            throw innerexception;
        }
    });
});