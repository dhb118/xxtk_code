import { error, warn } from "cc";
import BaseModel from "../mvc/BaseModel";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-18 10:59:30
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-06-02 14:38:28
 */
export default class ModelManager{

    private static _instance: ModelManager;
	public static getInstance(): ModelManager {
		if (!this._instance) {
			this._instance = new ModelManager();
		}
		return this._instance;
	}

	/**model数据源存储 */
	private _modelCache: { [key: string]: BaseModel };

	public init(): void {
		this._modelCache = {};
	}

	/**
	 * 注册model对象源
	 * @param modelClass model类
	 */
	public register<T extends BaseModel>(modelClass: { new (): T }): T {
		const key: string = (modelClass as any).key;
		let model: BaseModel;
		if (key && !this._modelCache[key]) {
			model = new modelClass();
			this._modelCache[key] = model;
		} else {
			if (!key) {
				error("注册的该model类不存在static key属性！");
			} else {
				warn("注册的该model已存在，请使用统一数据源！");
			}
		}
		return model as T;
	}

	/**
	 * 注销model
	 * @param modelClass
	 */
	public unregister(modelClass: { new (): BaseModel }): void {
		if (!modelClass) return;
		const key: string = (modelClass as any).key;
		const model = this._modelCache[key]
		if (model) {
			model.destroy();
			delete this._modelCache[key];
		}
	}

	/**
	 * 获取model对象源
	 * @param modelClass model类
	 */
	public getModel<T extends BaseModel>(modelClass: { new (): T }): T {
		if (!modelClass) return;
		const key: string = (modelClass as any).key;
		if (this._modelCache && this._modelCache[key]) {
			return this._modelCache[key] as T;
		} else {
			// warn("获取model数据源对象不存在！");
		}
		return null;
	}

	/**
	 * 销毁清理model
	 * @param modelClass
	 */
	public destroy(modelClass: { new (): BaseModel }): void {
		if (!modelClass) return;
		const key: string = (modelClass as any).key;
		const model = this._modelCache[key]
		if (model) {
			model.destroy();
		}
	}

	/**
	 * 是否存在该model源
	 * @param modelClass model类
	 */
	public isExist(modelClass: { new (): BaseModel }): boolean {
		const key: string = (modelClass as any).key;
		if (this._modelCache && this._modelCache[key]) {
			return true;
		}
		return false;
	}
}
