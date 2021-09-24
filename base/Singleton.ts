/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-09 14:59:19
 * @Last Modified by: checong.brainy
 * @Last Modified time: 2020-09-06 11:16:26
 */
export default class Singleton {
	/**单例变量 */
	private static _instance: Singleton;
	public static getInstance<T extends Singleton>(): T {
		if (!this._instance) {
			this._instance = new this();
		}
		return this._instance as T;
	}
}
