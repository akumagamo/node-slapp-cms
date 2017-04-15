import * as http from 'http';
import * as url from 'url';
import * as querystring from 'querystring';
import * as stream from 'stream';
import * as zlib from 'zlib';

import { CMSResources } from './cms/resources';
import { CMSFormItems } from './cms/formitems';

import { ICMSFormItem, CMSFormItem } from './cms/formitem';
import { ICMSResource, CMSResource } from './cms/resource';
import { CMSBase } from './cms/base';

import { UserBase, IUser } from './userbase';

import { Utils } from './utils';

import * as fs from 'fs';

const IS_DEVELOPMENT_MODE: boolean = true;

let ResourceTypes = CMSBase.ResourceTypes;
let SystemPages = CMSBase.SystemPages;
let MimeType = CMSBase.MimeTypes;

const NO_SESSION = "";
/* hours * minutes * Seconds * milliseconds    */
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

export interface IRedirect {
    status: number;
    newLocation: string;
    sessionKey: string;
}

export class RequestHandler {

    public MasterPages: any = {};
    public static Sessions: any[] = [];
    public systemPages: any = {};

    constructor(public resourceLoader: CMSResources, public formItemsLoader: CMSFormItems, private develomentMode:boolean = false) { }

    private loadSystemPages(): Promise<any> {
        let that: RequestHandler = this;
        let keys = Object.keys(SystemPages);
        let promise: Promise<any> = Promise.resolve();
        
        for (let key of keys) {
            let slug: string = SystemPages[key];
            promise = promise
                .then(that.resourceLoader
                    .getResource(slug)
                    .then((resource: ICMSResource) => 
                        that.systemPages[slug] = resource
                    ) as any
                );
        }
        return promise;
    }

    private loadMasterpages(): Promise<any> {
        let that: RequestHandler = this;
        return that.resourceLoader
            .getMasterPages()
            .then((res: CMSResource[]) => {
                for(let r in res) {
                    let item = res[r];
                    that.MasterPages[item.id] = item;
                }
            });
    }

    public initialize(): Promise<any> {
        return this.loadMasterpages().then(this.loadSystemPages.bind(this));
    }

    public handle(request: http.ServerRequest, response: http.ServerResponse): void {
        let that: RequestHandler = this;
        let acceptedEncoding: string = request.headers["accept-encoding"];

        RequestHandler.sessionCleanup();

        let sessionKey: string = RequestHandler.getSessionKey(request);
        let hasValidSession: boolean = RequestHandler.isValidSession(sessionKey);
            
        that.getRequestedResource(request, sessionKey, hasValidSession)
            .then((resource: ICMSResource|any) =>  {
                if(resource.resourceType !== undefined) {
                    that.renderResource(request, response, acceptedEncoding, resource, sessionKey, hasValidSession);
                } else {
                    that.renderOutput(response, acceptedEncoding, resource)
                }
            })
            .catch((resource: ICMSResource| IRedirect) => {
                if((resource as IRedirect).status===302) {
                    let redirect: IRedirect = resource as IRedirect;
                    that.redirectTo(response, redirect.newLocation, redirect.sessionKey);
                } else {
                    Promise.resolve(this.systemPages[SystemPages.ERROR_NOT_FOUND])
                        .then((resource: ICMSResource) =>
                            that.renderResource(request, response, acceptedEncoding, resource, sessionKey, hasValidSession)
                        ).catch(( ) => that.renderCatchAllError(response));
                }
            });
    }

    private redirectTo(response: http.ServerResponse, newlocation: string, sessionkey: string): void {
        let options = { "Location": (newlocation === "" ? "/" : newlocation), "Set-Cookie": "session=" + sessionkey + "; HttpOnly" };
        if (sessionkey === NO_SESSION) {
            console.info("DELETE SESSION");
            delete options["Set-Cookie"];
        }
        response.writeHead(302, options);
        response.end();
    }

    private renderCatchAllError(response: http.ServerResponse): void {
        response.writeHead(500, { "Content-Type": "text/plain"});
        response.end("Internal Server Error!");
    }

