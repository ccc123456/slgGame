/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: ViewController.ts
 description:视图控制器基类，所有的视图控制器都需要继承这个类
 author: cuicongcong
 date: Wed May 27 2026 15:34:26 GMT+0800 (中国标准时间) 
 **********************************************/

import { Asset, AssetManager, BlockInputEvents, Component, Node, resources, SpriteFrame, sys, UITransform } from "cc";
import EventManager from "../manager/EventManager";
import UIView from "../ui/UIView";
import ControllerManager from "../manager/ControllerManager";
import MemoryManager from "../manager/MemoryManager";
import UIAtlasManager from "../manager/UIAtlasManager";
import { getNodeUITransform, loadResByPromise } from "../utils/CommonUtils";

export enum viewMode {
    SCENE,//全屏窗口
    PANEL,//二级面板
    ALERT//弹窗
}

export default class ViewController {
    static className: string = null
    public musicConfigId: string = null  //背景音乐对应的 BaseConfig Id
    viewClass: (typeof UIView) = null
    args: any
    rootView: Node = null
    private _viewComponent: Component = null
    parentController: ViewController = null
    subControllers: ViewController[] = []
    viewMode = viewMode.SCENE
    controllerManager: ControllerManager = ControllerManager.getInstance()
    dependResMap: { [key: string]: string[] | string } = {} //动态依赖资源类型->路径
    dependAssetMap: { [key: string]: [Asset, number] } = {} //依赖资源缓存
    loadingCountMap: { [key: string]: number } = {} //加载中资源计数
    preloadAudioArray: string[] = [] //预加载音效packageName
    preloadAudioRecordMap: { [key: string]: boolean } = {} //预加载音效资源记录
    constructor(parameters: { noBlock?: boolean }) {
        this.args = parameters || {}
        this.rootView = new Node()
        let rootTransform = getNodeUITransform(this.rootView)
        rootTransform.setContentSize(4000, 4000)
        if (!parameters || !parameters.noBlock) {
            this.rootView.addComponent(BlockInputEvents)
        }
        this.registerListeners()
        this.initDependRes()
        this.initPreloadAudioRes()
        EventManager.on("removeUnusedRes", () => {
            this.removeUnusedRes()
        }, this)
    }

    /**
     * 可以在这里填充一些依赖资源配置,key值为资源类型去掉cc,比如Prefab
     */
    initDependRes() {
        // this.dependResMap.Prefab = [
        //     //这里加入需要动态加载的动态资源，如果就一个也可以不用数组
        // ]
        // this.dependResMap.SpriteFrame = [

        // ]

    }

    /**
     * 可以在这里填充一些音效配置
     */
    initPreloadAudioRes() {
        // this.preloadAudioArray = [
        //     //这里加入预加载的音效packageName
        // ]
    }

    /**
     * 当界面第一次加载完成以及遇到内存警告界面被销毁后当再次需要显示进行重建后都会调用这个方法，这个主意依靠数据进行界面状态还原
     */
    viewDidLoad() {

    }

    /**
     * 当界面显示的时候调用；有背景音乐且不需要特殊处理时，需继承该方法
     * 注意！！！这个方法是每次界面出现的时候都会调用，所以需要每次都刷新的逻辑才需要放在这里，否则放在viewDidLoad中，防止反复刷新
     */
    viewDidShow(rag?) {
        // 背景音乐
        // if (this.musicConfigId) {
        //     let musicId = DataReader.requireDataByNameIdAndKey("BaseConfig", this.musicConfigId, "Config")
        //     AudioManager.getInstance().playBackgroundMusic(musicId)
        // }
    }

    /**
     * 当界面隐藏的时候调用
     */
    viewDidHide() {
    }

    /**
     * 复用已存在的视图的时候会进行数据刷新
     * @param arg 参数
     */
    refrshForReuse(arg: any) {
        this.args = arg
    }

    private registerListeners() {
        let tbMsg = this.getMessageListeners();
        for (const key in tbMsg) {
            EventManager.on(key.toString(), function (...msg) {
                tbMsg[key](...msg);
            }, this)
        }
    }

    /**
     * 子类需要重写此方法，返回需要注册的监听事件
     */
    getMessageListeners() {
        return {};
    };

    /**
     * 设置视图组件脚本
     * @param v 
     */
    setViewComponent(v: Component) {
        this._viewComponent = v;
    }

    /**
     * 所有对视图组件的操作都通过此方法进行操作，不可直接调用viewComponent
     * @param method 视图组件的方法名
     * @param arg 参数
     */
    viewDoAction(method: string, ...arg: any[]) {
        if (!this._viewComponent) {
            return
        }

        if (this._viewComponent[method]) {
            this._viewComponent[method].apply(this._viewComponent, arg)
        }
    }


