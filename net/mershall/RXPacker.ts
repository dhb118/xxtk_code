import { error } from "cc";
import { Byte } from "../Byte";
import { Nullable } from "../Types";
import { IPacker } from "./IPacker";
const cSignFlagMask: number = 0xfffc;
const cSignFlag: number = 0x6d98;
const typeUTF8 = "UTF8String";

class ProtocolHeadWriter {
    public isValid: boolean = false;
    public shortLenMode!: boolean;
    public shortClassId!: boolean;
    public headerLength!: number;
    public startPos!: number;
}

class ProtocolHeaderReader {
    public isValid: boolean = false;
    public headerLength: number = 0;
    public classId: number = 0xFFFFFFFF;
	public dataLength: number = 0;
	public offset: number = 0; //当前的offset位置
}

/**
 * 协议约束
 */
export abstract class NetProtocl {
	/**
	 * 协议ID
	 */
	public static MSGID: number;

	/**
	 * 协议名称
	 */
	public static MSGNAME: string;

	/**
	 * 深度拷贝
	 */
	public abstract clone(): NetProtocl;

	/**
	 * 获取协议原始数据
	 */
	public abstract getMatedata(): Array<Array<string>>;
}

export default class RXPacker implements IPacker {
	public doPack(msgType: number, data: NetProtocl): Nullable<ArrayBuffer> {
		const output = new Byte(16);
		output.endian = Byte.LITTLE_ENDIAN;
		const header = this.writeDataHeader(msgType, output);
		if (!header || !header.isValid) {
			throw new Error("pack message error:" + msgType);
		}
		try {
			this.writeDataBody(data, output, header);
		} catch (e) {
			console.error(e);
			return void 0;
		}
		return output.buffer.slice(0, output.pos);
	}

	public doUnPack(
		data: ArrayBuffer
	): Nullable<{ type: number; message: Nullable<NetProtocl> }> {
		if (!data) {
			return;
		}

		const length = data.byteLength;
		if (length < 6) return void 0;
		const byte = new Byte(data);
		byte.endian = Byte.LITTLE_ENDIAN;
		const header = this.readDataHead(byte, length);
		if (!header) return void 0;
		if (!header.isValid || length < header.dataLength) {
			console.error("读取数据头错误");
			return void 0;
		}
		const inst = this.readDataBody(byte, header);
		return {
			type: header.classId,
			message: inst,
		};
	}

	private writeDataBody(
		inst: NetProtocl,
		byte: Byte,
		header: ProtocolHeadWriter
	): any {
		const offset = byte.pos;

		const members = inst.getMatedata && inst.getMatedata();

		function warite(type: string, member: string, packer: RXPacker): void {
			if (!type) throw new TypeError(`member:${member} define type is null`);
			const isArray = type.endsWith("[]");
			isArray && (type = type.replace("[]", ""));
			const isBool = type === "bool";
			isBool && (type = "Uint8");
			packer.writeDataBodyArrayType(inst, member, type, byte, isArray, isBool);
		}

		if (members) {
			for (const member of members) {
				const name = member[0];
				const type = member[1];
				warite(type, name, this);
			}
		}

		this.updateDataLength(byte.pos - header.startPos, header, byte);

		if (!header.isValid) {
			const tRegRttiData = GProtocol.getDataClassByName(
				inst.constructor["MSGNAME"]
			);
			if (tRegRttiData) {
				byte.pos = offset;
				if (!tRegRttiData.bigData) {
					tRegRttiData.bigData = true;
					this.writeDataBody(inst, byte, header);
				}
			}
		}
	}

	private updateDataLength(
		dataLen: number,
		head: ProtocolHeadWriter,
		byte: Byte
	): void {
		if (!head.isValid) return;
		let idx = head.startPos + 2 + 2;

		const pos = byte.pos;
		if (!head.shortClassId) idx += 2;
		if (head.shortLenMode) {
			if (dataLen > 0xffff) {
				head.isValid = false;
				return;
			}
			byte.pos = idx;
			byte.writeUint16(dataLen);
		} else {
			byte.pos = idx;
			byte.writeUint32(dataLen);
		}
		byte.pos = pos;
	}

	private writeDataBodyArrayType(
		inst: NetProtocl,
		member: string,
		type: string,
		byte: Byte,
		isArray: boolean,
		isBool: boolean
	): void {
		if (!isArray) {
			this.writeDataBodyNotArrayType(inst, member, type, byte, isBool);
		} else {
			let values = inst[member] as [];
			if (values === null || values === void 0) {
				values = [];
			}

			const length = values.length;
			byte.writeUint32(length);
			for (let i = 0; i < length; i++) {
				this.writeDataBodyNotArrayType(values[i], null, type, byte, false);
			}
		}
	}

	private writeDataBodyNotArrayType(
		inst: NetProtocl,
		member: Nullable<string>,
		type: string,
		byte: Byte,
		isBool: boolean
	): void {
		//@ts-ignore 后续优化为静态
		const func = byte[`write${type}`] as Function;
		if (func) {
			let value = member ? inst[member] : inst;
			if ((value === null || value === void 0) && type !== typeUTF8) {
				value = 0;
			} else if ((value === null || value === void 0) && type === typeUTF8) {
				value = "";
			}
			if (isBool) {
				if (value === null || value === void 0) value = false;
				value = value === true ? 1 : 0;
			}
			value = func.call(byte, value);
		} else {
			const tRegRttiData = GProtocol.getDataClassByName(type);

			if (tRegRttiData) {
				const header = this.writeDataHeader(tRegRttiData.classId, byte);
				if (!header || !header.isValid) {
					throw new Error("pack message error:" + tRegRttiData.classId);
				}

				if (!inst[member!]) {
					this.writeDataBody(inst, byte, header);
					return;
				}

				this.writeDataBody(inst[member!], byte, header);
			} else {
				throw new Error("pack message error:" + type);
			}
		}
	}