    public getRequestedResource(request: http.ServerRequest, sessionKey: string, hasValidSession: boolean): Promise<ICMSResource> {
        let that: RequestHandler = this;
        let requestedUrl: url.Url = url.parse(request.url, true);
        let slug: string =  requestedUrl.pathname.split("/")[1];
        
        if(requestedUrl.path.indexOf("public") !== -1) {
            console.info(process.cwd(), __dirname, requestedUrl);
            return new Promise((resolve:any) =>{
                fs.readFile("." + requestedUrl.path, (error, data) => {
                    resolve(data);
                })
            });
        }

        if(requestedUrl.path.indexOf("?login") === -1)   {
            return that.resourceLoader.getResource(slug);
        }

        if(hasValidSession) {
            RequestHandler.logoutUser(sessionKey);
            return Promise.reject({status: 302, newLocation: "/", sessionKey: ""});
        }

        if(request.method === "GET") {
            return Promise.resolve(that.systemPages[SystemPages.LOGIN]);
        }

        return that.getPostData(request)
            .then((data: IUser) => {
                if (UserBase.isValidUser(data)) {
                    sessionKey = RequestHandler.loginUser();
                } else {
                    RequestHandler.logoutUser(sessionKey);
                }
                return Promise.reject({status: 302, newLocation: "/", sessionKey: sessionKey});      
        });   
    }

    public static logoutUser(sessionkey: string): void {
        RequestHandler.Sessions = 
            RequestHandler.Sessions.filter(item =>
                item.id !== sessionkey
            );
    }

    private static sessionCleanup(): void {
        let now: number = new Date().getTime();
        RequestHandler.Sessions = 
            RequestHandler.Sessions.filter((item: any) =>
                item.time + SESSION_TIMEOUT >= now
            );
    }

    public static loginUser(): string {
        let sessionKey: string = Utils.generateRandomId();
        RequestHandler.Sessions.push({id: sessionKey, time: new Date().getTime()});
        return sessionKey;
    }

    private static getSessionKey(request: http.ServerRequest): string {
        let cookie: string = request.headers.cookie;
        return typeof(cookie) === "string" ? cookie.split("=")[1] : "";
    }

    private static isValidSession(cookie: string): boolean {
        let session: any = RequestHandler.Sessions
            .find(session => 
                session.id === cookie && 
                session.time < (new Date().getTime() + SESSION_TIMEOUT)
            );
        if(session !== undefined){
            session.time = new Date().getTime();
            return true;
        }
        return false;
    }

    private setEncodingResponseHeader(response: http.ServerResponse, acceptedEncoding: string): stream.PassThrough {
        let encoder: stream.PassThrough = new stream.PassThrough();
        if (acceptedEncoding !== undefined && acceptedEncoding.match(/\bdeflate\b/)) {
            response.setHeader("content-encoding", "deflate");
            encoder = zlib.createDeflate();
        } else if (acceptedEncoding !== undefined && acceptedEncoding.match(/\bgzip\b/)) {
            response.setHeader("content-encoding", "gzip");
            encoder = zlib.createGzip();
        }
        return encoder;
    }

    private getResourceOutput(page: ICMSResource): (string | Buffer) {
        let displayData: (string | Buffer);
        switch (page.mimeType) {
            case MimeType.ICO:
            case MimeType.PNG:
            case MimeType.JPEG:
                displayData = new Buffer(page.value, "base64");
                break;
            case MimeType.HTML:
                if (page.parentResourceId > -1 && this.MasterPages[page.parentResourceId] !== undefined) {
                    displayData = this.MasterPages[page.parentResourceId].value
                        .replace(/\{value\}/gi, page.value)
                        .replace(/\{title\}/gi, page.slug);
                } else {
                    displayData = page.value;
                }
                break;
            default:
                displayData = page.value;
                break;
        }
        return displayData;
    }

