import { client_data, EventDecoratorConst, forarr, foreach, gameConfig } from "../../melon_runtime/Attibute";
import { singleton } from "../../melon_runtime/ClassUtils";
import { codeDoProperty, codeIntParser } from "../../melon_runtime/CodeExec";
import { array_dosort, clone } from "../../melon_runtime/Extend";
import { facade } from "../../melon_runtime/MVC";
import EventManager from "../manager/EventManager";
import ModelManager from "../manager/ModelManager";
import SocketManager from "../manager/SocketManager";
import { socketEvent } from "../net/connector/SocketEvent";


var defineCache = {} as { [key: string]: { [key: string]: IResId; }; };
export var tempObject = {};
/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-14 15:33:01
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-06-02 14:37:03
 */
export default abstract class BaseModel {
    runtimes?: { [key: string]: any; };
    /**定义model唯一属性，子类必须定义该属性 */
    public static readonly key: string;
    key: string
    public destroy(): void { }
    public getSocket(): SocketManager {
        return SocketManager.getInstance();
    }
    protected getModel<T extends BaseModel>(modelClass: new () => T): T {
        const modelMgr = ModelManager.getInstance();
        return modelMgr.getModel(modelClass);
    }
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


    constructor() {
        facade.registerEventDecorator(EventDecoratorConst.EVT, this);
        socketEvent.registerEventDecorator(EventDecoratorConst.SOCKET_EVT, this);
    }

    initConfig() {

    }

    /**
     * 生命周期 create
     * 初始化数据
     */
    initData() {

    }

    loadSaveData(runtimes: { [key: string]: any; }) {
        copyProperty(runtimes, this.runtimes);
    }

    filterRuntime(context: any, limit: IConfigLimit, params?: IConditionRuntime) {
        let result = context[this.key];
        let v = limit.target[0];
        let o = result[v.id];
        if (o && typeof o == "object") {
            result = o[v.value];
            if (!result) {
                let key = `${v.id}2runtime`;
                let f = this[key] as Function;
                if (f != undefined) {
                    result = f.call(this, context, limit, params);
                }

            }
        }
        return result;
    }

    condition2string(condition: IConditionRuntime) {
        let { moduleName, opera, value } = condition;
        return `${moduleName} ${opera} ${value}`;
    }

    checkConditions(runtime: any, conditions: IConditionRuntime[], times = 1) {
        let error: any = undefined;
        forarr(conditions, v => {
            let { opera, id, value } = v;
            value = codeDoProperty(runtime, value, client_data);

            if (typeof value == "number") {
                value *= times;
            } else {
                value["mul"](times);
            }

            let d = runtime[id] || 0;
            if (codeIntParser(d, opera, value) == false) {
                error = v;
                return false;
            }
            return true;
        });
        return error;
    }

    checkLimit(context: any, runtime: any, limit: IConfigLimit, times = 1, params: IConditionRuntime) {
        let flag = false;
        if (limit.target) {
            runtime = this.filterRuntime(context, limit, params);
            flag = runtime == context;
        }


        let error = tempObject;

        if (runtime) {
            error = this.checkConditions(runtime, limit.value, times);
            if (!error && flag) {
                error = this.checkConditions(runtime, limit.target, times);
            }
            if (error) {
                error["runtime"] = runtime;
                error["moduleName"] = limit.module;
            }
        }

        return error;
    }


    onLimit(limit: IConfigLimit, handler: EventHandler, thisobj: object) {

        forarr(limit.value, v => {
            let key = this.getListenerKey(limit, v);
            facade.on(key, handler, thisobj);
            return true;
        });

        if (limit.count) {
            let key = this.getListenerCountKey(limit, limit.count);
            facade.on(key, handler, thisobj);
        }

        forarr(limit.counts, v => {
            let key = this.getListenerCountKey(limit, v);
            facade.on(key, handler, thisobj);
            return true;
        }, this);

        if (!limit.value && !limit.count && !limit.counts) {
            forarr(limit.target, v => {
                let key = `${this.key}.${v.id}`;
                facade.on(key, handler, thisobj);
                return true;
            }, this);
        }
    }

    offLimit(limit: IConfigLimit, handler: EventHandler, thisobj: object) {

        forarr(limit.value, v => {
            let key = this.getListenerKey(limit, v);
            facade.off(key, handler, thisobj);
            return true;
        });

        if (limit.count) {
            let key = this.getListenerCountKey(limit, limit.count);
            facade.off(key, handler, thisobj);
        }

        forarr(limit.counts, v => {
            let key = this.getListenerCountKey(limit, v);
            facade.off(key, handler, thisobj);
            return true;
        }, this);

        if (!limit.value && !limit.count && !limit.counts) {
            forarr(limit.target, v => {
                let key = `${this.key}.${v.id}`;
                facade.off(key, handler, thisobj);
                return true;
            }, this);
        }
    }

