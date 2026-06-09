/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: NetNode.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Wed May 27 2026 14:37:14 GMT+0800 (中国标准时间) 
 **********************************************/

import { log } from "cc";
import { CallbackObject, GS_SUCCESS, INetworkTips, ISocket, NetCallFunc, NetData, RequestObject } from "./NetInterface";
import { Socket } from "./Socket";
import { packMsg, unpackMsg } from "./data_pack";
import DataReader from "../data/DataReader";
import EventManager from "../manager/EventManager";
import { SHOWTIPS } from "../../GameConfig";

type VoidFunc = () => void;
type CheckFunc = (checkedFunc: VoidFunc) => void;
type BoolFunc = () => boolean;
type ExecuterFunc = (callback: CallbackObject, buffer: NetData | any) => void;

export enum NetTipsType {
    Connecting,
    ReConnecting,
    Requesting,
}


export enum NetNodeState {
    Closed,                     // 已关闭
    Connecting,                 // 连接中
    Checking,                   // 验证中
    Working,                    // 可传输数据
}

export interface NetConnectOptions {
    ip?: string,              // 地址
    port?: number,              // 端口
    protocol?: string,            // 协议：wws、ws...
    url?: string,               // url，与协议+地址+端口二选一
    binaryType?: string,     // binaryType
}

export interface GameConnectOptions {
    url: string, // 待链接服务器
    autoReconnect?: number,     // -1 永久重连，0不自动重连，其他正整数为自动重试次数
}


export class NetNode {
    protected _isSocketInit: boolean = false;                               // Socket是否初始化过
    protected _isSocketOpen: boolean = false;                               // Socket是否连接成功过

    protected _connectOptions: GameConnectOptions = null;
    protected _autoReconnect: number = 0;
    protected _socket: ISocket = null;                                      // Socket对象（可能是原生socket、websocket、wx.socket...)
    protected _connectedCallback: CheckFunc = null;                         // 连接完成回调

    protected _networkTips: INetworkTips = null;                            // 网络提示ui对象（请求提示、断线重连提示等）
    protected _preState: NetNodeState = NetNodeState.Closed;                // 节点前置状态保存
    protected _state: NetNodeState = NetNodeState.Closed;                   // 节点当前状态
    protected _netConnectedResultCallback: Function = null                      // 链接后的回调
    protected _disconnectCallback: BoolFunc = null;                         // 断线回调

    protected _gameConnectedResultCallback: Function = null                     // 游戏链接后的回调
    protected _ignoreAutoConnect: boolean = false                            // 主动关闭服务器时是否忽略重连
    protected _listener: { [key: number]: CallbackObject[] } = {}           // 监听者列表

    protected _netDelay: number = 0                                           // 网络传输时间


    protected _keepAliveTimer: any = null;                                  // 心跳定时器
    protected _receiveMsgTimer: any = null;                                 // 接收数据定时器
    protected _reconnectTimer: any = null;                                  // 重连定时器
    protected _disconnectTimer: any = null;                                 // 连接超时后断开定时器
    protected _heartTime: number = 10000;                                   // 心跳间隔
    protected _receiveTime: number = 15000;                                 // 多久没收到数据断开
    protected _disconnectTime: number = 10000;                              // URL链接断开间隔
    protected _heartBeatCmd: number = 0                                           // 心跳检测消息号
    protected _requests: RequestObject[] = Array<RequestObject>();          // 请求列表
    protected _callbackExecuter: ExecuterFunc = null;                       // 回调执行

    public init(socket: ISocket) {
        this._socket = socket;
        this._callbackExecuter = (callback: CallbackObject, buffer: NetData | any) => {
            callback.callback.call(callback.target, buffer);
        }

    }

    protected onClosed(event, forceClose: boolean = false) {
        log("NetNode onClosed!")

        // this.clearTimer();

        // 执行断线回调，返回false表示不进行重连
        if (this._disconnectCallback && !this._disconnectCallback()) {
            console.log(`disconnect return!`)
            return;
        }

        this._preState = this._state
        this._state = NetNodeState.Closed;

        if (this._netConnectedResultCallback) {
            this._netConnectedResultCallback(this._state, forceClose)
        }
    }

    /**
    * @desc 移除_socket：置空相关回调，关闭相关定时器
    */
    public deleteSocket() {
        this._netConnectedResultCallback = null
        this._socket.removeHandler()
        this.onClosed({})
        delete this._socket
    }