    /**
     * 以下两个update方法因为考虑性能原因，默认不调用，需要激活的话要重写UIView的对应方法
     */

    update(dt) {

    }

    lateUpdate(dt) {

    }


    start() {

    }

    onUIDestroy() {

    }

    onUIEnable() {

    }

    onUIDisable() {

    }

    /**
     * 控制器析构函数，当控制器销毁的时候会调用
     */
    destructor() {
        EventManager.targetOff(this)
        this.viewWillDestory()
        if (this.rootView) {
            this.rootView.parent = null
            this.rootView.destroy()
            this.rootView = null
        }
    }

    viewWillDestory() {
        if (!this._viewComponent) {
            return
        }
        this._viewComponent.node.parent = null
        this._viewComponent.node.destroy()
        this.releaseCache()
        this.unloadAudio()
        this._viewComponent = null
        // if (this.viewMode == viewMode.SCENE&&(!noRemoveUnused)) {
        //     this.controllerManager.releaseUnusedAssets()
        // }
    }

    isViewDestory() {
        return !this._viewComponent
    }

    /**
     * 真实引用计数每个控制器只持有一份，具体使用计数用自身计数器,目前只是管理器调用，如果自己动态加载了资源也可以调用这个方法让控制器统一管理内存
     * @param assetArray 缓存动态加载的资源
     */
    cacheRes(assetArray: Asset | Asset[]) {
        if (!(assetArray instanceof Array)) {
            assetArray = [assetArray]
        }
        for (let index = 0; index < assetArray.length; index++) {
            let asset: Asset = assetArray[index];
            let assetInfo = this.dependAssetMap[asset.uuid]
            if (assetInfo) {
                assetInfo[1] += 1
            } else {
                asset.addRef()
                if (!this.rootView) {
                    console.log("controller 已销毁 释放加载回的资源")
                    MemoryManager.getInstance().cacheDelayReleaseRes(asset)
                } else {
                    this.dependAssetMap[asset.uuid] = [asset, 1]
                }
            }
        }
    }

    /**
     * 释放缓存的资源
     */
    releaseCache() {
        console.log("release controller cache:", this.constructor["className"])
        for (const key in this.dependAssetMap) {
            const assetInfo = this.dependAssetMap[key];
            let asset: Asset = assetInfo[0]
            // asset.decRef()
            MemoryManager.getInstance().cacheDelayReleaseRes(asset)
        }
        this.dependAssetMap = {}
    }

    /**
     * @param assetArray 预加载需要加载的音效
     */
    preloadAudio(packageNameArray: string | string[]) {
        if (!window["cri"] || sys.isBrowser) {
            return
        }
        if (!(packageNameArray instanceof Array)) {
            packageNameArray = [packageNameArray]
        }
        for (let index = 0; index < packageNameArray.length; index++) {
            let packageName: string = packageNameArray[index];
            let sta = this.preloadAudioRecordMap[packageName]
            if (!sta) {
                this.preloadAudioRecordMap[packageName] = true;
                // AudioManager.getInstance().loadAcbFile(packageName);
            }
        }
    }

    /**
     * 释放音效的资源
     */
    unloadAudio() {
        if (!window["cri"] || sys.isBrowser) {
            return
        }
        for (const key in this.preloadAudioRecordMap) {
            const sta = this.preloadAudioRecordMap[key];
            if (sta) {
                // AudioManager.getInstance().releaseAcb(key);
            }
        }
        this.preloadAudioRecordMap = {}
    }

    /**
     * @desc 获得图集内的资源
     * @param spriteName 图集内的图片名
     */
    async getUISpriteFrame(spriteName: string) {
        // let SpriteFrame = <SpriteFrame>await UIAtlasManager.getUISpriteFrame(spriteName, this)
        // return SpriteFrame
    }

    /**
     * 获得某一资源
     * @param str 资源的url
     * @param type 类型
     */
    async getRes(str: string, type: typeof Asset = Asset, bundle: AssetManager.Bundle = resources) {
        let res = this.getLoadedRes(str, type)
        if (res) {
            return res
        } else {
            return await this.loadRes(str, type, bundle)
        }
    }

    /**
     * 获得已加载过并且没有释放的资源,如果没有加载过或者已经释放,返回null
     * @param str 资源的url
     * @param type 类型
     */
    getLoadedRes(str: string, type: typeof Asset = Asset) {
        let res = resources.get(str, type)
        if (res) {
            let assetInfo = this.dependAssetMap[res.uuid]
            if (assetInfo) {
                assetInfo[1] += 1
            } else {
                res.addRef()
                if (!this.rootView) {
                    console.log("controller 已销毁 释放加载回的资源", str)
                    MemoryManager.getInstance().cacheDelayReleaseRes(res)
                } else {
                    this.dependAssetMap[res.uuid] = [res, 1]
                }
            }
            return res
        }
    }