    getListenerKey(limit: IConfigLimit, value: IConditionRuntime) {
        let { key } = this;
        let pro = "";
        if (limit.target) {
            let { id, value } = limit.target[0];
            pro = `${id}.${value}.`;
        }
        return `${key}.${pro}${value.id}`;
    }

    getListenerCountKey(limit: IConfigLimit, value: IConditionRuntime) {
        let { key } = this;
        let pro = "";
        if (limit.target) {
            let { id, value } = limit.target[0];
            pro = `${id}.${value}.`;
        }
        return `${key}.${pro}${value.id}`;
    }


    getRuntimeDataName(data: { model: { name: string; }; }) {
        return data ? data.model ? data.model.name : "" : "";
    }

    createRuntimeData(v: IConditionRuntime, key: string, pro: string | number, data: any) {
        let runtime = clone(v, {});
        runtime.moduleName = key;
        runtime.runtime = data;
        let item = getProDefine(key, pro);
        if (item) {
            runtime.icon = item["icon"];
            runtime.bigicon = item["bigicon"];
            runtime.name = item["name"];
            runtime.show = item["show"];
        } else {
            runtime.name = this.getRuntimeDataName(data);
        }
        runtime.maxCount = Math.abs(data[pro]);
        runtime.count = Math.abs(v.value);

        return runtime;
    }

    reward2ConditionRuntime(reward: (string | number)[]) {
        const [module, id, value, target, key] = reward;
        let data = client_data[module];
        if (target) {
            data = data[target][key];
        }
        let v = this.createRuntimeData({ id, value, opera: "+=" } as IConditionRuntime, module as string, id, data);
        return v;
    }


    getLimitValue(context: IClientData, modelData: any, limit: IConfigLimit) {
        if (limit.limitValues) {
            forarr(limit.limitValues, v => {
                let { id, runtime } = v;
                v.maxCount = runtime[id];
                return true;
            });
            return limit.limitValues;
        }

        let data = modelData;
        if (limit.target) {
            data = this.filterRuntime(context, limit, modelData);
        }

        let limitValues: any[] = [];

        let { key } = this;

        forarr(limit.value, v => {
            // if (v.opera == ":" || v.opera.indexOf("=") != -1) {
            let runtime = this.createRuntimeData(v, key, v.id, data);
            limitValues.push(runtime);
            // }
            return true;
        });

        limit.limitValues = limitValues;

        return limitValues;
    }

    getLimitReward(context: IClientData, runtime: any, limit: IConfigLimit) {
        if (limit.rewards && limit.rewards.length) {
            return limit.rewards;
        }


        let data = runtime;
        if (limit.target) {
            data = this.filterRuntime(context, limit, runtime);
        }


        let rewards: any[] = [];

        let { key } = this;

        forarr(limit.value, v => {
            switch (v.opera) {
                case ":":
                case "*=":
                case "+=":
                    if (v.id != "adTimes") {
                        let runtime = this.createRuntimeData(v, key, v.id, data);
                        runtime.opera = v.opera;
                        rewards.push(runtime);
                    }
            }
            return true;
        });


        limit.rewards = rewards;


        return rewards;
    }
}

export var client_data_modules = {};
export var models = {};
export function RegisterModel(type: string, clinet_data = false) {
    return (target: { new(): BaseModel }) => {
        let model = singleton(target);
        target["key"] = type;
        model.key = type;
        models[type] = model;
        if (clinet_data) {
            client_data_modules[type] = model;
        }
    }
}

export function getProDefine(module: string, property: string | number) {
    let defines = getProDefines(module);
    return defines[property];
}

export function getProDefines(module: string) {
    let defines = defineCache[module];
    if (!defines) {
        defineCache[module] = defines = {};
        let res = gameConfig["res"][module];
        if (res) {
            forarr(res.ids, (v: { id: string }, k) => {
                defines[v.id] = v as any;
                return true;
            });
        }
    }
    return defines;
}