    tryConnect(url: string) {
        let isBlock = true
        // EventManager.emit(SHOWBLOCK)

        log("pingServer_______trying = ", url)

        this.connectUrl({
            url: url,
        }, (netNodeState: number, forceClose?: boolean) => {
            // isBlock && EventManager.emit(HIDEBLOCK)
            isBlock = false

            if (netNodeState == NetNodeState.Working) {
                log("pingServer_______succ = ", url)

                this._gameConnectedResultCallback && this._gameConnectedResultCallback(url, this._state)

            } else {
                log("pingServer_______fail = ", url)

                // 链接过程中，链接超时，客户端强制关闭 WebSocket 链接，移除 this._socket 
                if (netNodeState == NetNodeState.Closed && forceClose) {
                    log("Force : _socket is deleted! ")

                    // 重置当前 socket 注册方法后移除 socket
                    this._socket.removeHandler()
                    this._isSocketInit = false;
                    delete this._socket
                    this._socket = new Socket()
                }

                // 链接失败首先尝试重连，否则主动调用 _gameConnectedResultCallback
                if (!this._ignoreAutoConnect && this.isAutoReconnect()) {
                    this.updateNetTips(NetTipsType.ReConnecting, true);
                    this.tryReconnect()
                } else {
                    this._gameConnectedResultCallback && this._gameConnectedResultCallback(url, this._state)
                }

            }
        })
    }


    public connectUrl(options: NetConnectOptions, callback?: Function): boolean {
        if (this._socket && this._state == NetNodeState.Closed) {
            this._netConnectedResultCallback = callback
            if (!this._isSocketInit) {
                this.initSocket();
            }
            this._preState = this._state
            this._state = NetNodeState.Connecting;
            if (!this._socket.connect(options)) {
                this.updateNetTips(NetTipsType.Connecting, false);
                return false;
            }

            this.updateNetTips(NetTipsType.Connecting, true);

            this.resetDisconnectTimer()

            return true;
        }
        return false;
    }


    protected resetDisconnectTimer() {
        if (this._disconnectTimer !== null) {
            clearTimeout(this._disconnectTimer)
            this._disconnectTimer = null
        }

        this._disconnectTimer = setTimeout(() => {
            console.warn(" NetNode disconnectTimer close socket! ")
            // 主动关闭 WebSocket 链接时，直接强制移除 NetNode
            this.onClosed(null, true)
        }, this._disconnectTime);
    }

    // 发起请求，并进入缓存列表
    public request(buf: NetData, rspCmd: number, rspObject?: CallbackObject, showTips: boolean = true, force: boolean = false) {
        if (this._state == NetNodeState.Working || force) {
            // 请求数据，重置超时计时器
            this.startReceiveMsgTimer();
            let msg = packMsg(rspCmd, buf)
            this._socket.send(msg)
        }
        // 进入发送缓存列表
        this._requests.push({
            // buffer: params,
            rspCmd: rspCmd,
            rspObject: rspObject,
        });


        // let params = {
        //     msg: buf,
        //     seq: this.getCodeSeqCount()
        // }
        // if (this._state == NetNodeState.Working || force) {
        //     // 请求数据，重置超时计时器
        //     this.startReceiveMsgTimer();

        //     // let msg = packMsg(rspCmd, this.getMsgSeqCount(), buf)
        //     let seq = this.getMsgSeqCount();
        //     let msg = packMsg(rspCmd, seq, params)

        //     if (G_Config.showServerLog) {
        //         console.log(" ------------------------------- C2S ------------------------------- ", NetManager.getInstance().getProtocolIdByCode(rspCmd))
        //         let c2sData = { cmdId: rspCmd, msg: params.msg, remainData: msg.slice(msg.byteLength), seq: seq };
        //         let format = G_Config.showServerLogWithFormat && rspCmd != 901
        //         let info = format ? JSON.stringify(c2sData, null, 2) : JSON.stringify(c2sData)
        //         console.log(` msg : ${info}`)
        //         console.log("\n\n")
        //     }

        //     this._socket.send(msg);
        // }
        // // console.log(`NetNode request with timeout for ${rspCmd}`);
        // // 进入发送缓存列表
        // this._requests.push({
        //     buffer: params,
        //     rspCmd: rspCmd,
        //     rspObject: rspObject,
        // });
        // 启动网络请求层
        if (showTips) {
            this.updateNetTips(NetTipsType.Requesting, true);
        }
    }

