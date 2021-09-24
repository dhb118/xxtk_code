import { forarr } from "../melon_runtime/Attibute";
import { recyclable } from "../melon_runtime/ClassUtils";
import { EventT } from "../melon_runtime/Event";
import { MiniDispatcher } from "../melon_runtime/MiniDispatcher";
import { checkLimit, offLimit, onLimit } from "./mvc/BaseModel";

export class ClientCondition extends MiniDispatcher {

    static conditions: Map<string | number, ClientCondition[]> = new Map();



    static request(root: IClientData, limits: IConfigLimit[], id: string | number, handler: (value: any) => void) {
        let task = recyclable(ClientCondition);

        let { conditions } = this;

        let cs = conditions.get(id);
        if (!cs) {
            cs = [task];
            conditions.set(id, cs);
        } else {
            cs.push(task);
        }

        task.request(root, limits).then(value => {
            cs!.remove(task);
            task.recycle();
            handler(value);
        });
    }

    static removeRequest(id: string | number) {
        let { conditions } = this;
        let cs = conditions.get(id);
        forarr(cs!, c => {
            c.close();
            return true;
        }, this);
        conditions.delete(id);

    }

    // @RecyclePro(undefined)
    // root: IClientData;

    // @RecyclePro(undefined)
    // limits: IConfigLimit[];
    active = 1;

    // @RecyclePro(undefined)
    // id = undefined;


    request(root: IClientData, limits: IConfigLimit[]) {

        let that = this;

        return new Promise<any>(resolve => {

            function handler(e: any) {
                if (!that.active || checkLimit(root, limits) == undefined) {
                    offLimit(limits, handler, that);
                    that.off(EventT.ERROR, handler, that);
                    resolve(that.active);
                }
            }

            if (checkLimit(root, limits) == undefined) {
                resolve(that.active);
            } else {
                onLimit(limits, handler, that);
            }

            that.once(EventT.ERROR, handler, that);

        });
    }

    close() {
        this.active = 0;
        this.simpleDispatch(EventT.ERROR);
    }

}