export function copyProperty<T>(from: any, to?: T, log?: { [key: string]: any }, p = "", root = undefined, target?: any, pro?: string | number) {
    if (!root) root = p
    if (!target) target = from;
    if (from instanceof Array) {
        if (!to) {
            log = undefined;
        }
        to = to || [] as any;
        for (let i = 0; i < from.length; i++) {
            to![i] = copyProperty(from[i], to![i], log, p + i + ".", root, to, i);
        }
    } else {
        switch (typeof from) {
            // case "number":
            // case "string":
            // case "boolean":
            //     to = from as any;
            //     break;
            case "object": {
                if (!to && log) {
                    log[p.slice(0, p.length - 1)] = { base: undefined, edit: from, target, pro };
                    log = undefined;
                }
                to = to || {} as any;
                foreach(from, (v, k) => {
                    to![k] = copyProperty(v, to![k], log, p + k + ".", root, to, k);
                    return true;
                });
                break;
            }
            default:
                if (log && p != root) {
                    log[p.slice(0, p.length - 1)] = { base: to, edit: from, target, pro };
                }
                to = from as any;

        }
    }

    return to;
}

export function getConditionValue(context: any, condition: IConditionRuntime[], property?, runtime?) {
    for (let j = 0; j < condition.length; j++) {
        const v = condition[j];
        if (v.opera == ":") {
            if (!property || v.id == property) {

                return Math.abs(codeDoProperty(context, v.value, runtime));
            }
        }
    }
    return 0;
}

export function getLimitValue(context: any, limits: IConfigLimit[], property: string, module = "res", params?: IConditionRuntime) {
    for (let i = 0, len = limits.length; i < len; i++) {
        const limit = limits[i];
        if (!module || limit.module == module) {
            let model = models[limit.module];
            if (!model) return 0;
            return getConditionValue(model, limit.value, property, model.filterRuntime(context, limit, params));
        }
    }

    return 0;
}

export function getLimitValues(context: IClientData, limits: IConfigLimit[]) {

    if (!limits) {
        return;
    }

    let result = [] as IConditionRuntime[];
    for (let i = 0, len = limits.length; i < len; i++) {
        const limit = limits[i];
        let model = models[limit.module] as BaseModel;
        if (model) {
            let temp = model.getLimitValue(context, context[limit.module], limit);
            if (temp && temp.length) {
                result = result.concat(temp);
            }
        }
    }
    return result;
}

export function getLimitReward(context: IClientData, limits: IConfigLimit[]) {
    let result = [] as IConditionRuntime[];
    if (limits) {
        for (let i = 0, len = limits.length; i < len; i++) {
            const limit = limits[i];
            if (limit) {
                let model = models[limit.module] as BaseModel;
                if (model) {
                    let temp = model.getLimitReward(context, context[limit.module], limit);
                    if (temp && temp.length) {
                        result = result.concat(temp);
                    }
                }
            }
        }
    }
    return result;
}


export function onLimit(limits: IConfigLimit[], handler: EventHandler, thisobj: object) {
    forarr(limits, limit => {
        let model = models[limit.module];
        if (model) {
            model.onLimit(limit, handler, thisobj);
        }
        return true;
    });
}

export function offLimit(limits: IConfigLimit[], handler: EventHandler, thisobj: object) {
    forarr(limits, limit => {
        let model = models[limit.module];
        if (model) {
            model.offLimit(limit, handler, thisobj);
        }
        return true;
    });
}

export function checkLimit(context: any, limits: IConfigLimit[], times = 1, params?: IConditionRuntime) {
    if (limits) {
        for (let i = 0, len = limits.length; i < len; i++) {
            const limit = limits[i];
            let model = models[limit.module];
            if (model) {
                let cr = model.checkLimit(context, context[limit.module], limit, times, params!);
                if (cr != undefined) {
                    return cr;
                }
            }
        }
    }
    return undefined;
}

export function modelInitConfigData() {
    let modelList = getModels();
    forarr(modelList, v => {
        v.initConfig();
        return true;
    });
}

export function getModels() {
    let modelList = [] as BaseModel[];

    for (const key in models) {
        let model = models[key];
        modelList.push(model);
    }

    array_dosort(modelList, "priority", true);

    return modelList;
}

export function modelInitRuntimeData() {
    let modelList = getModels();
    forarr(modelList, v => {
        v.initData();
        return true;
    });
}

export function modelInitRemoteData(data: IClientData) {
    const modelList = getModels();
    forarr(modelList, v => {
        v.initData();
        v.loadSaveData(data[v.key]);
        return true;
    });
}

export function condition2string(conditon: IConditionRuntime) {
    let model = models[conditon.moduleName] as BaseModel;
    if (model) {
        return model.condition2string(conditon);
    }
    return ""
}

export function reward2ConditionRuntime(rewards: (string | number)[][]) {
    let result = [];
    forarr(rewards, reward => {
        let [module, id, value, target, key] = reward;
        let model = models[module] as BaseModel;
        if (model) {
            let v = model.reward2ConditionRuntime(reward);
            if (v) {
                result.push(v);
            }
        }
    })
    return result;
}