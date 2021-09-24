import { Rect, Size, sys, view, View } from "cc";
import { EDITOR } from "cc/env";
import * as fgui from "fairygui-cc";
import { ViewAreaType } from "../const/CoreConst";
import BaseView from "../mvc/BaseView";
import ViewManager from "./ViewManager";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-18 15:04:52
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-05-12 19:47:43
 */
export default class StageManager {
	private static _instance: StageManager;
	public static getInstance(): StageManager {
		if (!this._instance) {
			this._instance = new StageManager();
		}
		return this._instance;
	}

	/**获取完全可操作区域 */
	private _actionRect: { x: number; y: number; width: number; height: number };
	/**舞台显示范围 */
	private _stageRect: { width: number; height: number };

	public constructor() {

	}

	/**
	 * 场景初始化
	 */
	public init(): void {
		this.changeViewFit();
		this.initFitNode();
	}

	/**
	 * 获取ui根节点
	 */
	public get GRoot(): fgui.GRoot {
		return fgui.GRoot.inst;
	}

	/**
	 * 获取舞台宽高
	 */
	public get stageWidth(): number {
		return this._stageRect.width;
	}
	public get stageHeight(): number {
		return this._stageRect.height;
	}

	/**
	 * 获取可操作区域宽度
	 */
	public get actionWidth(): number {
		return this._actionRect.width;
	}

	/**
	 * 获取可操作区域高度
	 */
	public get actionHeight(): number {
		return this._actionRect.height;
	}

	/**
	 * 获取可操作区域x
	 */
	public get actionX(): number {
		return this._actionRect.x;
	}

	/**
	 * 获取可操作区域y
	 */
	public get actionY(): number {
		return this._actionRect.y;
	}

	/**
	 * 初始化舞台区域尺寸
	 */
	private initStageRect(): void {
		const cView = view;
		const size: Size = cView.getCanvasSize();
		size.width /= cView.getScaleX();
		size.height /= cView.getScaleY();
		this._stageRect = {
			width: size.width,
			height: size.height,
		};
		if (!this._actionRect) {
			this._actionRect = {
				width: this._stageRect.width,
				height: this._stageRect.height,
				x: 0,
				y: 0
			}
		}
	}

	/**
	 * 显示区域变化事件监听
	 */
	private changeViewFit(): void {
		const fitFun = this.initFitNode.bind(this);
		if (EDITOR) {
			view.on(
				"design-resolution-changed",
				fitFun
			);
		} else {
			if (sys.isMobile) {
                window.addEventListener('resize', fitFun);
                window.addEventListener('orientationchange', fitFun);
            } else {
                View.instance.on('design-resolution-changed', fitFun, this);
            }
		}
	}

	/**
	 * 初始化适配节点
	 * 这里用来调整显示区域，不同手机显示适配，具体ui适配需要ui中调整
	 */
	private initFitNode(): void {
		this.initStageRect();

		const _this = this;
		fgui.GRoot.inst.setSize(this.stageWidth, this.stageHeight);
		if( typeof(sys.getSafeAreaRect)=="function"){
			//cocos返回的安全区域原点是左下角
			const safeArea = sys.getSafeAreaRect() as Rect;
			this._actionRect.y = this.stageHeight - safeArea.height ;
			this._actionRect.x = this.stageWidth - safeArea.width ;
			this._actionRect.height = safeArea.height;
			this._actionRect.width = safeArea.width;
			_this.viewFit();
		}
	}

	private viewFit(): void {
		const viewMgr = ViewManager.getInstance();
		const views = (viewMgr as any)._views;
		if (!views) return;
		const actionRect = this._actionRect;
		Object.values(views).forEach((view: BaseView)=>{
			const contentPane = view.contentPane;
			if (contentPane && view.areaType === ViewAreaType.SAFE) {
				contentPane.setSize(actionRect.width, actionRect.height);
				contentPane.setPosition(actionRect.x, actionRect.y);
			}
		});
	}

}