    /**
     * 
     * @param str 加载动态资源
     */
    async loadRes(str: string | string[], type: typeof Asset = Asset, bundle: AssetManager.Bundle = resources) {
        let strs: any[] = []
        if (str instanceof Array) {
            strs = str
        } else {
            strs.push(str)
        }
        for (let index = 0; index < strs.length; index++) {
            const resStr = strs[index];
            this.loadingCountMap[resStr] = (this.loadingCountMap[resStr] || 0) + 1
        }
        let asset = await loadResByPromise(str, type, bundle)
        let assets: Asset[] = []
        if ("string" != typeof (str)) {
            assets = <Asset[]>asset
        } else {
            assets.push(<Asset>asset)
        }

        for (let index = 0; index < assets.length; index++) {
            const res = assets[index];
            let resStr = strs[index]
            this.loadingCountMap[resStr]--
            let assetInfo = this.dependAssetMap[res.uuid]
            if (!assetInfo) {
                res.addRef()
                if (!this.rootView || this.loadingCountMap[resStr] < 0) {
                    if (!this.rootView) {
                        console.log("controller 已销毁 释放加载回的资源", str)
                    } else {
                        this.loadingCountMap[resStr]++
                    }
                    MemoryManager.getInstance().cacheDelayReleaseRes(res)
                } else {
                    this.dependAssetMap[res.uuid] = [res, 1]
                }
            } else {
                assetInfo[1] += 1
            }
        }
        if (!this.rootView) {
            return
        }
        return asset
    }

    /**
     * 
     * @param str 需要释放的资源字符串、资源或数组
     * @param isImmediately 释放立即释放，默认为false
     * 适当的时候可以调用removeUnusedRes方法对count == 0的资源进行集中释放，防止资源反复加载卸载
     */
    releaseRes(str: string | string[] | Asset | Asset[], isImmediately: boolean = false) {
        let strs: any[] = []
        if (str instanceof Array) {
            strs = str
        } else {
            strs.push(str)
        }
        for (const s of strs) {
            let loadedAsset = s
            if (typeof s == "string") {
                loadedAsset = resources.get(s)
            }
            if (loadedAsset) {
                let assetInfo = this.dependAssetMap[loadedAsset.uuid]
                if (assetInfo) {
                    let count = (--assetInfo[1])
                    let asset: Asset = assetInfo[0]
                    if (isImmediately && count <= 0) {
                        asset.decRef()
                        delete this.dependAssetMap[loadedAsset.uuid]
                    }
                }
            }
            else if (typeof s == "string" && this.loadingCountMap[s] && this.loadingCountMap[s] > 0) {
                this.loadingCountMap[s]--
            }
        }
    }

    /**
     * 移除无用资源
     */
    removeUnusedRes() {
        for (const key in this.dependAssetMap) {
            const assetInfo = this.dependAssetMap[key];
            let count = assetInfo[1]
            let asset: Asset = assetInfo[0]
            if (count <= 0) {
                delete this.dependAssetMap[asset.uuid]
                // asset.decRef()
                MemoryManager.getInstance().cacheDelayReleaseRes(asset)
            }
        }
    }

    /**
     * 
     * @param evenStr 事件字符串
     * @param arg 参数
     */
    dispatchEvent(evenStr: string, ...arg: any[]) {
        arg.unshift(evenStr)
        EventManager.emit.apply(EventManager, arg)
    }

    /**
     * 关闭当前视图
     */
    close() {
        this.controllerManager.closeView(this)
    }

    closeViewByName(name: string) {
        this.controllerManager.closeViewByName(name)
    }

    /**
     * 
     * @param arg 推出一个新视图
     */
    pushController(...arg: any[]) {
        return this.controllerManager.pushViewByController.apply(this.controllerManager, arg)
    }

    /**
     * 
     * @param arg pop至指定视图（已显示过的）
     */
    popToTargetView(...arg: any[]) {
        return this.controllerManager.popToTargetViewByController.apply(this.controllerManager, arg)
    }

    /**
     * 关闭所有 subControllers 
     */
    closeAllPanel() {
        this.subControllers.forEach(subContro => {
            subContro.close()
        });
    }

    isEnable() {
        return this.rootView.active
    }

    enable() {
        this.rootView.active = true
    }

    disable() {
        this.rootView.active = false
    }


    isCloseBackKeyOnAndroid() {
        return true
    }

}
