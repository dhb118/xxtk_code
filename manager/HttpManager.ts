/*
 * @Author: yanmingjie.jack@shandagames.com
 * @Date: 2020-08-19 20:30:20
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2020-12-18 16:29:27
 */
import HttpRequest, { HttpEvent, HttpType } from "../net/Http";

export default class HttpManager {

	private static _instance: HttpManager;
	public static getInstance(): HttpManager {
		if (!this._instance) {
			this._instance = new HttpManager();
		}
		return this._instance;
	}

	/**存储http协议对象 */
	private _https: Array<HttpRequest>;

	/**
	 * 发送http协议
	 * @param url root url
	 * @param data 请求数据，get请求会自动拼接好 {key: value, ...}
	 * @param onCompleteFun 请求成功监听函数 第一个参数未返回数据
	 * @param onErrorFun 请求错误监听函数
	 * @param onProgresFun 请求进度监听函数
	 * @param thisObj this对象
	 * @param method 用于请求的 HTTP 方法。值包括 "get"、"post"
	 */
	public send(
		url: string,
		data: any,
		onCompleteFun: Function,
		onErrorFun: Function,
		onProgresFun: Function,
		thisObj: any,
		method: HttpType = HttpType.GET
	): void {
		const http: HttpRequest = new HttpRequest();
		onErrorFun &&
			http.on(
				HttpEvent.ERROR,
				(message: ProgressEvent | string) => {
					http.targetOff(thisObj);
					onErrorFun && onErrorFun.call(thisObj, message);
				},
				thisObj
			);
		onCompleteFun &&
			http.on(
				HttpEvent.COMPLETE,
				(comData: any) => {
					http.targetOff(thisObj);
					onCompleteFun && onCompleteFun.call(thisObj, comData);
				},
				thisObj
			);
		onProgresFun && http.on(HttpEvent.PROGRESS, onProgresFun, thisObj);

		let dataUrl: string = url;
		if (method === HttpType.GET && data) {
			let isStart: boolean = true;
			isStart = (url.indexOf("?") == -1);
			for (const key in data) {
				if (data.hasOwnProperty(key)) {
					if (isStart) {
						dataUrl += `?${key}=${data[key]}`;
						isStart = false;
					} else {
						dataUrl += `&${key}=${data[key]}`;
					}
				}
			}
			http.send(dataUrl, null, method);
		} else {
			http.send(dataUrl, data, method);
		}
	}
}
