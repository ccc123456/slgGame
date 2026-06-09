/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: Model.ts
 description:数据模型基类
 author: cuicongcong
 date: Thu May 28 2026 09:37:38 GMT+0800 (中国标准时间) 
 **********************************************/

import { assert, sys } from "cc"
import ControllerManager from "../manager/ControllerManager"
import { NetManager } from "../netwoek/NetManager"
import { SingletonFactory } from "../utils/SingletonFactory"
import EventManager from "../manager/EventManager"
import { NetCallFunc } from "../netwoek/NetInterface"
import DataReader from "./DataReader"


export default class Model {
    static modelName: string = null
    protected netManager: NetManager
    controllerManager: ControllerManager = ControllerManager.getInstance()

    /**
     * 本地缓存的数据
     */
    private _dLocalData = {};

    constructor() {
        assert(this.constructor["modelName"], "未指定modelName")
        this.netManager = NetManager.getInstance()
        this.LoadStorage();
        this.registerListeners();
        this.initPush();

    }


    /**
     * 获得模型单利
     */
    static getInstance(): Model {
        return SingletonFactory.getInstance(this)
    }


    /**
     * 数据同步
     * @param data 
     */
    public synchronize(data) {

    }

    /**
     * 数据删除
     * @param data 
     */
    public synchronizeDel(data) {

    }


    /**
     * 注册监听事件
     */
    private registerListeners() {
        let tbMsg = this.getMessageListeners();
        for (const key in tbMsg) {
            if (tbMsg.hasOwnProperty(key)) {
                EventManager.on(key.toString(), function (...msg) {
                    tbMsg[key](...msg);
                })
            }
        }
    }

    /**
     * 子类需要重写此方法，返回需要注册的监听事件
     */
    getMessageListeners() {
        return {};
    };

    /**
     * 子类需要重写此方法，注册后端主动推送消息事件
     */
    public initPush() { }

    /**
     * 当数据发生变化时可以通知控制器进行视图刷新
     * @param evenStr 事件名字
     * @param arg 事件参数
     */
    dispatchEvent(evenStr: string, ...arg: any[]) {
        arg.unshift(evenStr)
        EventManager.emit.apply(EventManager, arg)
    }


    /**
     * 
     * @param sendData 发送的对象
     * @param rspCmd 协议号
     * @param callback 回调
     * @param target 回调this
     * @param isBlock 是否屏蔽
     * @param channelId 频道id
     */
    public request(arg: any, rspId: number, callback: NetCallFunc, target: any = null, isBlock: boolean = true, channelId: number = 0) {
        // isBlock && this.dispatchEvent(SHOWBLOCK)
        let callback_ = (data: any) => {
            // isBlock && this.dispatchEvent(HIDEBLOCK)
            callback.call(target, data)
        }
        this.netManager.request(arg, rspId, { target: target, callback: callback_ }, true, false, channelId)
    }

    /**
     * @desc 短线重连补发消息
     * @param channelId 
     */
    public resendCacheRequest(channelId: number = 0) {
        this.netManager.resendCacheRequest(channelId)
    }

    /**
     * 注册推送消息回调
     * @param cmd 协议号
     * @param callback 回调
     * @param channelId 频道id 默认0
     * @param target 回调this
     */
    public addResponeHandler(rspId: number, callback: NetCallFunc, channelId: number = 0, target?: any) {
        // const table = DataReader.getDataTable("SERVER_Protocol");
        // if (!table[rspId]) {
        //     //这加添加预检查一下配置,有时候不同分支,代码添加了推送协议,配置表没更新,会弹窗错误导致无法登录,这里就不让弹了,log里提示就行了
        //     console.error(`未找到表:${"SERVER_Protocol"}的ID:${rspId}`)
        //     return;
        // }
        this.netManager.addResponeHandler(rspId, callback, channelId, target);
    }

    /**
     * 移除推送消息回调
     * @param cmd 协议号
     * @param callback 回调
     * @param channelId 频道id 默认0
     * @param target 回调this
     */
    public removeResponeHandler(cmd: number, callback: NetCallFunc, channelId: number = 0, target?: any) {
        this.netManager.removeResponeHandler(cmd, callback, target);
    }

    /**
     * @desc 获取游戏时间
     * @param channelId 频道id 默认0
     */
    public getTimestamp(channelId: number = 0) {
        return this.netManager.getTimestamp(channelId)
    }

    /**
     * @desc 获取游戏时间 毫秒
     * @param channelId 频道id 默认0
     */
    public getTimeMillis(channelId: number = 0) {
        return this.netManager.getTimeMillis(channelId)
    }

    // /**
    //  * @desc 获取游戏时间 毫秒 未转化
    //  * @param channelId 频道id 默认0
    //  */
    // public getNoChangeTimeMillis(channelId: number = 0) {
    //     return this.netManager.getNoChangeTimeMillis(channelId)
    // }

    /**
     * @desc 获取网络延迟
     * @param channelId 频道id 默认0
     */
    public getNetDelay(channelId: number = 0) {
        return this.netManager.getNetDelay(channelId)
    }

    protected LoadStorage() {
        let data = JSON.parse(sys.localStorage.getItem(`model_${this.constructor["modelName"]}`));
        if (!data || data === "") {
            this._dLocalData = {}
        } else {
            this._dLocalData = data;
        }
    }

    /**
     * protected 只让实现类操作数据  也就是model类型操作数据 对外提供别的方法
     * @param sKey 
     * @param defaultValue 
     */
    protected Query(sKey: string, defaultValue: any = null) {
        if (this._dLocalData[sKey] != undefined) {
            return this._dLocalData[sKey];
        }
        return defaultValue;
    }

    /**
     * 设置成功返回 true，反之返回 false 用于是否保存数据
     * @param sKey 
     * @param value
     */
    protected Set(sKey: string, value: string | number) {
        if (this._dLocalData[sKey] && this._dLocalData[sKey] == value) {
            return false;//一样就不要改了
        }
        this._dLocalData[sKey] = value;
        // todo 临时添加在此处 每次设置数据是直接保存
        this.Save()
        return true;
    }

    /**
     * 保存缓存中的数据
     */
    protected Save() {
        sys.localStorage.setItem(`model_${this.constructor["modelName"]}`, JSON.stringify(this._dLocalData));
    }

    /**
     * 清理数据
     */
    clear() {

    }

    /**
     * 通过名字获取对应的controller
     * @param name view或者controller的名字
     */
    public getControByName(name: string) {
        return this.controllerManager.getControByName(name)
    }

    /**
     * 推出一个新视图
     * @param arg 
     */
    pushController(...arg: any[]) {
        this.controllerManager.pushViewByController.apply(this.controllerManager, arg)
    }

    /**
     * 推出一个已显示过的视图，且关闭其顶部的所有视图
     * @param arg 
     */
    popToTargetController(...arg: any[]) {
        this.controllerManager.popToTargetViewByController.apply(this.controllerManager, arg)
    }

    closeViewByName(name: string) {
        this.controllerManager.closeViewByName(name)
    }
}


