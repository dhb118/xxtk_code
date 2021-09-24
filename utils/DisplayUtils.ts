import * as fgui from "fairygui-cc";
import Singleton from "../base/Singleton";

/*
 * @Author: yanmingjie.jack@shandagames.com
 * @Date: 2020-08-27 14:21:34
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-05-12 19:48:05
 */
export default class DisplayUtils extends Singleton {
	/**
	 * 绑定fgui子控件到对象私有变量中
	 * @param contentPane
	 * @param view
	 */
	public bindComponentToObj(contentPane: fgui.GComponent, view: object): void {
		let i: number;
		let childName: string;
		const childNum: number = contentPane.numChildren;
		let childCom: fgui.GObject;
		for (i = 0; i < childNum; i++) {
			childCom = contentPane.getChildAt(i);
			childName = childCom.name;
			if (!view[`_${childName}`]) {
				view[`_${childName}`] = childCom;
			}
		}
	}

	/**
	 * 绑定fgui控制器到对象私有变量中
	 * @param contentPane
	 * @param view
	 */
	public bindControllerToObj(contentPane: fgui.GComponent, view: object): void {
		let i: number;
		let childName: string;
		let ctrl: fgui.Controller;
		const childNum: number = contentPane._controllers.length;
		for (i = 0; i < childNum; i++) {
			ctrl = contentPane._controllers[i];
			childName = ctrl.name;
			if (view[`_${childName}`] !== void 0) {
				view[`_${childName}`] = ctrl;
			}
		}
	}

	/**
	 * 绑定fgui动效到对象私有变量中
	 * @param contentPane
	 * @param view
	 */
	public bindTransitionToObj(contentPane: fgui.GComponent, view: object): void {
		let i: number;
		let childName: string;
		let tst: fgui.Transition;
		const childNum: number = contentPane._transitions.length;
		for (i = 0; i < childNum; i++) {
			tst = contentPane._transitions[i];
			childName = tst.name;
			if (view[`_${childName}`] !== void 0) {
				view[`_${childName}`] = tst;
			}
		}
	}

	/**
	 * 添加红点提示
	 * @param com
	 * @param x
	 * @param y
	 */
	public addRedPoint(com: fgui.GComponent, x: number = null, y: number = null): void {
		let red: fgui.GObject = com.getChild('$gRedPoint');
        if (!red) {
           	red = fgui.UIPackage.createObject('common', 'redPoint');
            red.name = '$gRedPoint';
            com.addChild(red);
            // 设置位置
            let _x: number = com.width - red.width;
            let _y: number = 0;
            if (x !== null) {
                _x = x;
            }
            if (y !== null) {
                _y = y;
            }
            red.setPosition(_x, _y);
        }
	}

	/**
	 * 移除红点提示
	 * @param com
	 */
	public delRedPoint(com: fgui.GComponent): void {
		const red: fgui.GObject = com.getChild('$gRedPoint');
		if (red) {
			red.removeFromParent();
			red.dispose();
		}
	}

}

export var displayUtils = DisplayUtils.getInstance<DisplayUtils>();