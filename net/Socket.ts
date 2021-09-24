import { log } from "cc";
import { IfaceConnector } from "./connector/IConnector";
import { Nullable } from "./Types";
import { SocketEvent, USocket } from "./USocket";

export enum SOCKET_STATUS {
	ACTIVE,
	DISCONNECT,
}

/**
 * Socket 套接字
 *
 * @class Socket
 * @extends {SingletonBase}
 */
export class Socket {
	/**
	 * 服务器地址
	 *
	 * @private
	 * @type {string}
	 * @memberof Socket
	 */
	private _host!: string;

	/**
	 * 服务器地址
	 *
	 * @private
	 * @type {string}
	 * @memberof Socket
	 */
	public get host(): string {
		return this._host;
	}

	public set host(value: string) {
		this._host = value;
	}

	private _certPath:string;

	public set certPath(value:string){
		this._certPath = value;
	}

	/**
	 * Socket管理通道
	 *
	 * @private
	 * @type {IfaceConnector}
	 * @memberof Socket
	 */
	private _connector!: IfaceConnector;

	/**
	 * Socket管理通道
	 *
	 * @private
	 * @type {IfaceConnector}
	 * @memberof Socket
	 */
	public get connector(): IfaceConnector {
		return this._connector;
	}

	public set connector(value: IfaceConnector) {
		this._connector = value;
	}

	private timer: number = 0;
	public constructor() {

	}

	/**
	 * 心跳间隔时间
	 */
	private _hearbeatInterval:number = 10;

	public set hearbeatInterval(v:number){
		this._hearbeatInterval = v;
	}

	/**
	 * 服务器端口
	 *
	 * @private
	 * @type {number}
	 * @memberof Socket
	 */
	private _port!: number;

	/**
	 * 服务器端口
	 *
	 * @private
	 * @type {number}
	 * @memberof Socket
	 */
	public get port(): number {
		return this._port;
	}

	public set port(value: number) {
		this._port = value;
	}

	private _caller: Nullable<unknown>;
	private _onOpenHandler!: Nullable<Function>;

	private _status: SOCKET_STATUS = SOCKET_STATUS.DISCONNECT;
	public get status(): SOCKET_STATUS {
		return this._status;
	}

	public isActive(): boolean {
		if(this._connector && this._connector.socket){
			return this._connector.socket.connected;
		}
		return false;
	}

	/**
	 * 初始化服务器
	 *
	 * @param {string} host
	 * @param {string} port
	 * @memberof Socket
	 */
	public initServer(
		host: string,
		port: number,
		connector?: IfaceConnector
	): void {
		this.host = host;
		this.port = port;
		connector && (this.connector = connector);
	}

	public heartbeat!: () => void;

	/**
	 * 连接服务器
	 *
	 * @memberof Socket
	 */
	public connect(caller?: unknown, onOpen?: Function): void {
		this._caller = caller;
		this._onOpenHandler = onOpen;

		const socket = new USocket();
		socket.certPath = this._certPath;

		console.log("===>connect",this._host,this._port);
		if(this._port){
			socket.connect(this._host, this._port);
		}
		else{
			socket.connectByUrl(this._host);
		}
		socket.on(SocketEvent.OPEN, this.onSocketOpen, this);
		socket.on(SocketEvent.CLOSE, this.onSocketClose, this);
		socket.on(SocketEvent.MESSAGE, this.onMessageReveived, this);
		socket.on(SocketEvent.ERROR, this.onConnectError, this);
		socket.endian = USocket.LITTLE_ENDIAN;
		this.connector.socket = socket;
	}

	/**
	 * 关闭连接
	 */
	public close(): void {
		const socket = this.connector.socket;
		socket.cleanSocket();
	}

	/**
	 * 清理连接
	 */
	public cleanSocket(): void {
		const socket = this.connector.socket;
		socket.close();
		socket.off(SocketEvent.OPEN, this.onSocketOpen, this);
		socket.off(SocketEvent.CLOSE, this.onSocketClose, this);
		socket.off(SocketEvent.MESSAGE, this.onMessageReveived, this);
		socket.off(SocketEvent.ERROR, this.onConnectError, this);
	}

	/**
	 * 发送心跳包
	 *
	 * @private
	 * @memberof Socket
	 */
	public sendHeartbeat(): void {
		if (this.heartbeat) {
			this.heartbeat();

			this.timer = setTimeout(() => {
				this.sendHeartbeat();
			}, this._hearbeatInterval*1000);

			//游戏切换到后台会被pause
			// director.getScheduler().schedule(
			// 	this.heartbeat,
			// 	this.timer,
			// 	this._hearbeatInterval,
			// 	macro.REPEAT_FOREVER,
			// 	0,
			// 	false
			// );
		}
	}

	/**
	 * 链接建立
	 *
	 * @private
	 * @memberof Socket
	 */
	private onSocketOpen(): void {
		console.log("====>onSocketOpen");
		this._status = SOCKET_STATUS.ACTIVE;

		if (this._onOpenHandler) {
			this._onOpenHandler.call(this._caller);
			this._onOpenHandler = void 0;
			this._caller = void 0;
		}

		this.start();
	}

	/**
	 * 连接成功后处理
	 * @private
	 * @memberof Socket
	 */
	private start(): void {
		//this.sendHeartbeat(); //屏蔽链接以后，启动心跳检查，改为登陆后再启动，防止游戏中服务器重新启动以后玩家再次点登录，先发送心跳问题
	}

	/**
	 * 发送消息
	 *
	 * @param {MsgType} type
	 * @param {*} msg
	 * @memberof Socket
	 */
	public send(type: number, msg: unknown): void {
		if (this._status != SOCKET_STATUS.ACTIVE) {
			return;
		}
		this.connector.send(type, msg);
	}

	/**
	 * 链接关闭
	 *
	 * @private
	 * @param {Laya.Event} e
	 * @memberof Socket
	 */
	private onSocketClose(e: Event): void {
		this._status = SOCKET_STATUS.DISCONNECT;
		log("onSocketClose", e);
		if(this.timer>0){
			clearTimeout(this.timer);
			this.timer = 0;
		}
	}

	/**
	 * 有消息到达
	 *
	 * @private
	 * @param {*} message
	 * @memberof Socket
	 */
	private onMessageReveived(msg: ArrayBuffer): void {
		this.connector.onMessageReveived(msg);
	}

	/**
	 * 连接发送错误
	 *
	 * @private
	 * @memberof Socket
	 */
	private onConnectError(e: Event): void {
		this._status = SOCKET_STATUS.ACTIVE;
		if(this.timer>0){
			clearTimeout(this.timer);
			this.timer = 0;
		}
		log("onConnectError", e);
	}
}
