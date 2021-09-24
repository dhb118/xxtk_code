import { AMF3Encode } from "../../../melon_runtime/AMF3";
import { singleton } from "../../../melon_runtime/ClassUtils";
import { ByteArray } from "../../../melon_runtime/utils/ByteArray";
import { Endian } from "../../../melon_runtime/utils/EgretByte";
import { PBUtils } from "../../../melon_runtime/utils/ProtoBuff";
import { protol_cm_kv, protol_sm_kv } from "../MsgType";
import { Nullable } from "../Types";
import { IPacker, StreamX } from "./IPacker";

export class PBPacker implements IPacker {

    private amf3Encode = singleton(AMF3Encode);
    private byte = new ByteArray();
    private _endian = false;

    constructor() {
        this.endian = this._endian;
    }

    set endian(value: boolean) {
        this._endian = value;
        this.byte.endian = value ? Endian.LITTLE_ENDIAN : Endian.BIG_ENDIAN;
    }

    doUnPack(data: ArrayBuffer): Nullable<StreamX> {
        if (!data) return;

        const input = this.byte;
        input.replaceBuffer(data);
        input.position = 0;

        const code = input.readUnsignedShort();
        const flag = input.readByte();
        const datalen = input.readUnsignedShort();
        const protocode = protol_sm_kv[code];

        let stream: StreamX;
        if (undefined != protocode) {
            stream = new StreamX();
            stream.type = code;
            stream.len = data.byteLength;

            if (!flag) {
                stream.message = PBUtils.readFrom(protocode, input, datalen);
            } else {
                const uint8Array = (input.readByteArray(datalen) as ByteArray).outBytes;
                const bytes = new Zlib.Inflate(uint8Array).decompress();
                stream.message = PBUtils.readFrom(protocode, new ByteArray(bytes), bytes.length);
            }
        }

        return stream;
    }

    doPack(msgId: number, data: any): Nullable<ArrayBuffer> {
        const { byte, amf3Encode, _endian } = this;
        const code = msgId;
        const proto = protol_cm_kv[msgId];
        const value = data;

        byte.reset();
        let buffer: ArrayBuffer;
        if (value) {
            buffer = PBUtils.writeTo(value, proto).buffer;
        }

        amf3Encode.clear();
        //msgcode 16
        amf3Encode.writeUint16(code, _endian);
        //flag 8
        amf3Encode.writeByte(0);
        //len;
        if (buffer) {
            amf3Encode.writeUint16(buffer.byteLength, _endian);
            amf3Encode.writeByteArray(new Uint8Array(buffer));
        }

        return amf3Encode.toArrayBuffer();
    }

}