	private writeDataHeader(
		clazzId: number,
		byte: Byte
	): Nullable<ProtocolHeadWriter> {
		const header = new ProtocolHeadWriter();
		let sign = cSignFlag;
		const classId = clazzId;
		const tRegRttiData = GProtocol.getDataClassByID(classId);
		if (!tRegRttiData) {
			return void 0;
		}
		header.shortClassId = clazzId <= 0xffff;
		header.shortLenMode = !tRegRttiData.bigData;
		header.headerLength = 6;
		header.startPos = byte.pos;
		if (!header.shortClassId) {
			sign |= 1;
			header.headerLength += 2;
		}
		if (!header.shortLenMode) {
			sign |= 2;
			header.headerLength += 2;
		}
		byte.writeUint16(sign);
		if (header.shortClassId) {
			byte.writeUint16(classId);
		} else {
			byte.writeUint32(classId);
		}
		if (header.shortLenMode) {
			byte.writeUint16(0);
		} else {
			byte.writeUint32(0);
		}
		header.isValid = true;
		return header;
	}

	private readDataBody(
		byte: Byte,
		header: ProtocolHeaderReader
	): Nullable<any> {
		const classId = header.classId;
		const tRegRttiData = GProtocol.getDataClassByID(classId);
		if (!tRegRttiData) return;

		function read(
			type: string,
			member: string,
			packer: RXPacker,
			inst: NetProtocl,
			header: ProtocolHeaderReader
		): void {
			if (!type) throw new TypeError(`member:${member} define type is null`);
			const isArray = type.endsWith("[]");
			isArray && (type = type.replace("[]", ""));
			const isBool = type === "bool";
			isBool && (type = "Uint8");
			packer.readDataBodyArrayType(
				inst,
				member,
				type,
				byte,
				isArray,
				isBool,
				header
			);
		}

		const inst =
			(GProtocol.getCache(classId) as NetProtocl) ||
			(new tRegRttiData.clazz() as NetProtocl);
		const members = inst.getMatedata && inst.getMatedata();
		try {
			for (const member of members) {
				if (header.offset >= header.dataLength - header.headerLength) {
					break;
				}
				const name = member[0];
				const type = member[1];
				if (type === "any" || type === "any[]") {
					error(`${classId} 存在any类型无法解析，需要定义类型!`);
					return;
				}
				read(type, name, this, inst, header);
			}
		} catch (e) {
			error(`${classId}无法解析错误`, e);
			return null;
		}

		return inst;
	}

	private readDataBodyArrayType(
		inst: NetProtocl,
		member: string,
		type: string,
		byte: Byte,
		isArray: boolean,
		isBool: boolean,
		header: ProtocolHeaderReader
	): void {
		if (!isArray) {
			const value = this.readDataBodyNotArrayType(type, byte, isBool, header);
			inst[member] = value;
		} else {
			const listSize = byte.getUint32();
			header.offset += 4;
			inst[member] = [];
			for (let i = 0; i < listSize; i++) {
				const value = this.readDataBodyNotArrayType(type, byte, isBool, header);
				inst[member].push(value);
			}
		}
	}

	private readDataBodyNotArrayType(
		type: string,
		byte: Byte,
		isBool: boolean,
		header: ProtocolHeaderReader
	): any {
		//@ts-ignore TODO
		// 动态改静态
		// 方便V8优化字节码
		const func = byte[`get${type}`] as Function;
		if (func) {
			const oldByteLen = byte.pos;
			let value = void 0;
			value = func.call(byte);
			if (isBool) {
				//@ts-ignore
				value = value === 1 ? true : false;
			}
			header.offset += byte.pos - oldByteLen;
			return value;
		} else {
			const subHeader = this.readDataHead(byte, byte.length - byte.pos);
			if (subHeader) {
				const subData = this.readDataBody(byte, subHeader);
				header.offset += subHeader.dataLength;
				return subData;
			} else {
				console.error("head error type:",type," header:",header);
			}
		}
	}

	private readDataHead(
		byte: Byte,
		length: number
	): Nullable<ProtocolHeaderReader> {
		let sign: number;
		sign = byte.getUint16();
		if ((sign & cSignFlagMask) !== cSignFlag) {
			return void 0;
		}
		const header = new ProtocolHeaderReader();
		header.dataLength = 6;
		header.headerLength = 6; // 2 + ClassIdSize + DataLenSize
		if ((sign & 1) === 1) {
			header.headerLength += 2;
			header.classId = byte.getUint32();
		} else {
			header.classId = byte.getUint16();
		}

		if ((sign & 2) === 2) {
			if (length < 4) return void 0;
			header.headerLength += 2;
			header.dataLength = byte.getUint32();
		} else {
			if (length < 2) return void 0;
			header.dataLength = byte.getUint16();
		}
		if (header.dataLength >= header.headerLength) header.isValid = true;
		return header;
	}
}
