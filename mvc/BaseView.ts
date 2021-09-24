import { tween, Tween, warn } from "cc";
import * as fgui from "fairygui-cc";
import BComponent from "../base/BComponent";
import AppConfig from "../const/AppConfig";
import { ViewAreaType, ViewEvent, ViewLayerType, ViewType } from "../const/CoreConst";
import FguiLoader from "../FguiLoader";
import EventManager from "../manager/EventManager";
import StageManager from "../manager/StageManager";
import DisplayUtils from "../utils/DisplayUtils";
import BaseCtrl from "./BaseCtrl";
import BaseModel from "./BaseModel";
import BaseViewData from "./BaseViewData";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-14 19:02:44
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-05-12 19:47:57
 */
export default class BaseView extends BComponent {
	/**viewType类型 */
	private _type: ViewType;
	/**界面展开动画类型 */
	private _aniType: string;
	/**铺展类型 */
	private _areaType: ViewAreaType;
	/**view所属层级 */
	private _layer: ViewLayerType;
	/**包名 */
	private _pkgName: string;
	/**单个界面资源 */
	private _resName: string;
	/**模块数据源 */
	private _model: BaseModel;
	/**界面控制 */
	private _ctrl: BaseCtrl;
	/**是否消耗 */
	private _isDestroy: boolean;
	/**是否托管资源 */
	private _isTrust: boolean;
	/**资源是否托管中 */
	private _isTrusting: boolean;
	/**view透传数据 */
	private _viewData: BaseViewData;

	/**蒙层透明度 */
	private _bgAlpha: number;
	/**蒙层背景组件 */
	private _bgLoader: fgui.GLoader;
	/**主体组件 */
	private _contentPane: fgui.GComponent;
	/**旋转加载屏蔽组件 */
	private _modalWaitPane: fgui.GComponent;
	/**bg组件 */
	private _bgCom: fgui.GComponent;
	/**bg组件地址 */
	private _bgComUrl: string;
	/**默认动画 */
	private _btween: Tween<fgui.GComponent>;

	/**
	 * 构造函数
	 * @param pkgName 包名
	 * @param resName 界面view文件名
	 * @param type 界面类型，ViewType
	 * @param layer 界面显示在哪层中
	 */
	public constructor(pkgName: string, resName: string, type: ViewType, layer: ViewLayerType) {
		super();
		this._pkgName = pkgName;
		this._resName = resName;
		this._type = type;
		this._layer = layer;
		this._isTrust = true;
		this._areaType = ViewAreaType.SAFE;
		this.isInit = false;
	}

	/**
	 * view透传数据
	 */
	public set viewData(_viewData: BaseViewData) {
		this._viewData = _viewData;
	}
	public get viewData(): BaseViewData {
		return this._viewData;
	}
	public getViewData<T extends BaseViewData>(): T {
		return this._viewData as T;
	}

	/**
	 * model数据
	 */
	public set model(_model: BaseModel) {
		this._model = _model;
		this._ctrl && (this._ctrl.model = _model);
	}
	public get model(): BaseModel {
		return this._model;
	}
	public getModel<T extends BaseModel>(): T {
		return this._model as T;
	}

	/**
	 * ctrl控制
	 */
	public set ctrl(_ctrl: BaseCtrl) {
		this._ctrl = _ctrl;
		this._ctrl && (this._ctrl.view = this);
	}
	public get ctrl(): BaseCtrl {
		return this._ctrl;
	}
	public getCtrl<T extends BaseCtrl>(): T {
		return this._ctrl as T;
	}

	/**
	 * 层级控制
	 */
	public set layer(_layer: ViewLayerType) {
		this._layer = _layer;
	}
	public get layer(): ViewLayerType {
		return this._layer;
	}

	/**
	 * ui主体部分（set get）
	 */
	public set contentPane(contentPane: fgui.GComponent) {
		this._contentPane = contentPane;
		this.addChild(contentPane);
		// this.onEnable();
	}
	public get contentPane(): fgui.GComponent {
		return this._contentPane;
	}

	/**
	 * bgcom set
	 */
	public set bgComUrl(value: string) {
		this._bgComUrl = value;
	}

	public setBgCom(bgComUrl: string) {
		if (this._bgCom || !bgComUrl) {
			return;
		}

		this._bgCom = fgui.UIPackage.createObjectFromURL(bgComUrl).asCom;
		if (this._bgCom) {
			this._bgCom.width = this.width;
			this._bgCom.height = this.height;
			this.addChildAt(this._bgCom, 0);
		}
	}

	public getBgCom(): fgui.GComponent {
		return this._bgCom;
	}

