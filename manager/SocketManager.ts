import { EventTarget, ISchedulable, log, sys } from "cc";
import { DEBUG } from "cc/env";
import { AppConfig } from "../../AppConfig";
import { ErrorCode } from "../../consts/ErrorCode";
import { GameEvents } from "../../consts/GameEvents";
import { recyclable } from "../../melon_runtime/ClassUtils";
import { PBConnector } from "../net/connector/PBConnector";
import { socketEvent } from "../net/connector/SocketEvent";
import { AMFPacker } from "../net/mershall/AMFPacker";
import { IPacker } from "../net/mershall/IPacker";
import { Socket } from "../net/Socket";
import { SocketEvent } from "../net/USocket";
import EventManager from "./EventManager";
import TimeManager from "./TimeManager";

/*
 * @Author: yanmingjie.jack@shandagames.com
 * @Date: 2020-08-21 16:02:55
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-06-01 21:08:25
 */
export enum SocketType {
	GATE = "gate", //游戏路由
	LG = "lg", //登陆服
}

class IMsgLike {
	static MSGID: number;
}

type MsgHandlerFunc = (msg: IMsgLike) => void;

export default class SocketManager {

    private static _instance: SocketManager;
	public static getInstance(): SocketManager {
		if (!this._instance) {
			this._instance = new SocketManager();
		}
		return this._instance;
	}

	private _type: SocketType;
	private _socket: Socket;
	private _socketTimer: ISchedulable;
	private _ping: GProtocol.TCM_PING;

	private _openFun: Function;
	private _closeFun: Function;
	private _errorFun: Function;
	private _requestTimeoutFun: Function;
	private _connectCallback: Function;

	private _requestTimeout: number = 5;

	private _requestTimerId: number = 0;
	private _requestRetryCount = 0;
	private _requestArgs: {
		cMsgData: IMsgLike,
		sMsgId: number,
		cb: MsgHandlerFunc,
		timeoutCB?: Function,
		thisObj?: any
	} = null;

	private _forwardUrl: string;


	public set forwardUrl(url: string) {
		this._forwardUrl = url;
	}

	public set requestTimeout(v: number) {
		this._requestTimeout = v;
	}

	private _certPath: string;

	public set certPath(v: string) {
		this._certPath = v;
	}

	/**
	 * 连接socket
	 * @param host
	 * @param port
	 * @param sType
	 */
	public connectServer(host: string, port: string, sType: SocketType, callback?: (err: Error) => void): void {
		this._connectCallback = callback;

		if (!this._socketTimer) {
			this._socketTimer = { id: sType };
		} else {
			this._socketTimer.id = sType;
		}

		let url = host;
		let portTemp = port;

		//重定向url "wss://h5games.jijiagames.com/h5?host=${ip}&port=${port}"
		if (host === '127.0.0.1') {
			url = AppConfig.localUrl.replace("${ip}", host).replace("${port}", String(port));
			portTemp = null;
		}
		else if (this._forwardUrl && this._forwardUrl.length > 0 && port) {
			const serverLink = AppConfig.serverUrl.replace("https","wss");
			url = this._forwardUrl.replace("${server}",serverLink).replace("${ip}", host).replace("${port}", String(port));
			portTemp = null;
		}

		if (!this._socket) {
			this._socket = new Socket();
			this._socket.certPath = this._certPath;
			const pbConnector = new PBConnector();
			// pbConnector.packer = new PBPacker();
			pbConnector.packer = new AMFPacker();
			// pbConnector.msgPacker = new RXPacker();
			pbConnector.msgPacker = new AMFPacker();
			this._socket.initServer(url, +portTemp, pbConnector);
		} else {
			this.closeServer();
			this._socket.initServer(url, +portTemp);
		}

		this._type = sType;
		this._socket.connect(this, this.onSocketOpen);
		this.initEvent();
	}

	/**
	 * 链接是否有效
	 * @param sType
	 */
	public isActive(sType: SocketType) {
		if (this._type == sType) {
			return this._socket.isActive();
		}
		return false;
	}

	/**
	 * 发送心跳包
	 * interval 间隔时间(单位秒)
	 */
	public onSocketPing(interval: number): void {
		if (!this._socket) {
			return;
		}
		this._socket.heartbeat = this.hearbeat;
		this._socket.hearbeatInterval = interval;
		this._socket.sendHeartbeat();
	}

	/**
	 * 关闭服务器连接
	 */
	public closeServer(): void {
		if (this._socket) {
			this.removeEvent();
			this._socket.close();
		}
	}

	public setOpenCallback(callback: Function): void {
		this._openFun = callback;
	}

	public setCloseCallback(cb: Function): void {
		this._closeFun = cb;
	}

	public setErrorCallback(cb: Function): void {
		this._errorFun = cb;
	}

	public setTimeoutCallback(cb: Function): void {
		this._requestTimeoutFun = cb;
	}

