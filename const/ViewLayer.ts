import * as fgui from "fairygui-cc";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-16 17:01:29
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-05-12 19:46:52
 */
export default class ViewLayer {

    /**
     * view底层
     */
    public static BOTTOM_COMPONENT: fgui.GComponent;

    public static HALF_BOTTOM_COMPONENT: fgui.GComponent;
    /**
     * view中层
     */
    public static MIDDLE_COMPONENT: fgui.GComponent;
    /**
     * view上层
     */
    public static TOP_COMPONENT: fgui.GComponent;
    /**
     * gm
     */
    public static GM_COMPONENT: fgui.GComponent;
    /**
     * 引导层
     */
    public static GUIDE_COMPONENT: fgui.GComponent;
    /**
     * 弹窗层
     */
    public static WINDOW_COMPONENT: fgui.GComponent;
    /**
     * 最外层
     */
    public static MAX_COMPONENT: fgui.GComponent;


    /**
     * 初始化view层信息，直接如下面写法，Cocos creator发布构建报错异常
     * public static readonly MAX_COMPONENT: fgui.GComponent = new fgui.GComponent();
     */
    public static init(): void {
        this.BOTTOM_COMPONENT = new fgui.GComponent();
        this.HALF_BOTTOM_COMPONENT = new fgui.GComponent();
        this.MIDDLE_COMPONENT = new fgui.GComponent();
        this.TOP_COMPONENT = new fgui.GComponent();
        this.GM_COMPONENT = new fgui.GComponent();
        this.GUIDE_COMPONENT = new fgui.GComponent();
        this.WINDOW_COMPONENT = new fgui.GComponent();
        this.MAX_COMPONENT = new fgui.GComponent();
    }

}