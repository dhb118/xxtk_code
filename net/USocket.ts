import { EventTarget } from "cc";
import { Byte } from "./Byte";

export enum SocketEvent {
	OPEN = "OPEN",
	MESSAGE = "MESSAGE",
	ERROR = "ERROR",
	CLOSE = "CLOSE",
}

export class USocket extends EventTarget {
	/**
	 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
	 * <p> LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
	 * <p> BIG_ENDIAN ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。</p>
	 */
	public static LITTLE_ENDIAN: string = "littleEndian";

	/**
	 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
	 * <p> BIG_ENDIAN ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。</p>
	 * <p> LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
	 */
	public static BIG_ENDIAN: string = "bigEndian";
	private _endian!: string;
	protected _socket!: WebSocket | null;
	private _connected!: boolean;
	private _addInputPosition: number;
	private _input: Byte;
	private _output: Byte;

	/**
	 *
	 */
	private _certPath:string;
	public set certPath(v:string){
		this._certPath = v;
	}

	/**
	 * @private
	 * 表示建立连接时需等待的毫秒数。
	 */
	public timeout: number;
	/**
	 * @private
	 * 在写入或读取对象时，控制所使用的 AMF 的版本。
	 */
	public objectEncoding!: number;
	/**
	 * 不再缓存服务端发来的数据。
	 */
	public disableInput: boolean = false;
	/**
	 * 用来发送和接收数据的 <code>Byte</code> 类。
	 */
	private _byteClass: typeof Byte;
	/**
	 * <p>子协议名称。子协议名称字符串，或由多个子协议名称字符串构成的数组。必须在调用 connect 或者 connectByUrl 之前进行赋值，否则无效。</p>
	 * <p>指定后，只有当服务器选择了其中的某个子协议，连接才能建立成功，否则建立失败，派发 Event.ERROR 事件。</p>
	 * @see https://html.spec.whatwg.org/multipage/comms.html#dom-websocket
	 */
	public protocols: any = [];

	/**
	 * 缓存的服务端发来的数据。
	 */
	public get input(): Byte {
		return this._input;
	}

	/**
	 * 表示需要发送至服务端的缓冲区中的数据。
	 */
	public get output(): Byte {
		return this._output;
	}

	/**
	 * 表示此 Socket 对象目前是否已连接。
	 */
	public get connected(): boolean {
		return this._connected;
	}

	/**
	 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
	 * <p> LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
	 * <p> BIG_ENDIAN ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。</p>
	 */
	public get endian(): string {
		return this._endian;
	}

	public set endian(value: string) {
		this._endian = value;

		if (value === USocket.LITTLE_ENDIAN) {
			if (this._input != null) this._input.endian = value;
			if (this._output != null) this._input.endian = value;
		} else {
			if (this._input != null) this._input.endian = value;
			if (this._output != null) this._output.endian = value;
		}
	}

	/**
	 * <p>创建新的 Socket 对象。默认字节序为 Socket.BIG_ENDIAN 。若未指定参数，将创建一个最初处于断开状态的套接字。若指定了有效参数，则尝试连接到指定的主机和端口。</p>
	 * <p><b>注意：</b>强烈建议使用<b>不带参数</b>的构造函数形式，并添加任意事件侦听器和设置 protocols 等属性，然后使用 host 和 port 参数调用 connect 方法。此顺序将确保所有事件侦听器和其他相关流程工作正常。</p>
	 * @param host		服务器地址。
	 * @param port		服务器端口。
	 * @param byteClass	用于接收和发送数据的 Byte 类。如果为 null ，则使用 Byte 类，也可传入 Byte 类的子类。
	 * @see laya.utils.Byte
	 */
	public constructor(
		host: string | null = null,
		port: number = 0,
		byteClass: typeof Byte | null = null
	) {
		super();
		this._byteClass = byteClass ? byteClass : Byte;
		this.endian = USocket.BIG_ENDIAN;
		this.timeout = 20000;
		this._addInputPosition = 0;
		if (host && port > 0 && port < 65535) this.connect(host, port);
	}

	/**
	 * <p>连接到指定的主机和端口。</p>
	 * <p>连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。</p>
	 * @param host	服务器地址。
	 * @param port	服务器端口。
	 */
	public connect(host: string, port: number): void {
		const url: string = this.getSocketAddress(host, port);
		this.connectByUrl(url);
	}

