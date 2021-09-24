import Singleton from "../base/Singleton";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-09 16:07:33
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2020-12-21 13:48:33
 */
export default class RandomUtils extends Singleton {

    public constructor() {
        super();
    }

    /**
     * 获取一个区间的随机数 (from, end)
     * @param {number} from 最小值
     * @param {number} end 最大值
     * @returns {number}
     */
    public random(from: number, end: number): number {
        const min: number = Math.min(from, end);
        const max: number = Math.max(from, end);
        const range: number = max - min;
        return min + Math.random() * range;
    }

    /**
     * 获取数组中随机一个单元
     * @param arr 数组数据源
     */
    public randomArray<T>(arr: Array<T>): T {
        const index: number = this.random(0, arr.length) | 0;
        return arr[index];
    }

    /**
	 * This function is used to create unique IDs for trees and nodes.
	 *
	 * (consult http://www.ietf.org/rfc/rfc4122.txt).
	 *
	 * @class createUUID
	 * @constructor
	 * @return {String} A unique ID.
	 **/
	public createUUID(): string {
		const s = [];
		const hexDigits = '0123456789abcdef';
		for (let i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		// bits 12-15 of the time_hi_and_version field to 0010
		s[14] = '4';

		// bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);

		s[8] = s[13] = s[18] = s[23] = '-';

		const uuid = s.join('');
		return uuid;
	}

}