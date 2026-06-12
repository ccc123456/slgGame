/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: game.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Fri May 29 2026 17:26:08 GMT+0800 (中国标准时间) 
 **********************************************/


import { _decorator, Component } from 'cc';
import DataReader from '../../frameWork/data/DataReader';
import ControllerManager from '../../frameWork/manager/ControllerManager';
import GameDataCenter from '../../GameDataCenter';
import LoginViewController from '../login/controller/LoginViewController';
import { TipViewController } from '../tip/controller/TipViewController';
import { DebugBoxViewController } from '../debugBox/controller/DebugBoxViewController';
import { LoadingViewController } from '../loading/controller/LoadingViewController';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    start() {
        DataReader.loadAllTableForBrowser()
        ControllerManager.getInstance().pushViewByController(LoginViewController)

        GameDataCenter.initModels()

        ControllerManager.getInstance().pushViewByController(DebugBoxViewController, { noBlock: true, bgStyle: null, isGlobal: true })
        //EventManager.emit(SHOWTIPS, { tip: 123 })
        ControllerManager.getInstance().pushViewByController(TipViewController, { noBlock: true, bgStyle: null, isGlobal: true })
        //EventManager.emit(SHOW_LOADING, { data: LoadInterface })
        ControllerManager.getInstance().pushViewByController(LoadingViewController, { noBlock: true, bgStyle: null, isGlobal: true })

    }
}


