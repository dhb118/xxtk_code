import { Asset } from "cc";

/*
 * @Author: yanmingjie
 * @Date: 2020-07-01 21:45:39
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-03-29 20:33:33
 */
export interface ResFile {
	url: string;
	type: typeof Asset;
	isDir?:boolean;
}

export enum FitType {
	/**
	 * 水平居中
	 */
	ALIGN_CENTER = "center",
	/**
	 * 水平靠左
	 */
	ALIGN_LEFT = "left",
	/**
	 * 水平靠右
	 */
	ALIGN_RIGHT = "right",
	/**
	 * 垂直居中
	 */
	ALIGN_MIDDLE = "middle",
	/**
	 * 垂直靠上
	 */
	ALIGN_TOP = "top",
	/**
	 * 垂直靠底
	 */
	ALIGN_BOTTOM = "buttom",
}

export enum I18nType {
	/**中文 */
	ZH = "zh",
	/**英文 */
	EN = "en",
}

export enum PlatformType {
	/**web*/
	WEB = "web",
	/**native*/
	NATIVE = "native",
	/**wx mini game*/
	WX = "wx",
	/**qq mini game*/
	QQ = "qq",
}

export enum ViewLayerType {
	/**
	 * view底层类型
	 */
	BOTTOM_LAYER = "bottom_layer",

	HALF_BOTTOM_LAYER = "half_bottom_layer",
	/**
	 * view中层类型
	 */
	MIDDLE_LAYER = "middle_layer",
	/**
	 * view上层类型
	 */
	TOP_LAYER = "top_layer",
	/**
	 * gm
	 */
	GM_LAYER = 'gm_layer',
	/**
	 * 引导层类型
	 */
	GUIDE_LAYER = "guide_layer",
	/**
	 * 弹窗层类型
	 */
	WINDOW_LAYER = "window_layer",
	/**
	 * 最外层类型
	 */
	MAX_LAYER = "max_layer",
}

export enum ViewAreaType {
	/**铺满整个舞台区域 */
	STAGE,
	/**只会铺满安全区域 */
	SAFE
}

export enum ViewShowType {
	/**
	 * 显示在单个弹窗中，该弹窗会逐个弹出
	 */
	SINGLETON_VIEW = 1,
	/**
	 * 多个界面堆积显示，默认是该显示类型
	 */
	MULTI_VIEW = 2,
}

export enum ViewType {
	/**
	 * view界面
	 */
	VIEW = 1,
	/**
	 * 无黑色蒙层背景，可背景点击监听
	 */
	WINDOW = 2,
	/**
	 * 有黑色蒙层背景，可背景点击监听
	 */
	X_WINDOW = 3,
	/**
	 * 无黑色蒙层，无背景点击监听
	 */
	NO_CLICK_WINDOW = 4,
}

export enum ViewEvent {
	/**
	 * 显示view事件
	 */
	VIEW_SHOW = "view_show",
	/**
	 * 完全显示view事件
	 */
	VIEW_SHOWN = "view_shown",
	/**
	 * 关闭view事件
	 */
	VIEW_CLOSE = "view_close",
	/**
	 * 逐个弹窗结束
	 */
	WINDOW_CLOSE = "window_close",
}

export enum ScreenOrientationType {
	/**竖屏 */
	Portrait = "Portrait",
	/**横屏 */
	Landscape = "Landscape",
}