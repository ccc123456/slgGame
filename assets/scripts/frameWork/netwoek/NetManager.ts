import { CallbackObject, NetCallFunc, NetData } from "./NetInterface";
import { NetNode } from "./NetNode";
import { Socket } from "./Socket";

export class NetManager {
    private static _instance: NetManager = null;
    protected _channels: { [key: number]: NetNode } = {};

    public static getInstance(): NetManager {
        if (!NetManager._instance) {
            NetManager._instance = new NetManager();
        }
        return NetManager._instance;
    }

    constructor(netNode?: NetNode) {
        if (!netNode) {
            this.createNode()
        }
    }

    public createNode(channelId: number = 0) {
        if (this._channels[channelId]) {
            return;
        }
        const netNode = new NetNode();
        netNode.init(new Socket());
        this.setNetNode(netNode, channelId);
    }

    // 获取指定 channelId 的 Node
    public getNetNode(channelId: number = 0) {
        return this._channels[channelId]
    }

    // 添加Node，返回ChannelID
    public setNetNode(newNode: NetNode, channelId: number = 0) {
        this._channels[channelId] = newNode;
    }

    // 移除Node，同时移除 socket 注册事件，避免异常出现
    public removeNetNode(channelId: number) {
        this._channels[channelId].deleteSocket()
        delete this._channels[channelId];
    }

    // 获取Node
    public hasNetNode(channelId: number) {
        return !!this._channels[channelId];
    }


    // 调用Node连接
    public connect(url: string, callback: Function, autoReconnect: number = 0, channelId: number = 0) {
        if (this._channels[channelId]) {
            return this._channels[channelId].connect(url, callback, autoReconnect);
        }
        return false;
    }


    // 发起请求，并在在结果返回时调用指定好的回调函数
    public request(buf: NetData, rspId: number, rspObject?: CallbackObject, showTips: boolean = true, force: boolean = false, channelId: number = 0) {
        let node = this._channels[channelId];
        if (node) {
            node.request(buf, rspId, rspObject, showTips, force);
        }
        // let rspCmd = this.getProtocolCode(rspId)
        // if (node) {
        //     cc.log('-----c2s--rspId--rspCmd-', rspId, rspCmd)
        //     node.request(buf, rspCmd, rspObject, showTips, force);
        // }
    }


    // 短线重连补发消息
    public resendCacheRequest(channelId: number = 0) {
        if (this._channels[channelId]) {
            // return this._channels[channelId].resendCacheRequest()
        }
    }


    /**
     * 注册推送消息回调
     * @param cmd 协议号
     * @param callback 回调
     * @param channelId 频道id 默认0
     * @param target 回调this
     */
    public addResponeHandler(rspId: number, callback: NetCallFunc, channelId: number = 0, target?: any) {
        let node = this._channels[channelId];
        // let rspCmd = this.getProtocolCode(rspId)
        if (node) {
            return node.addResponeHandler(rspId, callback, target);
        }
    }


    /**
     * 移除推送消息回调
     * @param cmd 协议号
     * @param callback 回调
     * @param channelId 频道id 默认0
     * @param target 回调this
     */
    public removeResponeHandler(cmd: number, callback: NetCallFunc, channelId: number = 0, target?: any) {
        let node = this._channels[channelId];
        if (node) {
            return node.removeResponeHandler(cmd, callback, target);
        }
    }

    /**
   * @desc 获取游戏时间戳
   * @param channelId 频道id 默认0
   */
    public getTimestamp(channelId: number = 0) {
        let node = this._channels[channelId];
        if (node) {
            return node.getTimestamp()
        }
        return 0
    }

    /**
     * @desc 获取游戏时间 毫秒
     * @param channelId 频道id 默认0
     */
    public getTimeMillis(channelId: number = 0) {
        let node = this._channels[channelId];
        if (node) {
            return node.getTimeMillis()
        }
        return 0
    }


    /**
     * @desc 获取网络延迟
     * @param channelId 频道id 默认0
     */
    public getNetDelay(channelId: number = 0) {
        let node = this._channels[channelId];
        if (node) {
            return node.getNetDelay()
        }
        return 0
    }

}


