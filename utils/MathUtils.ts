import { Mat3, Vec2, Vec3 } from "cc";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-09 15:22:49
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-03-01 11:20:22
 */


class Mat3Ex extends Mat3{
	public setAxisAngle(axis:Vec3,radians:number){
		const s = Math.sin(radians);
		const c = Math.cos(radians);
		const one_c = 1.0 - c;
		const vx = axis.x;
		const vy = axis.y;
		const vz = axis.z;
		const xx = vx * vx;
		const yy = vy * vy;
		const zz = vz * vz;
		const xy = vx * vy;
		const yz = vy * vz;
		const zx = vz * vx;
		const xs = vx * s;
		const ys = vy * s;
		const zs = vz * s;
		this.set(
			one_c * xx + c,
			one_c * xy + zs,
			one_c * zx - ys,
			one_c * xy - zs,
			one_c * yy + c,
			one_c * yz + xs,
			one_c * zx + ys,
			one_c * yz - xs,
			one_c * zz + c
		);
	}

	public multiplyVec3(out:Vec3,inV:Vec3){
		const m = this;
		out.set(
			m.m00 * inV.x + m.m03 * inV.y + m.m06*inV.z,
			m.m01 * inV.x + m.m04 * inV.y + m.m07*inV.z,
			m.m02 * inV.x + m.m05 * inV.y + m.m08*inV.z
		);
		return out;
	}
}

const v3_a1 = new Vec3();
const v3_a2 = new Vec3();
const v2_a1 = new Vec2();
const m3_a1 = new Mat3Ex();


export default class MathUtils {
	static _instance: MathUtils;
	static getInstance(): MathUtils {
		if (!this._instance) {
			this._instance = new MathUtils();
		}
		return this._instance;
	}

	/**
	 * 弧度制转换为角度值
	 * @param {number} radian
	 * @returns {number}
	 */
	public getAngle(radian: number): number {
		return (180 * radian) / Math.PI;
	}

	/**
	 * 角度值转换为弧度制
	 * @param {number} angle
	 */
	public getRadian(angle: number): number {
		return (angle * Math.PI) / 180;
	}

	/**
	 * 获取两点间弧度
	 * @param {Vec2} p1
	 * @param {Vec2} p2
	 * @returns {number}
	 */
	public getRadianTwoPoint(p1: Vec3, p2: Vec3): number {
		p1.y = p2.y = 0;
		const av = Vec3.subtract(v3_a1, p2, p1);
		return Vec3.angle(av, Vec3.FORWARD);
	}

	public getAngleFromPoints(p1: Vec3, p2: Vec3): number {
		p1.y = p2.y = 0;
		const av = Vec3.subtract(v3_a1, p2, p1);
		const a = Vec3.angle(av, Vec3.FORWARD);
		let r = (180 / Math.PI) * a;
		r = av.x > 0 ? 360 - r : r;
		return r;
	}

	/**
	 * 获取两点水平顺时针夹角
	 * @param p1
	 * @param p2
	 */
	public get2DAnglePoints(p1: Vec2, p2: Vec2): number {
		const av = Vec2.subtract(v2_a1, p2, p1);
		const a = Vec2.angle(av, Vec2.UNIT_X);
		let r = (180 / Math.PI) * a;
		r = av.y < 0 ? 360 - r : r;
		return r;
	}

