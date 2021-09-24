import { AMF3Decode, AMF3Encode } from "../../../melon_runtime/AMF3";
import { Nullable } from "../Types";
import { IPacker, ITMsgObj, StreamX } from "./IPacker";

export class AMFPacker implements IPacker {

    amf3Decode = new AMF3Decode()
    amf3Encode = new AMF3Encode();
    stream = new StreamX();

    doUnPack(data: ArrayBuffer): Nullable<ITMsgObj> {
        const input = this.amf3Decode;
        input.clear();
        input.setArrayBuffer(data);
        const code = input.readUint16();
        const len = data.byteLength;
        this.stream.type = code;
        this.stream.len = len;
        this.stream.message = input.readObject();
        return this.stream;
    }

    doPack(msgType: number, data: any): Nullable<ArrayBuffer> {
        const output = this.amf3Encode;
        output.clear();
        output.position = 0;
        output.writeUint16(msgType);
        if (data) {
            output.writeObject(data);
        }
        return output.toArrayBuffer(output.position);
    }

}