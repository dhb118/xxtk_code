import { EventDecoratorConst, setEventDecorator } from "../../../melon_runtime/Attibute";
import { InterestEventDispatcher } from "../../../melon_runtime/MiniDispatcher";

export const socketEvent = new InterestEventDispatcher();


export function SOCKET_EVT(...evt: (string | number)[]) {
    return function (classPrototype: { constructor: any }, propertyKey: string, descriptor: PropertyDescriptor) {
        setEventDecorator(EventDecoratorConst.SOCKET_EVT, classPrototype, descriptor, ...evt);
    };
}