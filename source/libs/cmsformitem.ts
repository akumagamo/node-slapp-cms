export interface ICMSFormItem {
    id: number;
    dataType: string; 
    value: any;
    createDatetime: Date;
    modityDatetime?: Date;
    deleteDatetime?: Date;
}

export class CMSFormItem implements ICMSFormItem {
    public createDatetime: Date;
    public modifyDatetime?: Date;
    public deleteDatetime?: Date;

    constructor(public id: number, public dataType: string, public value: any) {
        this.createDatetime = new Date();
    }
}