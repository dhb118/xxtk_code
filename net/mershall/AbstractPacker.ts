/* eslint-disable @typescript-eslint/no-explicit-any */
import { Nullable } from '../Types';
import { ITMsgObj } from './IPacker';

export abstract class AbstractPacker {
    public pack(msgType: number, data: any): Nullable<ArrayBuffer> {
        if (data === null || data === void 0) {
            throw 'pack data is null or undefined';
        }

        return this.doPack(msgType, data);
    }
    public unpack(data: ArrayBuffer): Nullable<ITMsgObj> {
        if (data === void 0) {
            throw 'unpack data is null or undefined';
        }

        return this.doUnPack(data);
    }
    protected abstract doPack(msgType: number, data: any): Nullable<ArrayBuffer>;
    protected abstract doUnPack(data: ArrayBuffer): Nullable<ITMsgObj>;
}