	/**
	 * <p>连接到指定的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。</p>
	 * <p>连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。</p>
	 * @param url	要连接的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。
	 */
	public connectByUrl(url: string): void {
		if (this._socket != null) close();

		this._socket && this.cleanSocket();

		const protocols = (this.protocols&&this.protocols.length>0) ? this.protocols : [];

		console.log("=>create websocket certPath",this._certPath);
		//@ts-ignore
		this._socket = new WebSocket(url, protocols,this._certPath);


		this._socket.binaryType = "arraybuffer";
		this._output = new this._byteClass();
		this._input = new this._byteClass();
		const endian = this.endian;
		this.endian = endian;
		this._output.endian = Byte.LITTLE_ENDIAN;
		this._input.endian = Byte.LITTLE_ENDIAN;
		this._addInputPosition = 0;

		this._socket.onopen = (e: any): void => {
			console.log("USocket: onOpen ");
			this._onOpen(e);
		};
		this._socket.onmessage = (msg: any): void => {
			this._onMessage(msg);
		};
		this._socket.onclose = (e: any): void => {
			console.log("USocket: onClose ",e);
			this._onClose(e);
		};
		this._socket.onerror = (e: any): void => {
			console.log("USocket: onError ",e);
			this._onError(e);
		};
	}

	/**
	 * 获取socket连接address
	 * @param host
	 * @param port
	 */
	public getSocketAddress(host: string, port: number): string {
		// 检查http/https头
		let httpHeader: string;
		if (host.startsWith("http")) {
			const hostArr = host.split("//");
			httpHeader = hostArr[0];
			host = hostArr[1];
		}
		if (!httpHeader) {
			httpHeader = window.location.protocol;
		}
		// 检查域名子目录
		let address: string = `${host}:${port}`;
		const hostPathArr = host.split("/");
		if (hostPathArr.length > 1) {
			hostPathArr[0] += `:${port}`;
			address = hostPathArr.join("/");
		}
		// 拼接连接地址
		let url: string;
		if (httpHeader === "https:") {
			url = `wss://${address}`;
		} else {
			url = `ws://${address}`;
		}
		return url;
	}

	/**
	 * 清理socket。
	 */
	public cleanSocket(): void {
		this._connected = false;
		if (this._socket) {
			try {
				this._socket.close();
			} catch (e) {
				/* empty */
			}
			this._socket.onopen = null;
			this._socket.onmessage = null;
			this._socket.onclose = null;
			this._socket.onerror = null;
			this._socket = null;
		}
	}

	/**
	 * 关闭连接。
	 */
	public close(): void {
		this._connected = false;
		if (this._socket != null) {
			try {
				this._socket.close();
			} catch (e) {/*empty*/}
		}
	}

	/**
	 * @private
	 * 连接建立成功 。
	 */
	protected _onOpen(e: any): void {
		this._connected = true;
		this.emit(SocketEvent.OPEN, e);
	}

	/**
	 * @private
	 * 接收到数据处理方法。
	 * @param msg 数据。
	 */
	protected _onMessage(msg: any): void {
		if (!msg || !msg.data) return;
		const data: any = msg.data;
		if (this.disableInput && data) {
			this.emit(SocketEvent.MESSAGE, data);
			return;
		}

		if (this._input.length > 0 && this._input.bytesAvailable < 1) {
			this._input.clear();
			this._addInputPosition = 0;
		}

		const pre: number = this._input.pos;
		!this._addInputPosition && (this._addInputPosition = 0);
		this._input.pos = this._addInputPosition;

		if (data) {
			if (typeof data === "string") {
				this._input.writeUTF8String(data);
			} else {
				this._input.writeArrayBuffer(data);
			}
			this._addInputPosition = this._input.pos;
			this._input.pos = pre;
		}
		this.emit(SocketEvent.MESSAGE, data);
	}

	/**
	 * @private
	 * 连接被关闭处理方法。
	 */
	protected _onClose(e: any): void {
		this._connected = false;
		this.emit(SocketEvent.CLOSE, e);
	}

	/**
	 * @private
	 * 出现异常处理方法。
	 */
	protected _onError(e: any): void {
		this.emit(SocketEvent.ERROR, e);
	}

	/**
	 * 发送数据到服务器。
	 * @param	data 需要发送的数据，可以是String或者ArrayBuffer。
	 */
	public send(data: any): void {
		this._socket && this._socket.send(data);
	}

	/**
	 * 发送缓冲区中的数据到服务器。
	 */
	public flush(): void {
		if (this._output && this._output.buffer && this._output.length > 0) {
			let evt: any;
			try {
				const data = this._output.__getBuffer().slice(0, this._output.length);
				// console.log(data);
				this._socket && this._socket.send(data);
			} catch (e) {
				evt = e;
			}
			const endian =  this.endian;
			this.endian = endian;
			this._output.clear();
			if (evt) this.emit(SocketEvent.ERROR, evt);
		}
	}
}
