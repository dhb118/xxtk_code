import StringUtils from "./utils/StringUtils";
/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-09 15:06:25
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-06-01 21:07:44
 */
export class App {


	/**
	 * get launch args only support web & wx
	 * @param key
	 * @param defaultValue
	 */
	public static getLaunchArg<T>(key:string,defaultValue?:T){
		const str = StringUtils.getInstance<StringUtils>().getQueryString(key) as string;
		let ret = defaultValue;
		if(str && str.length > 0 ){
			try {
				ret = <T>JSON.parse(str);
			} catch (error) {
				ret = defaultValue;
			}
		}
		return ret;
	}

}
