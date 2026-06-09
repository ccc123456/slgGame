/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: NetInterface.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Wed May 27 2026 14:47:17 GMT+0800 (中国标准时间) 
 **********************************************/


export type NetData = (string | ArrayBufferLike | Blob | ArrayBufferView | ArrayBuffer | any);
export type NetCallFunc = (data: any) => void;


export const GS_SUCCESS = 0 // 请求正确受理状态码
// 回调对象
export interface CallbackObject {
    target: any,                // 回调对象，不为null时调用target.callback(xxx)
    callback: NetCallFunc,      // 回调函数
}
// Socket接口
export interface ISocket {
    onConnected: (event) => void;           // 连接回调
    onMessage: (msg: ArrayBuffer) => void;      // 消息回调
    onError: (event) => void;               // 错误回调
    onClosed: (event) => void;              // 关闭回调

    connect(options: any);                  // 连接接口
    send(buffer: ArrayBuffer);                  // 数据发送接口
    close(code?: number, reason?: string);  // 关闭接口
    removeHandler();                        // 移除注册事件
}

// 网络提示接口
export interface INetworkTips {
    connectTips(isShow: boolean): void;
    reconnectTips(isShow: boolean): void;
    requestTips(isShow: boolean): void;
}


// 请求对象
export interface RequestObject {
    // buffer: NetData,            // 请求的Buffer
    rspCmd: number,             // 等待响应指令
    rspObject: CallbackObject,  // 等待响应的回调对象
}