	/**
	 * 获取两线段相交点
	 * @param p1
	 * @param p2
	 * @param q1
	 * @param q2
	 */
	public get2DCrossPoint(p1: Vec2 | Vec3, p2: Vec2 | Vec3, q1: Vec2 | Vec3, q2: Vec2 | Vec3): Vec2 {
		if (this.isRectCross(p1, p2, q1, q2) && this.isLineSegmentCross(p1, p2, q1, q2)) {
			//求交点
			const vec = new Vec2();
			let tmpLeft: number, tmpRight: number;
			tmpLeft = (q2.x - q1.x) * (p1.y - p2.y) - (p2.x - p1.x) * (q1.y - q2.y);
			tmpRight =
				(p1.y - q1.y) * (p2.x - p1.x) * (q2.x - q1.x) +
				q1.x * (q2.y - q1.y) * (p2.x - p1.x) -
				p1.x * (p2.y - p1.y) * (q2.x - q1.x);

			vec.x = tmpRight / tmpLeft;

			tmpLeft = (p1.x - p2.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q1.x - q2.x);
			tmpRight =
				p2.y * (p1.x - p2.x) * (q2.y - q1.y) +
				(q2.x - p2.x) * (q2.y - q1.y) * (p1.y - p2.y) -
				q2.y * (q1.x - q2.x) * (p2.y - p1.y);
			vec.y = tmpRight / tmpLeft;
			return vec;
		}

		return null;
	}

	/**
	 * 线段对角线矩形是否相交
	 * @param p1
	 * @param p2
	 * @param q1
	 * @param q2
	 */
	public isRectCross(p1: Vec2 | Vec3, p2: Vec2 | Vec3, q1: Vec2 | Vec3, q2: Vec2 | Vec3): boolean {
		const ret =
			Math.min(p1.x, p2.x) <= Math.max(q1.x, q2.x) &&
			Math.min(q1.x, q2.x) <= Math.max(p1.x, p2.x) &&
			Math.min(p1.y, p2.y) <= Math.max(q1.y, q2.y) &&
			Math.min(q1.y, q2.y) <= Math.max(p1.y, p2.y);
		return ret;
	}