	/**
	 * 继承重写获取控制器
	 */
	public getController(name: string, pane: fgui.GComponent = this.contentPane): fgui.Controller {
		if (pane) {
			return pane.getController(name);
		}
		return null;
	}

	/**
	 * 继承重写获取动效控制
	 */
	public getTransition(name: string, pane: fgui.GComponent = this.contentPane): fgui.Transition {
		if (pane) {
			return pane.getTransition(name);
		}
		return null;
	}

	/**
	 * 界面展开动画类型获取
	 */
	public get aniType(): string {
		return this._aniType;
	}

	/**
	 * view界面类型
	 */
	public get type(): number {
		return this._type;
	}

	/**
	 * 销毁状态
	 */
	public get isDestroy(): boolean {
		return this._isDestroy;
	}

	/**
	 * 是否托管资源，如果界面资源不需要定时释放，可重写该方法或者设置该属性
	 */
	public get isTrust(): boolean {
		return this._isTrust;
	}
	public set isTrust(value: boolean) {
		this._isTrust = value;
	}

	/**
	 * 弹窗透明度设置
	 */
	public get bgAlpha(): number {
		return this._bgAlpha === void 0 ? 0.6 : this._bgAlpha;
	}
	public set bgAlpha(value: number) {
		this._bgAlpha = value;
	}

	/**
	 * 设置区域类型
	 */
	public get areaType(): ViewAreaType {
		return this._areaType;
	}
	public set areaType(value: ViewAreaType) {
		this._areaType = value;
	}

	/**
	 * 消耗，子类可继承重写添加消耗逻辑
	 */
	public destroy(): void {
		this._btween && this._btween.stop();
		FguiLoader.getInstance().unloadUIPkg(this._pkgName);
		this._ctrl && this._ctrl.destroy();

		if (this._isTrusting) {
			this._isTrusting = false;
		}
		this._isDestroy = true;
		this.isInit = false;
		this._pkgName = null;
		this._resName = null;
		this._ctrl = null;
		this._model = null;
		if (this._bgLoader) {
			this._bgLoader.dispose();
			this._bgLoader = null;
		}
		if (this._modalWaitPane) {
			this._modalWaitPane.dispose();
			this._modalWaitPane = null;
		}
		if (this._contentPane) {
			this._contentPane.dispose();
			this._contentPane = null;
		}
		this.dispose();
	}

	/**
	 * 加载旋转提示
	 */
	public showModalWait(): void {
		if (fgui.UIConfig.windowModalWaiting) {
			if (!this._modalWaitPane) {
				this._modalWaitPane = fgui.UIPackage.createObjectFromURL(fgui.UIConfig.windowModalWaiting).asCom;
			}
			this.addChild(this._modalWaitPane);
			const stageMgr = StageManager.getInstance();
			this._modalWaitPane.setSize(stageMgr.stageWidth, stageMgr.stageHeight);
		}
	}
	public closeModalWait(): void {
		if (this._modalWaitPane && this._modalWaitPane.parent != null) {
			this.removeChild(this._modalWaitPane);
		}
	}

	/**
	 * 界面显示接口
	 */
	public show(): void {
		this.initStart();
	}

	/**
	 * pane主体适配关联方式，如有特别需求可自定义重写
	 */
	protected onContentPaneRelation(): void {
		const contentPane = this._contentPane;
		this.setSize(contentPane.width, contentPane.height);
		switch (this.type) {
			case ViewType.VIEW:
				if (this.areaType === ViewAreaType.SAFE) {
					const stageMgr = StageManager.getInstance();
					contentPane.setSize(stageMgr.actionWidth, stageMgr.actionHeight);
					contentPane.x = stageMgr.actionX;
					contentPane.y = stageMgr.actionY;
				} else {
					contentPane.addRelation(this, fgui.RelationType.Size);
				}
				break;
			case ViewType.WINDOW:
			case ViewType.X_WINDOW:
			case ViewType.NO_CLICK_WINDOW:
				contentPane.x = (this.width - contentPane.width) >> 1;
				contentPane.y = (this.height - contentPane.height) >> 1;
				contentPane.addRelation(this, fgui.RelationType.Center_Center);
				contentPane.addRelation(this, fgui.RelationType.Middle_Middle);
				break;
		}
	}

	/**
	 * 初始化ui结束，初始化view信息从这里开始
	 */
	protected onInit(): void { }
	/**
	 * 完全显示界面
	 */
	protected onShown(): void {
		if (this.node) {
			this.node.emit("onShown");
		}
	}

	protected onEnable() {
		if (this.isInit) {
			super.onEnable();
		}
	}

	protected onDisable() {
		if (this.isInit) {
			super.onDisable();
		}
	}


