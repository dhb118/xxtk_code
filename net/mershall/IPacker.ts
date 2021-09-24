import { Nullable } from '../Types';

export interface ITMsgObj {
    message: any;
    type: number;
}

export class StreamX implements ITMsgObj {
    public message: any = null;
    public len: number = 0;
    public type: number = 0;
}

export interface IPacker {
    doPack(msgType: number, data: any): Nullable<ArrayBuffer>;
    doUnPack(data: ArrayBuffer): Nullable<ITMsgObj>;
}
