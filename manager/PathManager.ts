import Singleton from "../base/Singleton";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-17 11:28:13
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2020-08-30 15:50:43
 */
export default class PathManager extends Singleton {
	public readonly root: string = "";
	/**ui地址 */
	public readonly ui: string = "ui/";

	/**
	 * 获取包名加载地址
	 * @param pkgName 包名
	 */
	public getPkgPath(pkgName: string): string {
		return `${this.root}${this.ui}${pkgName}`;
	}
}
