import { ScreenOrientationType } from "./CoreConst";

export default class AppConfig {

    /**
	 * ui原始宽
	 */
    public static readonly initWidth: number = 750;
    /**
	 * ui原始高
	 */
    public static readonly initHeight: number = 1334;
    /**
	 * 蒙层背景图片
	 */
	public static readonly matteUrl: string = "ui://preload/wBg";
	/**
	 * 资源无引用后缓存时间(s)
	 */
	public static readonly resCacheTime: number = 3 * 60;
	/**
	 * 设置游戏横竖屏
	 */
	public static readonly screenOrientation: ScreenOrientationType =
		ScreenOrientationType.Portrait;

}