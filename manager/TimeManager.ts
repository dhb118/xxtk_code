import { warn } from "cc";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-21 11:38:12
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2020-11-25 19:14:47
 */
export default class TimeManager {

	private static _instance: TimeManager;
	public static getInstance(): TimeManager {
		if (!this._instance) {
			this._instance = new TimeManager();
		}
		return this._instance;
	}

	/**服务端时间(ms) */
	private _serverTime: number;
	/**服务端和客户端时间差(ms) */
	private _diffTime: number;
	/**是否同步过时间 */
	private _isSyncTime: boolean;

	/**
	 * 初始化服务器时间(ms)
	 * @param time 获取同步的服务器时间
	 */
	public initSeverTime(time: number): void {
		this._serverTime = time;
		this._diffTime = this._serverTime - this.localTime;
		this._isSyncTime = true;
	}

	/**
	 * 更新时间
	 * @param dt 服务器时间(s)
	 */
	public onUpdate(dt?: number): void {
		if (!this._isSyncTime) return;
		this._serverTime += dt * 1000;
	}

	/**
	 * 获取时间差(ms)
	 */
	public get diffTime(): number {
		if (this._serverTime === void 0) {
			warn("服务器时间还未同步，请先同步时间！");
			return null;
		}
		return this._diffTime;
	}

	/**
	 * 获取服务器时间(ms)
	 */
	public get serverTime(): number {
		if (this._serverTime === void 0) {
			warn("服务器时间还未同步，请先同步时间！");
			return null;
		}
		return this._serverTime;
	}

	/**
	 * 获取本地时间(ms)
	 */
	public get localTime(): number {
		return Date.now();
	}
}
