import { ICMSResource } from '../cms/resource';
import { ICMSFormItem } from '../cms/formitem';

export type DataResourceCallback = (resource: ICMSResource[])=> void;
export type DataFormItemCallback = (formitem: ICMSFormItem[])=> void;

export interface IDataConnector {

    getResourceWithSlug(slug: string): Promise<ICMSResource>;
    updateResource(resource: ICMSResource): Promise<any>;
    createResource(resource: ICMSResource): Promise<any>;
    getMasterPages(): Promise<ICMSResource[]>;

    getFormItemPromiseWithId(id: number): Promise<ICMSFormItem>;
    getAllFormItems(datatype:string): Promise<ICMSFormItem[]>;
    createFormItem(item: ICMSFormItem): Promise<ICMSFormItem>;
    updateFormItem(item: ICMSFormItem): Promise<ICMSFormItem>;
    deleteFormItemWithId(id: number): Promise<boolean>;
   
}