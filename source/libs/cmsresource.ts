import { CMSBase } from './cmsbase';

let ResourceTypes = CMSBase.ResourceTypes;
let MimeTypes = CMSBase.MimeTypes;

export interface ICMSResource {
    id: number;
    slug : string;
    mimeType : string;
    value : any;
    resourceType : string;
    parentResourceId? : number;
    publishFrom : Date;
    publishTo? : Date;
    createDateTime : Date;
    modifyDateTime? : Date;
    deleteDateTime? : Date;
}

export class CMSResource implements ICMSResource {
    public id: number;
    public mimeType : string;
    public resourceType : string;
    public parentResourceId? : number;
    public publishFrom : Date;
    public publishTo? : Date;
    public createDateTime : Date;
    public modifyDateTime? : Date;
    public deleteDateTime? : Date;

    constructor(public slug : string, public value : any) {
        this.mimeType = MimeTypes.HTML;
        this.resourceType = ResourceTypes.PAGE;
        this.parentResourceId = -1;
        this.publishFrom = new Date();
        this.createDateTime = new Date();
    }
}