/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: BaseUI.ts
 description:ui基类
 author: cuicongcong
 date: Wed May 27 2026 16:29:07 GMT+0800 (中国标准时间) 
 **********************************************/


import { _decorator, assert, Asset, AssetManager, Button, Component, Event, EventTouch, instantiate, isValid, Node, resources, UITransform, Vec3 } from 'cc';
import EventManager from '../manager/EventManager';
import { loadResByPromise } from '../utils/CommonUtils';
import MemoryManager from '../manager/MemoryManager';
const { ccclass, property } = _decorator;
type buttonHandlerType = Function | string | { [key: string]: Function | string | boolean }
type buttonConfigType = {
    [key: string]: buttonHandlerType
}

@ccclass('BaseUI')
export default abstract class BaseUI extends Component {
    protected static prefabUrl: string = null;
    private _destory = false
    private dependAssetMap: { [key: string]: [Asset, number] } = {} //依赖资源缓存
    delegate: any = null

    private _ignoreEventMessage = false;

    onLoad() {
        this.registerListeners()
    }

    private registerListeners() {
        let tbMsg = this.getMessageListeners();
        for (const key in tbMsg) {
            EventManager.on(key.toString(), function (...msg) {
                //节点不激活时忽略注册消息
                if (this._ignoreEventMessage && !this.enabledInHierarchy) return;
                tbMsg[key](...msg);
            }, this)
        }
    }

    /**
     *   
     */
    setIgnoreEventMessageOnDisable(ignore: boolean) {
        this._ignoreEventMessage = ignore
    }

    /**
     * 子类需要重写此方法，返回需要注册的监听事件
     */
    getMessageListeners() {
        return {};
    };

    /**
     * 得到prefab的路径，相对于resources目录
     */
    public static getUrl(): string {
        return this.prefabUrl;
    }


    static async createNode() {
        let prefab = await loadResByPromise(this.prefabUrl)
        let node = <Node>instantiate(prefab);
        node.addComponent(this.name)
        return node
    }

    getChildByFullName(names: string, rootNode?: Node) {
        let nameArray = names.split('.')
        rootNode = rootNode || this.node
        for (let index = 0; index < nameArray.length; index++) {
            let name = nameArray[index];
            rootNode = rootNode.getChildByName(name)
            if (!rootNode) {
                return null
            }
        }
        return rootNode
    }

    /**
    @params buttonNameOrObj 按钮名字或需要监听的对象
    @params handler 同时支持 function、string 、table 类型 :
        1、function直接回调，
        2、string会找对应的成员方法，
        3、table可以传递额外参数:
            handler.func回调方法，同样支持function和string,
            handler.eventType，相应类型默认为ccui.TouchEventType.ended
            handler.clickAudio 点击音效ID,默认S
            handler.ignoreClickAudio 忽略默认音效
    @params rootNode 默认为this.node 可以指定其他的node
    @params useCapture 触摸或鼠标事件注册在捕获阶段 //https://docs.cocos.com/creator/manual/zh/scripting/internal-events.html?h=usecapture 
    @params checkMove 检查点击结束前是否有移动,如果有移动则不响应事件
     * 
     */
    registbuttonClick(buttonNameOrNode: string | Node, handler: buttonHandlerType, rootNode?: Node, useCapture: boolean = false, stopPropagation: boolean = true, checkMove: boolean = true) {
        rootNode = rootNode || this.node
        let button = null
        if (buttonNameOrNode instanceof Node) {
            button = buttonNameOrNode
        } else {
            button = this.getChildByFullName(buttonNameOrNode, rootNode)
        }
        assert(button, `未找到按钮:${buttonNameOrNode}`)
        let method = null
        let options: any = {}
        options.eventType = Node.EventType.TOUCH_END
        options.clickAudio = "Se_Click_Common_1"

        if (handler instanceof Function) {
            method = handler
        } else if (typeof handler == "string") {
            method = (<Function>this[handler]).bind(this)
        } else {
            if (handler["func"] instanceof Function) {
                method = handler["func"]
            }
            if (typeof handler["func"] == "string") {
                method = (<Function>this[handler["func"]]).bind(this)
            }
            options.eventType = handler.eventType || options.eventType
            options.clickAudio = handler.clickAudio || options.clickAudio
            options.ignoreClickAudio = handler.ignoreClickAudio
        }

        if (method) {
            let buttonCmp: Button = button.getComponent(Button)
            let tempCB = (event: EventTouch) => {
                if (buttonCmp && buttonCmp.transition == Button.Transition.SCALE && event.type == Node.EventType.TOUCH_CANCEL && buttonCmp.target == button) {
                    let pos = event.touch.getLocation();
                    button.setScale(buttonCmp["_originalScale"])
                    const uiTransform = button.getComponent(UITransform) || button.addComponent(UITransform);
                    if (!uiTransform.hitTest(new Vec3(pos.x, pos.y, 0))) {
                        return
                    }
                    // if (!button._hitTest(pos, button)) {
                    //     return
                    // }
                }
                stopPropagation && event.propagationStopped

                if (!options.ignoreClickAudio) {
                    // AudioManager.getInstance().stopAllEffects()
                    // AudioManager.getInstance().stopByConfigId(options.clickAudio)
                    // AudioManager.getInstance().playEffect(options.clickAudio)
                }
                if (checkMove) {
                    let startLocation = event.getStartLocation();
                    let endLocation = event.getLocation();
                    if (endLocation.subtract(startLocation).length() > 50) {
                        return;
                    }
                }
                method(event)
            }
            button.targetOff(button)
            button.on(options.eventType, tempCB, button, useCapture);

            if (buttonCmp && buttonCmp.transition == Button.Transition.SCALE && options.eventType == Node.EventType.TOUCH_END && buttonCmp.target == button) {
                button.on(Node.EventType.TOUCH_CANCEL, tempCB, button, useCapture);
            }
        }
    }


