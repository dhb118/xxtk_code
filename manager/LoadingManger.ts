import * as fgui from "fairygui-cc";
import GlobalModalWaiting from "../../module/preload/GlobalModalWaiting";
import ViewLayer from "../const/ViewLayer";

/*
 * @Author: yanmingjie.jack@shandagames.com
 * @Date: 2020-08-21 14:24:30
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-05-12 19:47:27
 */
export default class LoadingManager{

    private static _instance: LoadingManager;
	public static getInstance(): LoadingManager {
		if (!this._instance) {
			this._instance = new LoadingManager();
		}
		return this._instance;
    }


    /**旋转ui */
    private _ui: GlobalModalWaiting;
    /**展示旋转记录次数 */
    private _allLoadingNum: number;

    public constructor() {
        this._allLoadingNum = 0;
    }

    /**
     * 显示loading旋转
     */
    public show(): void {
        ++this._allLoadingNum;
        this.initUi();
        this.onShow();
    }

    /**
     * 关闭load，关闭一次。如果有多次还会等待数据
     */
    public close(): void {
        --this._allLoadingNum;
        if (this._allLoadingNum <= 0) {
            this.closeAll();
        }
    }

    /**
     * 关闭所有load
     */
    public closeAll(): void {
        this._allLoadingNum = 0;
        this._ui.visible = false;
    }

    /**
     * 销毁
     */
    public destory(): void {
        this.closeAll();
        this._ui && this._ui.dispose();
        this._ui = null;
    }

    /**
     * 显示旋转
     */
    private onShow(): void {
        if(this._ui){
            this._ui.visible = true;
        }
    }

    private initUi(): void {
        if (!this._ui) {
            this._ui = fgui.UIPackage.createObjectFromURL(fgui.UIConfig.windowModalWaiting) as GlobalModalWaiting;
            ViewLayer.MAX_COMPONENT.addChild(this._ui);
        }
    }

}