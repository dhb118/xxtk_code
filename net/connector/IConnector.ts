/* eslint-disable @typescript-eslint/no-explicit-any */
// 'use strict';
import { IPacker } from '../mershall/IPacker';
import { USocket } from '../USocket';

/**
 * Socket管道接口
 * 用来管理Socket
 *
 * @export
 * @interface IConnector
 */
export interface IfaceConnector {
    /**
     * socket 套接字
     *
     * @type {WebSocket}
     * @memberof IConnector
     */
    socket: USocket;

    /**
     * 打包解包器
     *
     * @type {IfacePacker}
     * @memberof IConnector
     */
    packer: IPacker;

    /**
     * 接收消息
     *
     * @param {MessageEvent} message 消息
     *
     * @memberof IConnector
     */
    onMessageReveived(message: ArrayBuffer): void;

    /**
     * 发送消息
     *
     * @param {number} msgType 消息类型
     * @param {*} msg 消息
     * @param {Function} [callback] 消息回调
     * @param {*} [callbackObk] 消息回调作用域
     * @memberof IConnector
     */
    send(msgType: number, msg: any, callback?: Function, callbackObk?: any): void;

    /**
     * 关闭套接字
     */
    close(): void;
}
