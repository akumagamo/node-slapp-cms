import { IDataConnector, 
         DataResourceCallback, 
         DataFormItemCallback } from './dataconnector';

import { ICMSResource } from '../cmsresource';
import { ICMSFormItem } from '../cmsformitem';

import { CMSBase } from '../cmsbase';

import * as fs from 'fs';

let ResourceTypes = CMSBase.ResourceTypes;

export class FileConnector implements IDataConnector {

    constructor(private dataFolder: string) { }

    public getResourceWithSlug(slug: string, ismasterpage:boolean=false): Promise<ICMSResource> {
        return new Promise((resolve, reject) => {
            slug = slug === "" ? "_root":slug;
            fs.readFile(this.dataFolder + (ismasterpage?"/masterpages/":"/resources/") + slug, { encoding: "utf8" }, (error, data) =>{   
                if(error === null) {
                    resolve(JSON.parse(data));
                } else {
                    resolve(undefined);
                }
                
            })
        });
    }

    public updateResource(resource: ICMSResource): Promise<any> {
        return this.createResource(resource);
    }

    public createResource(resource: ICMSResource): Promise<any>{
        return new Promise((resolve, reject) => {
            let slug = resource.slug === ""?"_root":resource.slug;
            fs.writeFile(this.dataFolder + (resource.resourceType  === ResourceTypes.MASTER_PAGE ?"/masterpages/":"/resources/") + slug, 
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
            fs.readdir(this.dataFolder + "/masterpages", (error, files) =>{
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
        return null;
    }

    public getAllFormItems(datatype:string): Promise<ICMSFormItem[]> {
        return null;
    }

    public createFormItem(item: ICMSFormItem): Promise<ICMSFormItem> {
        return null;
    }

    public updateFormItem(item: ICMSFormItem): Promise<ICMSFormItem> {
        return null;
    }

    public deleteFormItemWithId(id: number): Promise<boolean> {
        return null;
    }
}