	/**
	 * 获取socket数据解析packer
	 */
	public getSocketPacker(): IPacker {
		if (this._socket) {
			return this._socket.connector.packer;
		}
		return null;
	}

	/**
	 * 发送数据，协议在GProtocol中
	 * @param cMsgId MSGID
	 * @param cMsgData GProtocol中协议名
	 */
	public send(cMsgId: number, cMsgData: unknown): void {
		if (sys.browserType == sys.BrowserType.CHROME) {
			console.log(
				`%c ↑↑↑ ${cMsgData && cMsgData.constructor["MSGNAME"]}[${cMsgId}] ↑↑↑ `,
				"padding: 2px; background-color: #1094e3; color: #dddd22; border: 2px solid #dddd22; font-family: consolas;",
				cMsgData
			);
		} else {
			if(DEBUG){
				log("↑↑↑", cMsgId, cMsgData);
			}
		}
		/*
		const msgPacker = (this._socket.connector as PBConnector).msgPacker;
		const pbMsgId = SDO_Game_Msg.game_cl_forward_req;
		const pbMsgDataBaytes = new ByteArray(msgPacker.doPack(cMsgId, cMsgData));
		// const pbMsgDataBaytes = new ByteArray(amf_writeObject({ type: cMsgId, message: cMsgData }))//  msgPacker.doPack(cMsgId, cMsgData));
		this._socket && this._socket.send(pbMsgId, { data: pbMsgDataBaytes });*/
		this._socket && this._socket.send(cMsgId, cMsgData);
	}

	/**
	 * 发送数据，根据packer来定义
	 * @param cMsgId MSGID
	 * @param cMsgData
	 */
	public sendPB(cMsgId: number, cMsgData: unknown): void {
		if (sys.browserType == sys.BrowserType.CHROME) {
			console.log(
				`%c ↑↑↑ [${cMsgId}] ↑↑↑ `,
				"padding: 2px; background-color: #1094e3; color: #dddd22; border: 2px solid #dddd22; font-family: consolas;",
				cMsgData
			);
		} else {
			if(DEBUG){
				log("↑↑↑", cMsgId, cMsgData);
			}
		}
		this._socket && this._socket.send(cMsgId, cMsgData);
	}

	public post(cMsgData: IMsgLike) {
		const cMsgId = (<typeof IMsgLike>cMsgData.constructor).MSGID;
		this.send(cMsgId, cMsgData);
	}

	public request(
		cMsgData: IMsgLike,
		sMsgId: number,
		cb: MsgHandlerFunc,
		timeoutCB?: Function,
		thisObj?: any
	) {
		if (this._requestTimerId > 0) {
			return;
		}
		const cMsgId = (<typeof IMsgLike>cMsgData.constructor).MSGID;

		const requestTime = Date.now();
		const callback = (msg: IMsgLike) => {
			EventManager.getInstance().emitEvent(GameEvents.OnRequestEnd);
			if(DEBUG){
				const costTime = Date.now() - requestTime;
				log(`===>request ${cMsgId} use: ${costTime} ms`);
			}
			this._requestTimerId && clearTimeout(this._requestTimerId);
			this._requestTimerId = 0;
			this._requestRetryCount = 0;
			if (thisObj) {
				cb.apply(thisObj, msg);
			} else {
				cb(msg);
			}
		}

		this._requestTimerId = setTimeout(() => {
			this._requestTimerId = 0;
			this.off(sMsgId, callback, null);

			//自动重试一次
			if (this._requestRetryCount < 1) {
				this._requestRetryCount++;
				this.request(cMsgData, sMsgId, cb, timeoutCB, thisObj);
				return;
			}
			this._requestRetryCount = 0;
			EventManager.getInstance().emitEvent(GameEvents.OnRequestEnd);
			EventManager.getInstance().emitEvent(GameEvents.OnRequestTimeout);
			if (timeoutCB) {
				if (thisObj) {
					timeoutCB.apply(thisObj);
				} else {
					timeoutCB();
				}
			}
			else {
				this._requestTimeoutFun && this._requestTimeoutFun();
			}
		}, this._requestTimeout * 1000);

		this.once(
			sMsgId,
			callback,
			null
		);

		EventManager.getInstance().emitEvent(GameEvents.OnRequestStart);

		this.send(cMsgId, cMsgData);

		this._requestArgs = { cMsgData, sMsgId, cb, timeoutCB, thisObj };
	}

	public retryLastRequest() {
		const { cMsgData, sMsgId, cb, timeoutCB, thisObj } = this._requestArgs;
		this.request(cMsgData, sMsgId, cb, timeoutCB, thisObj);
	}

	/**
	 * 监听协议事件
	 * @param msgId
	 * @param callback
	 * @param thisObj
	 */
	public on(msgId: number, callback: (...any: any[]) => void, thisObj?: any): void {
		socketEvent.on(`${msgId}`, callback, thisObj);
	}

	public once(msgId: number, callback: (...any: any[]) => void, thisObj?: any) {
		socketEvent.once(`${msgId}`, callback, thisObj);
	}