    /**
     * 
     * @param url 待链接服务器列表url
     * @param callback 链接结束后回调
     * @param autoReconnect 重连次数
     * @param resetAutoReconnect 重置重连次数
     */
    public connect(url: string, callback: Function = (url: string, netNodeState: number) => { }, autoReconnect: number = 0, resetAutoReconnect: boolean = true) {
        this._gameConnectedResultCallback = callback

        // 初始调用一次赋值 or 需要重置重连次数时
        if (this._connectOptions == null || resetAutoReconnect) {
            this._autoReconnect = autoReconnect
        }

        this._connectOptions = {
            url: url,
            autoReconnect: autoReconnect
        };

        this.tryConnect(url)
    }

    protected initSocket() {
        this._socket.onConnected = (event) => { this.onConnected(event) };
        this._socket.onMessage = (msg) => { this.onMessage(msg) };
        this._socket.onError = (event) => { this.onError(event) };
        this._socket.onClosed = (event) => { this.onClosed(event) };
        this._isSocketInit = true;
    }

    // 网络连接成功
    protected onConnected(event) {
        console.log("NetNode onConnected!")
        this._isSocketOpen = true;
        // 如果设置了鉴权回调，在连接完成后进入鉴权阶段，等待鉴权结束
        if (this._connectedCallback !== null) {
            this._preState = this._state
            this._state = NetNodeState.Checking;
            this._connectedCallback(() => { this.onChecked() });
        } else {
            this.onChecked();
        }

        console.log("NetNode onConnected! state =" + this._state);

        if (this._netConnectedResultCallback) {
            this._netConnectedResultCallback(this._state)
        }
    }

    // 连接验证成功，进入工作状态
    protected onChecked() {
        console.log("NetNode onChecked!")
        this._preState = this._state
        this._state = NetNodeState.Working;
        // 关闭连接或重连中的状态显示
        this.updateNetTips(NetTipsType.Connecting, false);
        this.updateNetTips(NetTipsType.ReConnecting, false);

        this.clearTimer()
        if (this._connectOptions) {
            this._autoReconnect = this._connectOptions.autoReconnect || 0
        }

        // 网络消息号重置
        // this.resetMsgSeqCount()
    }

    // 接收到一个完整的消息包
    protected onMessage(msg): void {
        msg = unpackMsg(msg)


        // 连接成功后，取消3秒的关闭连接定时器
        this.clearDisconnectTimer()
        // 消息返回成功后，取消15秒的网络超时定时器
        this.clearReceiveMsgTimer()
        // 重置心跳包发送器 
        this.resetHearbeatTimer();

        let result = msg.result
        if (result != GS_SUCCESS) {
            this.showErrorCodeTip(result)
            return
        }
        let interrupt = false
        // 优先触发request队列
        let rspCmd = msg.msgId
        console.log('收到消息浩---' + rspCmd);

        if (this._requests.length > 0) {
            for (let reqIdx in this._requests) {
                let req = this._requests[reqIdx];
                if (req.rspCmd == rspCmd) {
                    // console.log(`NetNode execute request rspcmd ${rspCmd}`);
                    // interrupt = true


                    interrupt = true
                    this._requests.splice(parseInt(reqIdx), 1);
                    this._callbackExecuter(req.rspObject, msg);
                    break;
                }
            }
            // console.log(`NetNode still has ${this._requests.length} request watting`);
            if (this._requests.length == 0) {
                this.updateNetTips(NetTipsType.Requesting, false);
            }
        }

        //处理注册通知
        let listeners = this._listener[rspCmd];
        if (!interrupt && null != listeners) {
            for (const rsp of listeners) {
                console.log(`NetNode execute listener cmd ${rspCmd}`);
                this._callbackExecuter(rsp, msg);

            }
        }

        // EventManager.emit(EVT_NETNODE_RECEIVE_MESSAGE, { rspCmd: rspCmd })

    }

    private showErrorCodeTip(errorCode: number) {

        let errConfig = DataReader.requireRecordById("errorCode", errorCode.toString())
        // let tip = id ? Strings.get(id) : errorCode.toString()
        EventManager.emit(SHOWTIPS, { tip: errConfig.name, errorEffect: true })
    }

