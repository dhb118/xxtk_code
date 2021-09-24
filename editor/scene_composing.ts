import { _decorator, Component, Node, instantiate, Prefab } from 'cc';
import { Scene2Obj } from './scene2obj';
const { ccclass, property } = _decorator;

@ccclass('scene_composing')
export class scene_composing extends Component {

    @property(Prefab)
    map: Prefab = null;
    @property(Prefab)
    element: Prefab = null;
    @property(Scene2Obj)
    scene2obj: Scene2Obj = null;

    onFocusInEditor(): void {
        if (this.scene2obj) {
            this.toAllScene2OBJ();
        }
    }

    private toAllScene2OBJ(): void {
        let root: Node;
        let map: Node;
        let element: Node;
        root = new Node();
        map = instantiate(this.map);
        element = instantiate(this.element);
        root.addChild(map);
        root.addChild(element);
        this.scene2obj.fileName = `${map.name}_${element.name}`;
        this.scene2obj.Scene2OBJ(root);
    }

}