	/**
	 * 线段对角线是否跨立，跨立一定相交
	 * @param p1
	 * @param p2
	 * @param q1
	 * @param q2
	 */
	public isLineSegmentCross(p1: Vec2 | Vec3, p2: Vec2 | Vec3, q1: Vec2 | Vec3, q2: Vec2 | Vec3): boolean {
		if (
			((q1.x - p1.x) * (q1.y - q2.y) - (q1.y - p1.y) * (q1.x - q2.x)) *
				((q1.x - p2.x) * (q1.y - q2.y) - (q1.y - p2.y) * (q1.x - q2.x)) <
				0 ||
			((p1.x - q1.x) * (p1.y - p2.y) - (p1.y - q1.y) * (p1.x - p2.x)) *
				((p1.x - q2.x) * (p1.y - p2.y) - (p1.y - q2.y) * (p1.x - p2.x)) <
				0
		) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 获取空间两点的距离
	 * @param p1
	 * @param p2
	 */
	public get3DDistance(p1: Vec3, p2: Vec3): number {
		return Vec3.distance(p1, p2);
	}

	public get2DDistance(p1: Vec3, p2: Vec3): number {
		v3_a1.set(p1.x, 0, p1.z);
		v3_a2.set(p2.x, 0, p2.z);

		return Vec3.distance(v3_a1, v3_a2);
	}

	/**
	 * 角度转向量
	 * @param angle
	 */
	public getDirByAngle(angle: number): Vec3 {
		const r = this.getRadian(angle);
		Vec3.rotateY(v3_a1, Vec3.FORWARD, Vec3.ZERO, r);
		return new Vec3(v3_a1);
	}

	public clamp(v:number,min:number,max:number){
		const ret = Math.max(v,min);
		return Math.min(ret,max);
	}

	public clampedMove(lhs:number,rhs:number,clampedDelta:number){
		const delta = rhs - lhs;
		if(delta > 0)
			return lhs + Math.min(delta,clampedDelta);
		else
			return lhs - Math.min(-delta,clampedDelta);
	}

	public rotateTowards(lhs: Vec3, rhs: Vec3, angleMove: number, magnitudeMove) {
		const lhsMag = lhs.length();
		const rhsMag = rhs.length();
		if (lhsMag > Number.EPSILON && rhsMag > Number.EPSILON) {
			const lhsNorm = lhs.divide3f(lhsMag, lhsMag, lhsMag);
			const rhsNorm = rhs.divide3f(rhsMag, rhsMag, rhsMag);
			const dot = Vec3.dot(lhsNorm, rhsNorm);

			if (dot > 1.0 - Number.EPSILON) {
				return this.moveTowards(lhs, rhs, magnitudeMove);
			}
			else if (dot < -1.0 + Number.EPSILON) {
				const axis = this.orthoNormalVectorFast(lhsNorm);
				m3_a1.setAxisAngle(axis,angleMove);
				const rotated = m3_a1.multiplyVec3(v3_a1, lhsNorm);
				const clampe = this.clampedMove(lhsMag,rhsMag,magnitudeMove);
				rotated.multiplyScalar(clampe);
				return rotated;
			}
			else {
				const angle = Math.acos(dot);
				const axis = Vec3.cross(v3_a1, lhsNorm, rhsNorm).normalize();
				m3_a1.setAxisAngle(axis, Math.min(angle,angleMove));
				const rotated = m3_a1.multiplyVec3(v3_a1, lhsNorm);
				const clampe = this.clampedMove(lhsMag,rhsMag,magnitudeMove);
				rotated.multiplyScalar(clampe);
				return rotated;
			}
		} else {
			return this.moveTowards(lhs, rhs, magnitudeMove);
		}
	}

	public orthoNormalVectorFast(n:Vec3){
		const res = new Vec3();
		if(Math.abs(n.z) > 0.7071067811865475244008443621048490){
			const a = n.y*n.y + n.z*n.z;
			const k = 1 / Math.sqrt(a);
			res.x = 0;
			res.y = -n.z * k;
			res.z = n.y * k;
		}
		else{
			const a = n.x*n.x + n.y*n.y;
			const k = 1.0 / Math.sqrt(a);
			res.x = -n.y * k;
			res.y = n.x*k;
			res.z = 0;
		}
		return res;
	}

	public moveTowards(a: Vec3, b: Vec3, clampedDistance: number) {
		const delta = Vec3.subtract(v3_a1, b, a);
		const sqrDelta = delta.lengthSqr();
		const sqrClampedDistance = clampedDistance * clampedDistance;
		if (sqrDelta > sqrClampedDistance) {
			const deltaMag = Math.sqrt(sqrDelta);
			if (deltaMag > Number.EPSILON) {
				const temp = delta.divide3f(deltaMag, deltaMag, deltaMag).multiplyScalar(sqrClampedDistance);
				return Vec3.add(new Vec3(), a, temp);
			} else {
				return a;
			}
		} else {
			return b;
		}
	}

	/**
	 * 精确到小数点后多少位（舍尾）
	 * @param {number} 精确值
	 * @param {number} 精确位数
	 * @return {number}
	 * */
	public exactCount(exactValue: number, count: number = 0): number {
		const num: number = Math.pow(10, count);
		const value: number = (exactValue * num) | 0;
		return value / num;
	}

	/**
	 * [0-1]区间获取二次贝塞尔曲线点切线角度
	 * @param {Vec2} p0起点
	 * @param {Vec2} p1控制点
	 * @param {Vec2} p2终点
	 * @param {number} t [0-1]区间
	 * @return {number}
	 * */
	public getBezierCutAngle(p0: Vec2, p1: Vec2, p2: Vec2, t: number): number {
		const _x: number = 2 * (p0.x * (t - 1) + p1.x * (1 - 2 * t) + p2.x * t);
		const _y: number = 2 * (p0.y * (t - 1) + p1.y * (1 - 2 * t) + p2.y * t);
		const angle: number = this.getAngle(Math.atan2(_y, _x));
		return angle;
	}

	/**
	 * [0-1]区间获取二次贝塞尔曲线上某点坐标
	 * @param {Vec2} p0 起点
	 * @param {Vec2} p1 控制点
	 * @param {Vec2} p2 终点
	 * @param {number} t [0-1]区间
	 * @param {Vec2} 缓存的点对象，如不存在则生成新的点对象
	 * @return {Vec2}
	 * */
	public getBezierPoint(p0: Vec2, p1: Vec2, p2: Vec2, t: number, point: Vec2 = null): Vec2 {
		let rtPoint = point;
		if (!rtPoint) {
			rtPoint = new Vec2();
		}
		rtPoint.x = (1 - t) * (1 - t) * p0.x + 2 * t * (1 - t) * p1.x + t * t * p2.x;
		rtPoint.y = (1 - t) * (1 - t) * p0.y + 2 * t * (1 - t) * p1.y + t * t * p2.y;
		return rtPoint;
	}

	/**
	 * [0-1]区间获取三次贝塞尔曲线上某点坐标
	 * @param {Vec2} p0 起点
	 * @param {Vec2} p1 控制点
	 * @param {Vec2} p2 控制点
	 * @param {Vec2} p3 终点
	 * @param {number} t [0-1]区间
	 * @param {Vec2} 缓存的点对象，如不存在则生成新的点对象
	 * @return {Vec2}
	 * */
	public getBezier3Point(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number, point: Vec2 = null): Vec2 {
		let rtPoint = point;
		if (!rtPoint) {
			rtPoint = new Vec2();
		}
		const cx: number = 3 * (p1.x - p0.x);
		const bx: number = 3 * (p2.x - p1.x) - cx;
		const ax: number = p3.x - p0.x - cx - bx;
		const cy: number = 3 * (p1.y - p0.y);
		const by: number = 3 * (p2.y - p1.y) - cy;
		const ay: number = p3.y - p0.y - cy - by;
		rtPoint.x = ax * t * t * t + bx * t * t + cx * t + p0.x;
		rtPoint.y = ay * t * t * t + by * t * t + cy * t + p0.y;
		return rtPoint;
	}

	/**
	 * [0-1]区间获取三次贝塞尔曲线点切线角度
	 * @param {Vec2} p0起点
	 * @param {Vec2} p1控制点
	 * @param {Vec2} p2控制点
	 * @param {Vec2} p3终点
	 * @param {number} t [0-1]区间
	 * @return {number}
	 * */
	public getBezier3CutAngle(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): number {
		const _x: number =
			p0.x * 3 * (1 - t) * (1 - t) * -1 +
			3 * p1.x * ((1 - t) * (1 - t) + t * 2 * (1 - t) * -1) +
			3 * p2.x * (2 * t * (1 - t) + t * t * -1) +
			p3.x * 3 * t * t;
		const _y: number =
			p0.y * 3 * (1 - t) * (1 - t) * -1 +
			3 * p1.y * ((1 - t) * (1 - t) + t * 2 * (1 - t) * -1) +
			3 * p2.y * (2 * t * (1 - t) + t * t * -1) +
			p3.y * 3 * t * t;
		const angle: number = this.getAngle(Math.atan2(_y, _x));
		return angle;
	}

	public isZero(p: Vec2): boolean {
		return p.x === 0 && p.y === 0;
	}

	/**
	 * 获取一个指定区间的随机数
	 *
	 * @static
	 * @param {number} start
	 * @param {number} end
	 * @returns {number}
	 * @memberof MathUtil
	 */
	public random(start: number, end: number): number {
		const min: number = Math.min(start, end);
		const max: number = Math.max(start, end);
		const range: number = max - min;
		return min + Math.random() * range;
	}

	/**
	 * 获取一个随机整数
	 *
	 * @param {number} start
	 * @param {number} end
	 * @returns {number}
	 */
	public randomInt(start: number, end: number): number {
		return Math.floor(this.random(start, end + 1));
	}

	/**
	 * 在数组中随机一个元素
	 *
	 * @static
	 * @template T
	 * @param {T[]} arr
	 * @returns {T}
	 * @memberof MathUtil
	 */
	public randomInArray<T>(arr: T[]): T {
		if (!arr || arr.length <= 0) return null;
		return arr[this.randomInt(0, arr.length - 1)];
	}
}
