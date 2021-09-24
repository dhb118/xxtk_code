import { Component, Node, Vec3, _decorator } from 'cc';
import { DEBUG } from 'cc/env';
const { ccclass, property } = _decorator;

@ccclass('Scene2xlsx')
export class Scene2xlsx extends Component {

    @property
	public saveXlsx: boolean = false;

    onFocusInEditor(): void {
        if (DEBUG) {
            if (this.saveXlsx) {
                const data = this.getXlsxData();
                //@ts-ignore
                Editor.Message.send('data2xlsx', 'data2xlsx', data);
            }
        }
    }

    private getXlsxData(): Array<Array<string>> | null {
        if (DEBUG) {
            const xData = [];
            // 表头
            xData.push(['id', 'monsterTypeInMap', 'monstersPos']);
            xData.push(['string', 'string[]', 'int[][]']);
            xData.push(['元素id', '怪物类型', '怪物初始点']);
            // content
            let monsterLayer: Node;
            const element = this.node;
            element.children.forEach((child: Node) => {
                const content = [];
                let types = '';
                let pos = '';
                let position: Vec3;
                monsterLayer = child.getChildByName('monsterLayer');
                monsterLayer.children.forEach((mChild: Node) => {
                    position = mChild.position;
                    if (!types) {
                        types += `${mChild.name}`;
                        pos += `${position.x},${position.y},${position.z}`;
                    }
                    else {
                        types += `|${mChild.name}`;
                        pos += `|${position.x},${position.y},${position.z}`;
                    }
                });
                content.push(child.name);
                content.push(types);
                content.push(pos);
                xData.push(content);
            });
            return xData;
        }
        return null;
    }

}
