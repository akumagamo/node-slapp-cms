import { ICMSResource, CMSResource } from './cmsresource';
import { IDataConnector, DataResourceCallback } from './dataconnector/dataconnector';

export class CMSResources {
    constructor(private connection: IDataConnector) { }

    saveResourcePromise(resource: ICMSResource): Promise<any>{
        let that = this;
        return this.getResource(resource.slug)
            .then(function (getresource : ICMSResource): Promise<any> {                
                if (getresource !== undefined) {
                    getresource.parentResourceId = resource.parentResourceId;
                    getresource.value = resource.value;
                    getresource.publishFrom = resource.publishFrom;
                    getresource.publishTo = resource.publishTo;
                    getresource.modifyDateTime = new Date();
                    return that.connection.updateResource(getresource);
                } else {
                    getresource = new CMSResource(resource.slug, resource.value);
                    getresource.mimeType = resource.mimeType;
                    getresource.parentResourceId = resource.parentResourceId;
                    getresource.publishFrom = resource.publishFrom;
                    getresource.publishTo = resource.publishTo;
                    getresource.resourceType = resource.resourceType;
                    return that.connection.createResource(getresource);
                } 
            });
    }

    getResource(slug: string): Promise<ICMSResource> {
        return this.connection.getResourceWithSlug(slug);
    }

    getMasterPages(): Promise<ICMSResource[]>{
        return this.connection.getMasterPages();
    }
}