import { Utils }  from '../utils';
import { ICMSFormItem, CMSFormItem } from './formitem';
import { IDataConnector, DataFormItemCallback } from '../dataconnector/dataconnector';

export class CMSFormItems {
    constructor(private connection: IDataConnector) { }

    getFormItemWithId(id: number): Promise<ICMSFormItem> {
        return this.connection.getFormItemPromiseWithId(id).then((formitem:ICMSFormItem) => {
            if(formitem!==undefined){
                if(typeof formitem.value === "string"){
                    formitem.value = JSON.parse(formitem.value);
                }
            }
            return formitem;
        });
    }

    deleteFormItemWithId(id: number): Promise<boolean> {
        return this.connection.deleteFormItemWithId(id);
    }

    getAllFormItems(datatype: string): Promise<ICMSFormItem[]> {
        return this.connection.getAllFormItems(datatype)
            .then((fs: ICMSFormItem[]) => fs.map(formitem => {
                if(typeof formitem.value ==="string"){
                    formitem.value = JSON.parse(formitem.value);
                }
                return formitem;
            }));
    }

    saveFormItem(formitem: ICMSFormItem): Promise<ICMSFormItem> {
        let that = this;
        return this.getFormItemWithId(formitem.id)
            .then((item:ICMSFormItem) => {
                if(item !== undefined) {
                    item.value = formitem.value;
                    item.modityDatetime = new Date();
                    return that.connection.updateFormItem(item);
                } else {
                    let form = new CMSFormItem(-1, formitem.dataType, formitem.value);
                    return that.connection.createFormItem(form);
                }    
            });
    }
    
}