    mapButtonHandlersClick(buttonsConfig: buttonConfigType, rootNode?: Node) {
        for (const buttonName in buttonsConfig) {
            let handler = buttonsConfig[buttonName];
            this.registbuttonClick(buttonName, handler, rootNode)
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

    // onLoad () {}

    start() {

    }

    // update (dt) {}
    onDestroy() {
        this._destory = true
        for (const key in this.dependAssetMap) {
            console.log("release view Cache :", (this["className"] || this.constructor.name))
            break
        }
        this.releaseCache()
    }

    /**
     * 获得某一资源
     * @param str 资源的url
     * @param type 类型
     */
    async getRes(str: string, type: typeof Asset = Asset, bundle: AssetManager.Bundle = resources) {
        let res = resources.get(str, type)
        // if (!res) {
        //     //添加子包加载判断
        //     for (let index = 0; index < G_Config.subBundles.length; index++) {
        //         res = cc[G_Config.subBundles[index]] && cc[G_Config.subBundles[index]].get(str, type)
        //         if (res) {
        //             break
        //         }
        //     }
        // }
        if (res) {
            if (!isValid(this.node)) {
                res.addRef()
                // MemoryManager.getInstance().cacheDelayReleaseRes(res, 0)
                return
            }
            let assetInfo = this.dependAssetMap[res.uuid]
            if (assetInfo) {
                assetInfo[1] += 1
            } else {
                this.dependAssetMap[res.uuid] = [res, 1]
                res.addRef()
            }
            return res
        } else {
            return await this.loadRes(str, type, bundle)
        }
    }

    /**
    * 
    * @param str 加载动态资源
    */
    async loadRes(str: string | string[], type: typeof Asset = Asset, bundle: AssetManager.Bundle = resources) {
        let asset = await loadResByPromise(str, type, bundle)

        let assets: Asset[] = []
        if ("string" != typeof (str)) {
            assets = <Asset[]>asset
        } else {
            assets.push(<Asset>asset)
        }
        for (let index = 0; index < assets.length; index++) {
            const res = assets[index];
            if (!isValid(this.node)) {
                res.addRef()
                MemoryManager.getInstance().cacheDelayReleaseRes(res, 0)
                continue
            }
            let assetInfo = this.dependAssetMap[res.uuid]
            if (!assetInfo) {
                this.dependAssetMap[res.uuid] = [res, 1]
                res.addRef()
            } else {
                assetInfo[1] += 1
            }
        }
        if (!isValid(this.node)) {
            return
        }
        return asset
    }

    /**
     * @desc 获得图集内的资源
     * @param spriteName 图集内的图片名
     */
    async getUISpriteFrame(spriteName: string) {
        // let SpriteFrame = <cc.SpriteFrame>await UIAtlasManager.getUISpriteFrame(spriteName, this)
        // return SpriteFrame
    }


    /**
     * 清除缓存的资源
     */
    private releaseCache() {
        for (const key in this.dependAssetMap) {
            const assetInfo = this.dependAssetMap[key];
            let asset: Asset = assetInfo[0]
            // asset.decRef()
            MemoryManager.getInstance().cacheDelayReleaseRes(asset, 0)
        }
        this.dependAssetMap = {}
    }

}