	public onList(msgIdList: number[], callback: () => void) {
		const list: Set<number> = new Set<number>(msgIdList);
		msgIdList.forEach(msgId => {
			socketEvent.once(`${msgId}`, () => {
				list.delete(msgId);
				if (list.size == 0) {
					callback();
				}
			}, this);
		});
	}

	/**
	 * 移除监听协议事件
	 * @param msgId
	 * @param callback
	 * @param thisObj
	 */
	public off(msgId: number, callback: (...any: any[]) => void, thisObj: any) {
		socketEvent.off(`${msgId}`, callback, thisObj);
	}

	public offAll(thisObj: any) {
		socketEvent.targetOff(thisObj);
	}

	private onSocketOpen(): void {
		const socket = this._socket;
		console.log(`ws://${socket.host}:${socket.port} socket连接成功！`);
		this._openFun && this._openFun();
		this._openFun = null;
		if (this._connectCallback) {
			this._connectCallback(null);
			this._connectCallback = null;
		}
	}

	private onSocketClose(err: Error): void {
		this._closeFun && this._closeFun(err);
		this._closeFun = null;
		EventManager.getInstance().emitEvent(GameEvents.OnGameSrvDisconnected);

	}

	private onSocketError(err: Error): void {
		this._errorFun && this._errorFun(err);
		this._errorFun = null;
		if (this._connectCallback) {
			this._connectCallback(err);
			this._connectCallback = null;
		}
		// todo: 错误socket处理弹窗等
	}

	public hearbeat(): void {
		const socket = SocketManager.getInstance();
		if (!socket._ping) {
			socket._ping = new GProtocol.TCM_PING();
			socket._ping.Flag = 0;
		}
		socket.send(GProtocol.TCM_PING.MSGID, socket._ping);
	}

	private onTSMPONG(msg: GProtocol.TSM_PONG): void {
		const timeMgr = TimeManager.getInstance();
		timeMgr.initSeverTime(msg.RtnTime);
	}

	private initEvent(): void {
		const socket = this._socket.connector.socket;
		socket.on(SocketEvent.CLOSE, this.onSocketClose, this);
		socket.on(SocketEvent.ERROR, this.onSocketError, this);
		socketEvent.on(`${GProtocol.TSM_PONG.MSGID}`, this.onTSMPONG, this);
	}

	private removeEvent(): void {
		const socket = this._socket.connector.socket;
		socket.off(SocketEvent.CLOSE, this.onSocketClose, this);
		socket.off(SocketEvent.ERROR, this.onSocketError, this);
		socketEvent.off(`${GProtocol.TSM_PONG.MSGID}`, this.onTSMPONG, this);
	}
}


export class AsyncTokenTask extends EventTarget {
	static token = 0;

	static request(command: number, value: any, handler: (value: any) => void) {
		let that = this;
		if (tsocket.isActive) {
			let task = recyclable(AsyncTokenTask);
			task.request(command, value, that.token++).then(value => {
				task.recycle();
				handler(value);
				if (value && value.flag != 0) {
					ErrorCode.getInstance().onErrorMessage(value.flag);
				}
			})
		} else {
			setTimeout(handler,10,{flag:-2});
		}
	}

	request(type: number, value: any, token: number) {
		// socket.sendToCenter(serverId, roleId, type, value);
		let that = this;
		let timeout = -1;
		return new Promise<any>(resolve => {
			function handler(value: { value: any, token: number }) {
				if (!value) {
					//超时
					tsocket.off(6, handler, that);
					console.log(`request ${type} timeout! value:${JSON.stringify(value)}}`);
					// clearTimeout(timeout);
					resolve({flag:-1});
					return;
				} else {
					if (value.token == token) {
						tsocket.off(6, handler, that);
						clearTimeout(timeout);
						resolve(value.value);
					}
				}
			}

			timeout = setTimeout(handler, 5000);
			tsocket.on(6, handler, that);
			tsocket.send(6, { type, value, token });

		})
	}
}

export var asyncToken = AsyncTokenTask.request.bind(AsyncTokenTask) as (command: number, value: any, handler: (value: any) => void) => void;
window["asyncToken"] = asyncToken;

export var tsocket = SocketManager.getInstance() as SocketManager;

export function forward(command: number, data?: any) {
	tsocket.send(command, data);
}
window["forward"] = forward;

export function gm(command: string, ...args: any) {
	asyncToken(3, [command, args], data => {
		console.log(`${command}(${JSON.stringify(args)}) => ${JSON.stringify(data)}`)
	})
	// tsocket.send(3, [command, args]);
}
window["gm"] = window["gm"] ? (window["gm"].gm = gm) : { gm };

export function setPropery(key: string, value: any) {
	let pros = key.split(".");
	let o = {};
	let p = o
	for (let i = 0; i < pros.length - 1; i++) {
		o = o[pros[i]] = {};
	}
	o[pros[pros.length - 1]] = value;
	tsocket.send(1, p);
}
window["setPropery"] = setPropery