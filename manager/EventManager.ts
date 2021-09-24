import { EventTarget } from "cc";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-09 15:07:44
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2020-11-25 19:12:47
 */
export default class EventManager {

    private static _instance: EventManager;
	public static getInstance(): EventManager {
		if (!this._instance) {
			this._instance = new EventManager();
		}
		return this._instance;
    }

    /**事件节点 */
    private _eventNode: EventTarget;

    public constructor() {
        this._eventNode = new EventTarget();
    }

    /**
     * 再次封装方法是为了全局事件监听名字统一，方便理解和处理
     */
    public addEventListener(type: string, callback: Function, target?: any, useCapture?: boolean): void {
        this._eventNode.on.apply(this._eventNode, arguments);
    }
    public addOnceEventListener(type: string, callback: (arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any) => void, target?: any): void {
        this._eventNode.once.apply(this._eventNode, arguments);
    }
    public offEventListener(type: string, callback?: Function, target?: any): void {
        this._eventNode.off.apply(this._eventNode, arguments);
    }
    public emitEvent(type: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): void {
        this._eventNode.emit.apply(this._eventNode, arguments);
    }
    public hasAddEventListener(type: string): boolean {
        return this._eventNode.hasEventListener(type);
    }

    public targetOff(target:string|object){
        this._eventNode.targetOff(target);
    }

    public removeAll(target:string|object){
        this._eventNode.removeAll(target);
    }

}