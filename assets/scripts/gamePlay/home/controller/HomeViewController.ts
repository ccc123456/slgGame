/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: HomeViewController.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Thu May 28 2026 10:12:26 GMT+0800 (中国标准时间) 
 **********************************************/


import { _decorator } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import EventManager from '../../../frameWork/manager/EventManager';
import UIView from '../../../frameWork/ui/UIView';
import { SHOW_LOADING, SHOWTIPS } from '../../../GameConfig';
import { BagViewController } from '../../bag/controller/BagViewController';
import { CityBattleViewController } from '../../cityBattle/controller/CityBattleViewController';
import { CityBattleMode } from '../../cityBattle/mode/CityBattleMode';
import { HeroViewController } from '../../hero/controller/HeroViewController';
import { LegionAddViewController } from '../../legion/controller/LegionAddViewController';
import { LegionViewController } from '../../legion/controller/LegionViewController';
import { LegionModel } from '../../legion/model/LegionModel';
import PlayerModel from '../mode/PlayerModel';
import { HomeView } from '../view/HomeView';
import { preloadFolder, preloadPrefab } from '../../../frameWork/utils/CommonUtils';
import { LoadInterface, LoadState } from '../../loading/controller/LoadingViewController';
const { ccclass, property } = _decorator;

@ccclass('HomeViewController')
export class HomeViewController extends ViewController {
    static className: string = "HomeViewController"
    viewClass: (typeof UIView) = HomeView
    viewMode = viewMode.SCENE

    playerModel: PlayerModel = <PlayerModel>PlayerModel.getInstance()
    legionModel: LegionModel = <LegionModel>LegionModel.getInstance()
    cityBattleModel: CityBattleMode = <CityBattleMode>CityBattleMode.getInstance()

    viewDidLoad(): void {
        this.viewDoAction("initView")
    }

    viewDidShow(rag?) {
        this.viewDoAction('updateView')
    }

    clickCampaignHandler() {
        EventManager.emit(SHOWTIPS, "点击战役")

    }

    clickLordHandler() {
        EventManager.emit(SHOWTIPS, "点击主公")

    }
    clickHeroHandler() {
        this.pushController(HeroViewController)
    }
    clickBagHandler() {
        this.pushController(BagViewController)

    }
    clickClubHandler() {
        let legionId = this.legionModel.getLegionMemberId();
        if (legionId) {
            this.legionModel.getLegionInfo(legionId, () => {
                this.pushController(LegionViewController)
            })
        } else {
            this.legionModel.getLegionAllList(() => {
                this.pushController(LegionAddViewController)
            })
        }
    }
    clickCityHandler() {
        this.cityBattleModel.getCityList(() => {
            // preloadPrefab("ui/cityBattle/CityBattle")
            let loadVo: LoadInterface = {
                path: "ui/cityBattle/CityBattle",
                loadType: LoadState.Prefab,
                title: "正在加载地图资源",
                endCallBack: () => {
                    this.pushController(CityBattleViewController)
                }
            }
            EventManager.emit(SHOW_LOADING, loadVo)
        })

    }

}


