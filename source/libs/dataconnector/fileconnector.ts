import { IDataConnector, 
         DataResourceCallback, 
         DataFormItemCallback } from './dataconnector';

import { ICMSResource } from '../cmsresource';
import { ICMSFormItem } from '../cmsformitem';

import * as fs from 'fs';

export class FileConnector implements IDataConnector {

    constructor(private dataFolder: string) { }

    public getResourceWithSlug(slug: string, ismasterpage:boolean=false): Promise<ICMSResource> {
        return new Promise((resolve, reject) => {
            slug = slug===""?"_root":slug;
            console.info("slug", slug, ismasterpage);
            fs.readFile(this.dataFolder + (ismasterpage?"/masterpages/":"/resources/") + slug, { encoding: "utf8" }, (error, data) =>{   
                console.info("GET SLUG", slug, JSON.parse(data).slug)
                if(error !== undefined) {
                    console.info("+++++++++++++++");
                    resolve(JSON.parse(data));
                } else {
                    console.info("---------------");
                    reject(null);
                }
                
            })
        });
    }

    public updateResource(resource: ICMSResource): Promise<any> {
        return null;
    }

    public createResource(resource: ICMSResource): Promise<any>{
        return null;
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