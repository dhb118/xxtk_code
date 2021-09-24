import { log, sys } from "cc";
import { DEBUG } from "cc/env";
import { IPacker } from "../mershall/IPacker";
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
export class NormalConnector implements IfaceConnector {
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
	 * 消息到达
	 *
	 * @param {MessageEvent} message
	 *
	 * @memberof Connector
	 */
	public onMessageReveived(message: Nullable<ArrayBuffer>): void {
		const msg = this.packer.doUnPack(message);
		if (msg !== void 0) {
			this.emit(`${msg.type}`, msg.message);
		}
	}

	/**
	 * 全局发送一个事件
	 * 一般是当解包完毕之后调用
	 * @param type 消息类型
	 * @param datail 消息体
	 */
	protected emit(type: string, msg?: any): void {
		if (sys.browserType == sys.BrowserType.CHROME) {
			log(
				`%c ↓↓↓ ${msg && msg.constructor["MSGNAME"]}[${type}] ↓↓↓ `,
				"padding: 2px; background-color: #333; color: #22dd22; border: 2px solid #22dd22; font-family: consolas;",
				msg
			);
		} else {
			log("↓↓↓",type,msg);
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
		if (sys.browserType == sys.BrowserType.CHROME) {
			log(
				`%c ↑↑↑ ${msg && msg.constructor["MSGNAME"]}[${msgType}] ↑↑↑ `,
				"padding: 2px; background-color: #1094e3; color: #dddd22; border: 2px solid #dddd22; font-family: consolas;",
				msg
			);
		} else {
			DEBUG ? console.log(msg):log(msg);
		}
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
