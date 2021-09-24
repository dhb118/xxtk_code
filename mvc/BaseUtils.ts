import { error, js } from "cc";
import BaseView from "./BaseView";

export const classViews: { [key: string]: { new (): BaseView } } = js.createMap();

export function ViewClassRegister(constructor: { new (): BaseView }): any {
	const key: string = (constructor as any).key;
	if (!key) {
		error(`${constructor.name} 未定义public static readonly key变量，请在检查一下遗漏！`);
	}
	classViews[key] = constructor;
	return constructor;
}
