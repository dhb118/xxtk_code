import { sys } from "cc";
import { DEBUG } from "cc/env";
import { IPacker } from "../mershall/IPacker";
import { SDO_Client_Msg } from "../MsgType";
import { Nullable } from "../Types";
import { USocket } from "../USocket";
import { IfaceConnector } from "./IConnector";
import { socketEvent } from "./SocketEvent";


/**
 * 常规通道
 *
 * @export
 * @class Connector
 * @implements {IConnector}
 */
export class PBConnector implements IfaceConnector {
	/**
	 * Socket
	 * @type {WebSocket}
	 * @memberof Connector
	 */
	public socket!: USocket;

	/**
	 * 打包器
	 *
	 * @type {IfacePacker}
	 * @memberof NormalConnector
	 */
	public packer!: IPacker;

	/**
	 * 业务消息packer
	 */
	public msgPacker: IPacker;

	/**
	 * 消息到达
	 *
	 * @param {MessageEvent} message
	 *
	 * @memberof Connector
	 */
	public onMessageReveived(message: Nullable<ArrayBuffer>): void {
		let msg = this.packer.doUnPack(message);
		// 业务交互固定协议
		if (msg && msg.type === SDO_Client_Msg.client_gs_forward_ack) {
			// msg = amf_readObject(msg.message.data.buffer);
			msg = this.msgPacker.doUnPack(msg.message.data.buffer);
		}
		if (msg !== void 0) {
			this.emit(`${msg.type}`, msg.message, message.byteLength);
		}
	}

	/**
	 * 全局发送一个事件
	 * 一般是当解包完毕之后调用
	 * @param type 消息类型
	 * @param datail 消息体
	 */
	protected emit(type: string, msg?: any, length?: number): void {
		let b = (length / 1024).toFixed(2)
		if (sys.browserType == sys.BrowserType.CHROME) {
			console.log(
				`%c ↓↓↓ ${type}[${b}kb] ↓↓↓ `,
				"padding: 2px; background-color: #333; color: #22dd22; border: 2px solid #22dd22; font-family: consolas;",
				msg
			);
		} else {
			if(DEBUG){
				console.log(`↓↓↓${type}[${b}kb] ↓↓↓`, msg);
			}
		}
		socketEvent.emit(type, msg);
	}

	/**
	 * 发送消息
	 *
	 * @param {MsgType} msgType 消息类型
	 * @param {*} msg 消息
	 * @param {Function} [callback] 回调
	 * @param {*} [callbackObj] 回调作用域
	 * @memberof NormalConnector
	 */
	public send(
		msgType: number,
		msg: any,
		callback?: Function,
		callbackObj?: any
	): void {
		// if (sys.browserType == sys.BrowserType.CHROME) {
		// 	log(
		// 		`%c ↑↑↑ ${msg && msg.constructor["MSGNAME"]}[${msgType}] ↑↑↑ `,
		// 		"padding: 2px; background-color: #1094e3; color: #dddd22; border: 2px solid #dddd22; font-family: consolas;",
		// 		msg
		// 	);
		// } else {
		// 	log(msg);
		// }
		const packer = this.packer;
		const output = this.socket.output;
		const eMsg = packer.doPack(msgType, msg);
		output.writeArrayBuffer(eMsg);
		this.socket.flush();
		output.clear();
	}

	/**
	 * 关闭socket
	 *
	 *
	 * @memberof Connector
	 */
	public close(): void {
		this.socket.close();
	}
}
