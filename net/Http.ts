import { EventTarget, log, error, sys } from "cc";

/*
 * @Author: yanmingjie.jack@shandagames.com
 * @Date: 2020-08-20 09:54:13
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2020-10-17 15:11:58
 */
export enum ResponseType {
	TEXT = "text",
	JSON = "json",
	XML = "xml",
	ARRAY_BUFFER = "arraybuffer",
}

export enum HttpType {
	GET = "GET",
	POST = "POST",
}

export enum HttpEvent {
	ERROR = "error",
	COMPLETE = "complete",
	PROGRESS = "progress",
}

export default class HttpRequest extends EventTarget {
	private _responseType: ResponseType;
	private _data: any;
	private _xhr: XMLHttpRequest;
	private _url: string;

	public constructor() {
		super();
		this._xhr = new XMLHttpRequest();
	}

	/**
	 * 发送 HTTP 请求
	 * @param url 请求的地址。大多数浏览器实施了一个同源安全策略，并且要求这个 URL 与包含脚本的文本具有相同的主机名和端口
	 * @param data 发送的数据, {key: value, ...}
	 * @param method 用于请求的 HTTP 方法。值包括 "get"、"post"
	 * @param responseType Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"
	 * @param headers HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type","application/json"]
	 */
	public send(
		url: string,
		data: any,
		method: HttpType = HttpType.GET,
		responseType: ResponseType = ResponseType.JSON,
		headers: Array<string> = null
	): void {
		this._url = url;
		this._responseType = responseType;
		this._data = null;
		const xhr: XMLHttpRequest = this._xhr;
		xhr.open(method, url, true);
		if (headers) {
			for (let i = 0, len = headers.length; i < len; i++) {
				xhr.setRequestHeader(headers[i++], headers[i]);
			}
		}
		if (!sys.isMobile) {
			if (!data || typeof data === "string") {
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			} else {
				xhr.setRequestHeader("Content-Type", "application/json");
			}
		} else {
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		}
		xhr.responseType = responseType !== ResponseType.ARRAY_BUFFER ? ResponseType.TEXT : ResponseType.ARRAY_BUFFER;
		xhr.onerror = (e: ProgressEvent) => {
			this.onError(e);
		};
		xhr.onabort = (e: ProgressEvent) => {
			this.onAbort(e);
		};
		xhr.onprogress = (e: ProgressEvent) => {
			this.onProgress(e);
		};
		xhr.onload = (e: ProgressEvent) => {
			this.onLoad(e);
		};
		xhr.send(data);
	}

	public get url(): string {
		return this._xhr.responseURL;
	}

	public get xhr(): XMLHttpRequest {
		return this._xhr;
	}

	public get data(): any {
		return this.data;
	}

	private onComplete(): void {
		this.clear();
		let data: any;
		let flag: boolean = true;
		try {
			if (this._responseType === ResponseType.JSON) {
				data = JSON.parse(this._xhr.responseText);
			} else if (this._responseType === ResponseType.XML) {
				data = this.parseXMLFromString(this._xhr.responseText);
			} else {
				data = this._xhr.response || this._xhr.responseText;
			}
			this._data = data;
		} catch (e) {
			flag = false;
			this.error(e.message);
		}
		log(
			`%c ↓↓↓ ${this._url}] ↓↓↓ `,
			"padding: 2px; background-color: #333; color: #22dd22; border: 2px solid #22dd22; font-family: consolas;",
			data
		);
		flag && this.emit(HttpEvent.COMPLETE, data);
	}

	private onLoad(e: ProgressEvent): void {
		const xhr: XMLHttpRequest = this._xhr;
		const status = xhr.status !== undefined ? xhr.status : 200;
		if (status === 200 || status === 204 || status === 0) {
			this.onComplete();
		} else {
			this.error(`[${xhr.status}]${xhr.statusText}:${xhr.responseURL}`);
		}
	}

	private onProgress(e: ProgressEvent): void {
		if (e && e.lengthComputable) {
			this.emit(HttpEvent.PROGRESS, e.loaded / e.total);
		}
	}

	private onError(message: ProgressEvent): void {
		this.clear();
		this.error(message);
	}

	private onAbort(e: ProgressEvent): void {
		this.error("Request was aborted by user");
	}

	private clear(): void {
		const xhr: XMLHttpRequest = this._xhr;
		xhr.onerror = xhr.onabort = xhr.onprogress = xhr.onload = null;
	}

	private error(message: ProgressEvent | string): void {
		this.clear();
		error(
			`%c ↓↓↓ ${this._url}] ↓↓↓ `,
			"padding: 2px; background-color: #333; color: #22dd22; border: 2px solid #22dd22; font-family: consolas;",
			message
		);
		this.emit(HttpEvent.ERROR, message);
	}

	private parseXMLFromString(value: string) {
		value = value.replace(/>\s+</g, "><");
		const rst = new DOMParser().parseFromString(value, "text/xml");
		if (rst.firstChild.textContent.indexOf("This page contains the following errors") > -1) {
			throw new Error(rst.firstChild.firstChild.textContent);
		}
		return rst;
	}
}
