/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: HomeView.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Thu May 28 2026 10:12:38 GMT+0800 (中国标准时间) 
 **********************************************/


import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { HomeViewController } from '../controller/HomeViewController';
import { HomeBottomView } from './HomeBottomView';
import { HomeTopView } from './HomeTopView';
const { ccclass, property } = _decorator;

@ccclass('HomeView')
export class HomeView extends UIView {
    static className: string = "HomeView"
    delegate: HomeViewController
    protected static prefabUrl: string = "ui/home/Home"

    @property(Prefab)
    homeBottomPre: Prefab = null

    @property(Prefab)
    homeTopPre: Prefab = null

    homeBottonView: HomeBottomView = null
    homeTopView: HomeTopView = null

    onLoad() {
        super.onLoad()

        let homeBottom = this.node.getChildByName("homeBottom")
        let bottomPre = instantiate(this.homeBottomPre)
        this.homeBottonView = bottomPre.getComponent(HomeBottomView)
        homeBottom.addChild(bottomPre)

        let homeTop = this.node.getChildByName("homeTop")
        let topPre = instantiate(this.homeTopPre)
        this.homeTopView = topPre.getComponent(HomeTopView)
        homeTop.addChild(topPre)

    }

    initView() {
        this.homeBottonView && this.homeBottonView.initview(this.delegate)
        this.homeTopView && this.homeTopView.initview(this.delegate)
    }

    updateView() {
        this.homeBottonView && this.homeBottonView.updateView()
        this.homeTopView && this.homeTopView.updateView()
    }
}


