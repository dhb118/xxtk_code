import Singleton from "../base/Singleton";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-09 16:17:36
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-01-05 14:41:25
 */
export default class ArrayUtils extends Singleton {
	public constructor() {
		super();
	}

	/**
	 * 打乱数组中的元素
	 * @param {Array} arr
	 */
	public upset(arr: Array<any>): void {
		arr.sort(() => Math.random() - 0.5);
	}

	public buf2hex(buffer: ArrayBuffer): string {
		return Array.prototype.map
			.call(new Uint8Array(buffer), x => x.toString(16).slice(-2))
			.join(" ");
	}

	public buf2dec(buffer: ArrayBuffer): string {
		return Array.prototype.map
			.call(new Uint8Array(buffer), x => x.toString(10))
			.join(" ");
	}
}