    private renderResource(request: http.ServerRequest, response: http.ServerResponse, acceptedEncoding: string, resource: ICMSResource, sessionKey: string = "", validsession: boolean = true): void {
        let that: RequestHandler = this;
        let requestedUrl: url.Url = url.parse(request.url, true);
        let slug: string =  requestedUrl.pathname.split("/")[1];
        let requestMethod: string = request.method;
        let output: (string | Buffer);

        if(resource.mimeType === MimeType.HTML 
            || resource.mimeType === MimeType.JSON
            || resource.mimeType === MimeType.CSS
            || resource.mimeType === MimeType.JAVASCRIPT) {
            if(validsession && requestedUrl.path.indexOf("?edit") > -1) {
                if(requestMethod === "POST") {
                    this.getPostData(request).then((postdata: any) => {
                        let editedPage: ICMSResource = new CMSResource(slug, postdata.value);
                        Utils.assign(editedPage, postdata);
                        editedPage.mimeType = editedPage.resourceType === ResourceTypes.FORM ? MimeType.JSON : editedPage.mimeType;
                        editedPage.parentResourceId = parseInt(postdata.parentResourceId);
                        that.resourceLoader.saveResourcePromise(editedPage)
                            .then(() =>{
                                 that.redirectTo(response, slug, sessionKey) 
                            });
                    });
                    return;
                } else {
                    resource.mimeType = MimeType.HTML;
                    output = this.systemPages[SystemPages.EDIT].value
                        .replace(/{title}/gi, resource.slug)
                        .replace(/{labelValue}/gi, "Content")
                        .replace(/{labelResourceType}/gi, "Resource Type")
                        .replace(/{resourceType_([^}]*)}/gi,
                        (m: any, p: any) => p === resource.resourceType ? "selected" : "")
                        .replace(/{master_pages}/gi,
                        (m: any, p: any) => {
                            let options = "<option value='-1'>none</option>";
                            for(let idx in this.MasterPages){
                                let masterpage = this.MasterPages[idx];
                                options += `<option value='${masterpage.id}' ${(resource.parentResourceId===masterpage.id)?"selected":""}>${masterpage.slug}</option>`;
                            }
                            return options;
                        })
                        .replace(/{value}/gi, resource.value);
                }      
            } else if(validsession && requestedUrl.path.indexOf("?setting") > -1) {
                if(requestMethod === "POST"){
                     this.getPostData(request).then((postdata: any) => {
                        let masterpage: ICMSResource = new CMSResource(slug, postdata.value);
                        masterpage.mimeType = MimeType.HTML;
                        that.resourceLoader.saveResourcePromise(masterpage)
                            .then((newmaster:ICMSResource): void => { /***/
                                that.systemPages[SystemPages.MASTER_PAGE] = newmaster;
                                that.redirectTo(response, slug, sessionKey);
                            });
                    });
                    return;
                } else {
                    resource = undefined; //this.systemPages[SystemPages.MASTER_PAGE];
                    output = this.systemPages[SystemPages.EDIT].value
                        .replace(/{title}/gi, resource.slug)
                        .replace(/{labelValue}/gi, "Content")
                        .replace(/{labelResourceType}/gi, "Resource Type")
                        .replace(/{resourceType_([^}]*)}/gi,
                        (m: any, p: any) => p === resource.resourceType ? "selected" : "")
                        .replace(/{parentResourceId(-?\d)}/gi,
                        (m: any, p: any) => p == resource.parentResourceId ? "selected" : "")
                        .replace(/{value}/gi, resource.value);
                } 
            } else if(validsession && requestedUrl.path.indexOf("?upload") > -1) {
                if(requestMethod === "POST") {
                    this.getPostData(request).then(function (postdata: any) {
                        let upload = new CMSResource(postdata.slug, 
                            new Buffer(postdata.value, "binary").toString("base64")
                        );
                        upload.resourceType = ResourceTypes.BINARY;
                        upload.mimeType = postdata.mimeType;
                        
                        that.resourceLoader.saveResourcePromise(upload)
                            .then(function (page: ICMSResource) {
                            that.redirectTo(response, page.slug, sessionKey);
                        });
                    });
                    return;
                } else {
                    output = this.systemPages[SystemPages.UPLOAD].value;
                }
            } else if(resource.resourceType === ResourceTypes.FORM) {
                let OkResponse = {status:"ok"} ;
                let ErrorResponse = {status:"error"} ;
                let urlParts = requestedUrl.pathname.split("/");
                that.resourceLoader.getResource(slug)
                    .then((resource: ICMSResource) => {
                        if(resource !== undefined) {
                            try {    
                                let item = JSON.parse(resource.value); 
                                switch(requestMethod){
                                    case "GET":
                                        if (item === undefined || item.allow === undefined || item.allow.query !== true) {
                                            that.renderOutput(response, acceptedEncoding, JSON.stringify(ErrorResponse), MimeType.JSON);
                                            return;
                                        }
                                        if (urlParts.length === 3 && !isNaN(parseInt(urlParts[2]))) {
                                            let id = parseInt(urlParts[2]);
                                            that.formItemsLoader.getFormItemWithId(id)
                                                .then(function (formitem: ICMSFormItem) {
                                                    that.renderOutput(response, acceptedEncoding, JSON.stringify(formitem), MimeType.JSON);
                                                });
                                        } else {
                                            that.formItemsLoader.getAllFormItems(resource.slug)
                                            .then(function (formitems: ICMSFormItem[]) {
                                                that.renderOutput(response, acceptedEncoding, JSON.stringify(formitems), MimeType.JSON);
                                            });
                                        }
                                        break;
                                    case "POST":
                                        if (item === undefined || item.allow === undefined || item.allow.insert !== true) {
                                            that.renderOutput(response, acceptedEncoding, JSON.stringify(ErrorResponse), MimeType.JSON);
                                            return;
                                        }
                                        that.getPostData(request).then((postdata: any) => {
                                            let isValid = true;
                                            for(let idx in item.fields) {
                                                let field = item.fields[idx];

                                                isValid = postdata["value"].hasOwnProperty(field.name) &&
                                                    (new RegExp(field.validation)).test(postdata["value"][field.name]);
                                                
                                                if(!isValid) {
                                                    that.renderOutput(response, acceptedEncoding, JSON.stringify(ErrorResponse), MimeType.JSON);
                                                    return;
                                                }                                               
                                            }

                                            if (urlParts.length === 2) {
                                                let obj = new CMSFormItem(-1, slug, postdata.value);
                                                that.formItemsLoader.saveFormItem(obj)
                                                    .then((formitem: ICMSFormItem) => {
                                                        that.renderOutput(response, acceptedEncoding, JSON.stringify(OkResponse), MimeType.JSON);
                                                    });
                                            } else if(urlParts.length === 3 && !isNaN(parseInt(urlParts[2]))) {
                                                let obj = new CMSFormItem(parseInt(urlParts[2]), slug, postdata.value);
                                                that.formItemsLoader.saveFormItem(obj)
                                                    .then((formitem: ICMSFormItem) => {
                                                        that.renderOutput(response, acceptedEncoding, JSON.stringify(OkResponse), MimeType.JSON);
                                                    });
                                            } else {
                                                console.warn("NOT IMPLEMENTED");
                                                that.renderCatchAllError(response);
                                            }
                                        });
                                        break
                                    case "PUT":
                                        that.renderCatchAllError(response);
                                        break;
                                    case "DELETE":
                                        if (item === undefined || item.allow === undefined || item.allow.delete !== true) {
                                            that.renderOutput(response, acceptedEncoding, JSON.stringify(ErrorResponse), MimeType.JSON);
                                            return;
                                        }
                                        if (urlParts.length === 3 && !isNaN(parseInt(urlParts[2]))) {
                                            let id = parseInt(urlParts[2]);
                                            that.formItemsLoader.deleteFormItemWithId(id)
                                                .then(function (success: boolean) {
                                                    that.renderOutput(response, acceptedEncoding, JSON.stringify(OkResponse), MimeType.JSON);
                                                });
                                        } else {
                                            that.renderOutput(response, acceptedEncoding, JSON.stringify(ErrorResponse), MimeType.JSON);
                                        }
                                        break;
                                }        

                            } catch (error) {
                                that.renderOutput(response, acceptedEncoding, JSON.stringify(ErrorResponse), MimeType.JSON);
                            }
                        }
                    });
                    return;
            } else {
                output = (this.getResourceOutput(resource) as string)
                    .replace(/<\/body>/, that.systemPages[SystemPages.ADDIN_PAGE_IS_LOADED].value)
                    .replace(/{isloggedin}/, validsession.toString());
                if (validsession) {
                    output = (output as string).replace(/<\/body>/, that.systemPages[SystemPages.ADDIN_BACKEND_BUTTONS].value);
                }
            }
        } else {
            output = this.getResourceOutput(resource)
        }
        this.renderOutput(response, acceptedEncoding, output, resource.mimeType);
    }

    private renderOutput(response: http.ServerResponse, acceptedEncoding: string, output: (string | Buffer), mimetype?: string): void {
        let outputStream: stream.Readable = new stream.Readable();
        let encoder: stream.PassThrough = this.setEncodingResponseHeader(response, acceptedEncoding);
        
        if(mimetype!==undefined){
            response.setHeader("content-type", mimetype);
        }
        outputStream.push(output);
        outputStream.push(null);
        outputStream.pipe(encoder).pipe(response);
    }

    private getPostData(request: http.ServerRequest): Promise<any> {
        let that: RequestHandler = this;
        let postData: any[] = [];
        let resultObject: any = {};
        return new Promise((resolve: any, reject: any): void => {
            request.on("data", (data: string | Buffer) => {
                postData.push(data);
                if (postData.length > 1e10) {   // Throw some Error
                    request.connection.destroy();
                    reject("File is to large! file-size: " + postData.length.toString());
                }
            }).on("end", () => {
                let requestContentType: string[] = request.headers["content-type"].split(";");
                let stringPostData: string = postData.join("");

                if (requestContentType[0] === "multipart/form-data") {
                    let boundary: string = "--" + requestContentType[1].replace(/\s*boundary=/, "");
                    let contentLength: number = parseInt(request.headers["content-length"]);
                    let multipartData: any = Utils.processDataChunks(Buffer.concat(postData).slice(0, contentLength), boundary);

                    resultObject["mimeType"] = multipartData["upload"]["header"]["content-type"];
                    resultObject["resourceType"] = ResourceTypes.UPLOAD;
                    resultObject["value"] = multipartData["upload"]["body"];
                    resultObject["slug"] = multipartData["value"]["body"];

                } else if (requestContentType[0] === "application/json") {
                    resultObject = JSON.parse(stringPostData);
                } else {
                    resultObject = querystring.parse(stringPostData);
                }
                resolve(resultObject);
            });
        });
    }
}