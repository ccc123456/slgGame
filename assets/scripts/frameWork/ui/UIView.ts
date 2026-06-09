/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: UIView.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Wed May 27 2026 16:28:18 GMT+0800 (中国标准时间) 
 **********************************************/


import { _decorator, assert, Asset, Component, Node } from 'cc';
import BaseUI from './BaseUI';
import ViewController, { viewMode } from '../controller/ViewController';
const { ccclass, property } = _decorator;
/**
 * 这个类里面只处理简单的UI布局、刷新、和事件监听，不进行数据存储以及复杂逻辑的处理
 * UIView就相当于手机屏，只负责显示相关，以及事件相应传递，不负责逻辑处理，最后的逻辑需要交给cpu(ViewControlle)处理，数据交给磁盘存储(Model)
 * 这样理解有助于帮助分析哪些逻辑应该分别放在mvc哪部分，避免代码混乱难以维护
 * 当发生内存警告的时候这个界面有可能被销毁，当需要显示的时候通过数据和逻辑状态进行重建
 */
@ccclass('UIView')
export default abstract class UIView extends BaseUI {
    static className: string = null
    static homeEditState?: boolean = null

    //代理控制器，所有复杂逻辑均由代理控制器完成
    delegate: ViewController = null
    clickBgClose: boolean = false; // 点击空白处关闭 默认不关闭

    //由于creator生命周期原因在onLoad的时候还不能获得代理控制器，所以此时delegate为null
    onLoad() {
        super.onLoad()
    }


    start() {
        super.start && super.start()
        if (this.delegate) {
            if (this.delegate.viewClass != this.constructor) {
                assert(false, "当前UIView的delegate不是自己的controler,UIView需要和ViewController一对一配对使用,如果是主界面中的子界面，无需controller,请直接用BaseUI:" + (this.constructor["className"] || this.constructor.name))
                return
            }
            this.delegate.start()
            if (this.clickBgClose && this.delegate.viewMode == viewMode.PANEL) {
                this.registbuttonClick(this.node, () => {
                    this.delegate.close()
                })
            }
        } else {
            assert(false, "UIView需要和ViewController配对使用,如果是主界面中的子界面，无需controller,请直接用BaseUI:" + (this.constructor["className"] || this.constructor.name))
        }
    }

    async getUISpriteFrame(spriteName: string) {
        console.error("无特殊情况，view中的资源获取和内存管理交由delegate(controller)进行管理,this.delegate.getUISpriteFrame", this.constructor["className"])
        return await this.delegate.getUISpriteFrame(spriteName)
    }

    async getRes(str: string, type: typeof Asset = Asset) {
        console.error("无特殊情况，view中的资源获取和内存管理交由delegate(controller)进行管理,this.delegate.getRes", this.constructor["className"])
        return await this.delegate.getRes(str, type)
    }

    async loadRes(str: string, type: typeof Asset = Asset) {
        console.error("无特殊情况，view中的资源获取和内存管理交由delegate(controller)进行管理,this.delegate.loadRes", this.constructor["className"])
        return await this.delegate.loadRes(str, type)
    }

    onDestroy() {
        super.onDestroy && super.onDestroy()
        this.delegate && this.delegate.onUIDestroy()
    }

    onEnable() {
        super.onEnable && super.onEnable()
        this.delegate && this.delegate.onUIEnable()
    }

    onDisable() {
        super.onDisable && super.onDisable()
        this.delegate && this.delegate.onUIDisable()
    }

}