	/**
	 * 帧刷新事件
	 */
	protected onUpdate(dt?: number): void { }
	/**
	 * 加载进度
	 */
	protected onProgress(completedCount: number, totalCount: number, item: any): void { }
	/**
	 * 背景蒙层点击方法，子类实现逻辑
	 */
	protected onClickMatte(): void { }

	/**
	 * 如果界面显示展开动画不一样可继承重写改方法
	 */
	protected onShowAnimation(): void {
		// todo: 操作展开动画
		if (this.type !== ViewType.VIEW) {
			const pivotX = this._contentPane.pivotX;
			const pivotY = this._contentPane.pivotY;
			const asAnchor = this._contentPane.pivotAsAnchor;
			this._btween && this._btween.stop();
			this._contentPane.setPivot(0.5, 0.5, asAnchor);
			this._contentPane.setScale(0, 0);
			const _tween = tween(this._contentPane);
			_tween.to(0.06, { scaleX: 0.5, scaleY: 0.5 }, { easing: 'quadOut' });
			_tween.to(0.1, { scaleY: 1, scaleX: 1 }, { easing: "backOut" });
			_tween.call(() => {
				this._contentPane.setPivot(pivotX, pivotY, asAnchor);
				this.onCompleteAnimation();
			});
			_tween.start();
			this._btween = _tween;
		}
		else {
			this.onCompleteAnimation();
		}
	}

	/**
	 * 继承重写window中的onInit方法
	 */
	private initStart(): void {
		if (!this._pkgName || !this._resName) {
			warn("该界面包名不存在！");
			return;
		}

		this.showModalWait();


		const pkg: fgui.UIPackage = fgui.UIPackage.getByName(this._pkgName);
		if (!this.isInit || !pkg) {
			FguiLoader.getInstance().loadUIPkg(this._pkgName, this.onProgress.bind(this), (err, pkg) => {
				if (err) {
					this.destroy();
				} else {
					pkg.addRef();
					this.toInitUI();
				}
			});
		} else {
			pkg.addRef();
			this.onCompleteUI();
		}
	}

	/**
	 * 初始化ui
	 */
	private toInitUI(): void {
		if (this._isDestroy) {
			this.closeModalWait();
			return;
		}
		const view = fgui.UIPackage.createObject(this._pkgName, this._resName);
		if (!view) {
			console.error("UI组件创建失败 pkg:", this._pkgName, " 组件:", this._resName);
			return;
		}
		this.contentPane = view.asCom;
		const displayUtils = DisplayUtils.getInstance<DisplayUtils>();
		displayUtils.bindComponentToObj(this.contentPane, this);
		this.onContentPaneRelation();
		const stageMgr = StageManager.getInstance();
		this.setSize(stageMgr.stageWidth, stageMgr.stageHeight);
		this.addRelation(stageMgr.GRoot, fgui.RelationType.Size);
		this.onCompleteUI();
		this.isInit = true;
		this.onEnable();
	}

	/**
	 * ui初始化完成后
	 */
	private onCompleteUI(): void {
		this.closeModalWait();
		this.onWindowBG();
		this.onInit();
		// if (this.value != undefined) this.doData();
		this.setBgCom(this._bgComUrl);
		this.onShowAnimation();
	}

	/**
	 * 完成动画全部界面完全显示
	 */
	private onCompleteAnimation(): void {
		// 背景蒙层点击事件
		if (this._bgLoader) {
			this._bgLoader.offClick(this.onClickMatte, this);
			this._bgLoader.onClick(this.onClickMatte, this);
		}
		// 完全显示方法，给继承子类用
		this.onShown();
		// 完全显示事件
		const key = (this.constructor as any).key;
		if (key) {
			const eventMgr = EventManager.getInstance();
			eventMgr.emitEvent(ViewEvent.VIEW_SHOWN, key);
		}
	}

	/**
	 * 显示类型ViewType背景控制
	 */
	private onWindowBG(): void {
		if (this.type === ViewType.VIEW || this.type === ViewType.NO_CLICK_WINDOW) {
			if (this._bgLoader) {
				this._bgLoader.dispose();
				this._bgLoader = null;
			}
		} else {
			if (!this._bgLoader) {
				this._bgLoader = new fgui.GLoader();
				const stageMgr = StageManager.getInstance();
				this._bgLoader.setSize(stageMgr.stageWidth, stageMgr.stageHeight);
				this._bgLoader.touchable = true;
				if (this.type === ViewType.X_WINDOW) {
					this._bgLoader.url = AppConfig.matteUrl;
					this._bgLoader.fill = fgui.LoaderFillType.ScaleFree;
				}
				this.addChildAt(this._bgLoader, 0);
				this._bgLoader.alpha = this.bgAlpha;
			}
		}
	}
}
