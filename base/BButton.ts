import * as fgui from "fairygui-cc";
import EventManager from "../manager/EventManager";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-25 13:54:13
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-05-12 19:46:34
 */
export default class BButton extends fgui.GButton {

	/**
	 * xml初始化完成后，可在这里做一些初始化操作
	 */
	protected onConstruct(): void {}

	/**
	 * 帧刷新事件(s)
	 */
	protected onUpdate(dt?: number): void {}

	/**
	 * 全局事件处理
	 */
	protected addEventListener(
		type: string,
		callback: Function,
		target?: any,
		useCapture?: boolean
	): void {
		const eventManager = EventManager.getInstance();
		eventManager.addEventListener.apply(eventManager, arguments);
	}
	protected offEventListener(
		type: string,
		callback?: Function,
		target?: any
	): void {
		const eventManager = EventManager.getInstance();
		eventManager.offEventListener.apply(eventManager, arguments);
	}
	protected emitEvent(
		type: string,
		arg1?: any,
		arg2?: any,
		arg3?: any,
		arg4?: any,
		arg5?: any
	): void {
		const eventManager = EventManager.getInstance();
		eventManager.emitEvent.apply(eventManager, arguments);
	}
	protected hasAddEventListener(type: string): boolean {
		const eventManager = EventManager.getInstance();
		return eventManager.hasAddEventListener(type);
	}
}
