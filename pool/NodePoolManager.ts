import { instantiate, Node, NodePool, Prefab } from 'cc';
import Singleton from '../base/Singleton';

export class NodePoolManager extends Singleton {

    private _pools: Map<Prefab, NodePool> = new Map<Prefab, NodePool>();

    initNodes(prefab: Prefab,max:number){
        const c = this.getNodeCount(prefab);
        if(c < max){
            const preloadNodes = [];
            for (let index = 0; index < (max-c); index++) {
                const node = this.newNode(prefab);
                preloadNodes.push(node);
            }
            preloadNodes.forEach(n=> this.freeNode(n));
        }
    }

    getNodeCount(prefab: Prefab){
        const pool: NodePool = this._pools.get(prefab);
        if(!pool){
            return 0;
        }
        return pool.size();
    }

    newNode(prefab: Prefab, poolHandlerComp?: string) {
        let pool: NodePool = this._pools.get(prefab);
        if (!pool) {
            pool = new NodePool(poolHandlerComp);
            this._pools.set(prefab, pool);
        }

        let node: Node = null;
        if (pool.size() > 0) {
            node = pool.get();
        } else {
            node = instantiate(prefab);
            node.attr({ poolKey: prefab })
        }

        return node;
    }

    freeNode(node: Node) {
        if (!node) return;

        const key = Object.getOwnPropertyDescriptor(node, "poolKey");
        if (!key) {
            node.removeFromParent();
            return false;
        }
        const prefab = key.value;
        if (!this._pools.has(prefab)) {
            node.removeFromParent();
            return false;
        }

        this._pools.get(prefab).put(node);
    }

    destroyPool(prefab: Prefab) {
        if (!this._pools.has(prefab)) {
            return false;
        }
        this._pools.get(prefab).clear();
        this._pools.delete(prefab);
    }

    destroyAll() {
        this._pools.forEach((value, key) => {
            value.clear();
        });
        this._pools.clear();
    }
}
