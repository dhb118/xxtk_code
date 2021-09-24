import * as fgui from "fairygui-cc";
import { EventDecoratorConst } from "../../melon_runtime/Attibute";
import { facade } from "../../melon_runtime/MVC";
import EventManager from "../manager/EventManager";
import { socketEvent } from "../net/connector/SocketEvent";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-25 13:54:13
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-05-12 19:46:43
 */
export default class BComponent extends fgui.GComponent {

	public _value: any;

	public get value() {
		return this._value;
	}

	public _index: number;

	public get index() {
		return this._index;
	}

	public set index(value: number) {
		this._index = value;
	}

	public set value(data: any) {
		this._value = data;
		if (data != undefined) {
			this._value = data;
			if (this.isInit) this.doData();
		}
	}

	/**是否初始化 */
	protected _isInit: boolean = true;
	/**
	 * 是否初始化
	 */
	public get isInit(): boolean {
		return this._isInit;
	}

	public set isInit(value: boolean) {
		this._isInit = value;
		if (value && this.value) this.doData();
	}

	/**
	 * xml初始化完成后，可在这里做一些初始化操作
	 */
	protected onConstruct(): void { }

	/**
	 * 帧刷新事件(s)
	 */
	protected onUpdate(dt?: number): void { }

	/**
	 * 全局事件处理
	 */
	protected addEventListener(type: string, callback: Function, target?: any, useCapture?: boolean): void {
		const eventManager = EventManager.getInstance();
		eventManager.addEventListener.apply(eventManager, arguments);
	}
	protected offEventListener(type: string, callback?: Function, target?: any): void {
		const eventManager = EventManager.getInstance();
		eventManager.offEventListener.apply(eventManager, arguments);
	}
	protected emitEvent(type: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): void {
		const eventManager = EventManager.getInstance();
		eventManager.emitEvent.apply(eventManager, arguments);
	}
	protected hasAddEventListener(type: string): boolean {
		const eventManager = EventManager.getInstance();
		return eventManager.hasAddEventListener(type);
	}


	protected onEnable() {
		facade.registerEventDecorator(EventDecoratorConst.EVT, this);
		socketEvent.registerEventDecorator(EventDecoratorConst.SOCKET_EVT, this);
		this.awaken();
	}

	protected onDisable() {
		facade.removeEventDecorator(EventDecoratorConst.EVT, this);
		socketEvent.removeEventDecorator(EventDecoratorConst.SOCKET_EVT, this);
		this.sleep();
		super.onDisable();
	}

	// protected onDestroy() {
	// 	facade.removeEventDecorator(EventDecoratorConst.EVT, this);
	// 	socketEvent.removeEventDecorator(EventDecoratorConst.SOCKET_EVT, this);
	// 	this.sleep();
	// 	super.onDestroy();
	// }

	doData() {

	}


	protected awaken() {

	}

	protected sleep() {

	}
}