    protected onError(event) {
        console.error(JSON.stringify(event));
        log("NetNode onError!")
    }

    public tryReconnect() {
        if (this._autoReconnect > 0) {
            this._autoReconnect -= 1;
        }

        this.connect(this._connectOptions.url, this._gameConnectedResultCallback, this._connectOptions.autoReconnect, false)
    }

    protected updateNetTips(tipsType: NetTipsType, isShow: boolean) {
        if (this._networkTips) {
            if (tipsType == NetTipsType.Requesting) {
                this._networkTips.requestTips(isShow);
            } else if (tipsType == NetTipsType.Connecting) {
                this._networkTips.connectTips(isShow);
            } else if (tipsType == NetTipsType.ReConnecting) {
                this._networkTips.reconnectTips(isShow);
            }
        }
    }

    public isAutoReconnect() {
        return this._autoReconnect != 0;
    }


    public addResponeHandler(cmd: number, callback: NetCallFunc, target?: any): boolean {
        log(" addResponeHandler_cmd = ", cmd)
        if (callback == null) {
            console.error(`NetNode addResponeHandler error ${cmd}`);
            return false;
        }
        let rspObject = { callback: callback, target: target }
        if (null == this._listener[cmd]) {
            this._listener[cmd] = [rspObject];
        } else {
            let index = this.getNetListenersIndex(cmd, rspObject);
            if (-1 == index) {
                this._listener[cmd].push(rspObject);
            }
        }
        return true;
    }


    protected getNetListenersIndex(cmd: number, rspObject: CallbackObject): number {
        let index = -1;
        for (let i = 0; i < this._listener[cmd].length; i++) {
            let iterator = this._listener[cmd][i];
            if (iterator.callback == rspObject.callback
                && iterator.target == rspObject.target) {
                index = i;
                break;
            }
        }
        return index;
    }


    public removeResponeHandler(cmd: number, callback: NetCallFunc, target?: any) {
        if (null != this._listener[cmd] && callback != null) {
            let index = this.getNetListenersIndex(cmd, { target, callback });
            if (-1 != index) {
                this._listener[cmd].splice(index, 1);
            }
        }
    }


    protected clearTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
            this._receiveMsgTimer = null
        }
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer);
            this._keepAliveTimer = null
        }
        if (this._reconnectTimer !== null) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null
        }
        if (this._disconnectTimer !== null) {
            clearTimeout(this._disconnectTimer);
            this._disconnectTimer = null
        }
    }


    public getTimestamp() {
        return this.getTimeMillis() / 1000
    }

    public getTimeMillis() {
        let date = new Date()
        let serverTime = date.getTime();
        return serverTime
    }

    private updateNetDelay(clientTimestamp: number) {
        this._netDelay = (new Date()).getTime() - clientTimestamp
    }

    public getNetDelay() {
        return this._netDelay
    }


    /********************** 心跳、超时相关处理 *********************/
    protected startReceiveMsgTimer() {
        if (this._receiveMsgTimer !== null) {
            return
        }

        this._receiveMsgTimer = setTimeout(() => {
            console.warn("NetNode recvieMsgTimer close socket!");
            this._receiveMsgTimer = null
            this._socket.close();
        }, this._receiveTime);
    }


    protected clearDisconnectTimer() {
        if (this._disconnectTimer !== null) {
            clearTimeout(this._disconnectTimer);
            this._disconnectTimer = null
        }
    }


    protected clearReceiveMsgTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
            this._receiveMsgTimer = null
        }
    }


    protected resetHearbeatTimer() {
        if (this._keepAliveTimer) {
            return
        }
        /* if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer);
            this._keepAliveTimer = null
        } */

        this._keepAliveTimer = setInterval(() => {
            console.log("NetNode keepAliveTimer send Hearbeat")
            this.requestHeartBeat()
        }, this._heartTime);
    }


    /**
     * @desc 心跳检测 后端直接返回服务器时间
     */
    protected requestHeartBeat() {
        return;
        let callback = (data: any) => {
            // this.updateTimeOffset(data.server_timestamp)
            // this.updateTimeZoneOffset(data.timezone_offset)
            this.updateNetDelay(data.clientTimestamp)
        }

        let param = {
            clientTimestamp: (new Date()).getTime()
        }
        this.request(param, this._heartBeatCmd, { target: null, callback: callback })
    }
}


