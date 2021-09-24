import { error, js } from "cc";
import * as fgui from "fairygui-cc";
import { ViewEvent, ViewLayerType, ViewShowType } from "../const/CoreConst";
import BaseCtrl from "../mvc/BaseCtrl";
import BaseModel from "../mvc/BaseModel";
import { classViews } from "../mvc/BaseUtils";
import BaseView from "../mvc/BaseView";
import BaseViewData from "../mvc/BaseViewData";
import EventManager from "./EventManager";
import LayerManager from "./LayerManager";
import ModelManager from "./ModelManager";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-18 10:54:16
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-06-03 14:26:43
 */
export default class ViewManager {

	private static _instance: ViewManager;
	public static getInstance(): ViewManager {
		if (!this._instance) {
			this._instance = new ViewManager();
		}
		return this._instance;
	}

	/**所有正在显示view集 */
	private _views: { [key: string]: BaseView };

	/**将要逐个显示view集，二维数组：[[ctrlClass, modelClass, viewClass, viewData, layer]] */
	private _willViews: any[];
	/**当前显示单个view */
	private _currView: { new(): BaseView };
	/**是否暂停逐个显示view功能 */
	private _isPause: boolean;

	public init(): void {
		this._views = js.createMap();
		this._willViews = [];
	}

	/**
	 * 显示view
	 * @param ctrlClass view控制类 new () => BaseCtrl or typeof BaseCtrl
	 * @param modelClass model类，该数据源是单例
	 * @param viewClass view类
	 * @param viewData view类数据
	 * @param showType 显示类型，显示在单还是多窗体
	 * @param layer 显示在那一层中，默认使用view本身层中，一般不使用
	 * @param onShown 界面加载完成并显示的回调,可以在该回调进行对控件属性设置.
	 */
	public show<T extends BaseView>(
		ctrlClass: { new(): BaseCtrl } | null,
		modelClass: { new(): BaseModel } | null,
		viewClass: { new(): T },
		viewData: BaseViewData | null = null,
		showType: ViewShowType = ViewShowType.MULTI_VIEW,
		layer: ViewLayerType | null = null,
		onShown?: (view: T) => void
	): T {
		console.log("load module" + viewClass.name);
		const key: string = (viewClass as any).key;
		if (!key) {
			error(`${viewClass.name} 未定义public static readonly key变量，请在检查一下遗漏！`);
		}
		// 单个窗体显示
		if (showType === ViewShowType.SINGLETON_VIEW) {
			this._willViews.push([ctrlClass, modelClass, viewClass, viewData, layer]);
			return this.nextShow() as T;
		}
		// 多个窗体显示
		let view: BaseView = this._views[key];
		if (view && !view.isDestroy) {
			view.viewData = viewData;
		} else {
			const modelMgr = ModelManager.getInstance();
			const ctrl: BaseCtrl = ctrlClass ? new ctrlClass() : null;
			let model: BaseModel = modelMgr.getModel(modelClass);
			if (modelClass && !model) {
				model = modelMgr.register(modelClass);
			}
			view = new viewClass();
			view.viewData = viewData;
			view.ctrl = ctrl;
			view.model = model;
			this._views[key] = view;
		}

		if (layer) {
			view.layer = layer;
		}
		if (!view.layer) {
			error("该view未设置显示layer层！");
		}

		const layerMgr = LayerManager.getInstance<LayerManager>();
		const layerCom: fgui.GComponent = layerMgr.getLayerComponent(
			view.layer
		);
		layerCom.addChild(view);

		if (onShown) {
			view.node.once("onShown", () => {
				onShown && onShown(view);
			});
		}

		view.show();

		view.value = viewData;

		const eventMgr = EventManager.getInstance();
		eventMgr.emitEvent(ViewEvent.VIEW_SHOW, key);

		return view as T;
	}

	/**
	 * 关闭view
	 * @param viewClass view类
	 * @param isDestroy 是否销毁，默认消耗
	 */
	public close(
		viewClass: { new(): BaseView },
		isDestroy: boolean = true
	): void {
		const key: string = (viewClass as any).key;
		if (!this._views || !this._views[key]) {
			return;
		}

		const view: BaseView = this._views[key];
		view.removeFromParent();
		if (isDestroy) {
			delete this._views[key];
			view.destroy();
		}

		const eventMgr = EventManager.getInstance();
		eventMgr.emitEvent(ViewEvent.VIEW_CLOSE, key);
		// 继续下一个view显示
		if (this._currView === viewClass) {
			this._currView = null;
			this.nextShow();
		}
	}

	/**
	 * 关闭所有显示界面
	 */
	public closeAll(): void {
		Object.values(this._views).forEach((view) => {
			view.removeFromParent();
			view.destroy();
		});
		this._views = js.createMap();

		this._currView = null;
		this._willViews.length = 0;
		this._isPause = false;
	}

	/**
	 * 获取view
	 * @param viewClass view类
	 */
	public getView<T extends BaseView>(viewClass: { new(): T }): T {
		const key: string = (viewClass as any).key;
		if (!this._views || !this._views[key]) {
			return null;
		}
		return this._views[key] as T;
	}

	/**
	 * 获取view
	 * @param key
	 */
	public getViewByKey<T extends BaseView>(key: string): T {
		const view = this._views[key];
		if (view) {
			return view as T;
		}
		return null;
	}

	/**
	 * 是否存在该view
	 * @param viewClass view类
	 */
	public isExist(viewClass: { new(): BaseView }): boolean {
		const key: string = (viewClass as any).key;
		if (this._views && this._views[key]) {
			return true;
		}
		return false;
	}

	/**
	 * 是否存在单体弹窗
	 */
	public isExistWillView(): boolean {
		if (this._currView || (this._willViews && this._willViews.length > 0)) {
			return true;
		}
		return false;
	}

	/**
	 * 手动注册class
	 * @param key
	 * @param viewClass
	 */
	public registerClass(key: string, viewClass: { new(): BaseView }): void {
		classViews[key] = viewClass;
	}

	/**
	 * 手动注销class
	 * @param key
	 */
	public unregisterClass(key: string): void {
		if (classViews[key]) {
			delete classViews[key];
		}
	}

	/**
	 * 获取view对应的class
	 * @param key
	 */
	public getViewClass(key: string): { new(): BaseView } {
		return classViews[key];
	}

	/**
	 * 暂停逐个view显示
	 */
	public set isPause(_isPause: boolean) {
		this._isPause = _isPause;
		if (!_isPause) {
			this.nextShow();
		}
	}

	/**
	 * 获取暂停信息
	 */
	public get isPause(): boolean {
		return this._isPause;
	}

	/**
	 * 显示下个view
	 */
	private nextShow(): BaseView {
		if (this._currView || this._isPause) {
			return null;
		}
		if (this._willViews.length === 0) {
			const eventMgr = EventManager.getInstance();
			eventMgr.emitEvent(ViewEvent.WINDOW_CLOSE);
			return null;
		}

		const willArr: any[] = this._willViews.shift();
		const ctrlClass: { new(): BaseCtrl } = willArr[0];
		const modelClass: { new(): BaseModel } = willArr[1];
		const viewClass: { new(): BaseView } = willArr[2];
		const viewData: BaseViewData = willArr[3];
		const layer: ViewLayerType = willArr[4];
		this._currView = viewClass;
		const view: BaseView = this.show(
			ctrlClass,
			modelClass,
			viewClass,
			viewData,
			ViewShowType.MULTI_VIEW,
			layer
		);
		return view;
	}

}
