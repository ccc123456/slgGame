import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { CityTeamListView } from '../view/CityTeamListView';
import { BattleInfo, BattleUnit, CityBattleDetail } from 'db://assets/resource/proto/structure';
import City, { teamListData } from '../mode/City';
const { ccclass, property } = _decorator;

@ccclass('CityTeamListViewController')
export class CityTeamListViewController extends ViewController {
    static className: string = "CityTeamListViewController"
    viewClass: (typeof UIView) = CityTeamListView
    viewMode = viewMode.SCENE
    teamListVo: teamListData[] = []
    cityVo: City = null

    viewDidLoad(): void {
        this.cityVo = this.args.cityVo
        let cityBattleDetail: CityBattleDetail = this.args.cityBattleDetail
        //添加战斗信息
        let _battleInfo = cityBattleDetail.battleInfo;
        for (let index = 0; index < _battleInfo.length; index++) {
            let _info: BattleInfo = _battleInfo[index]
            let _teamVo: teamListData = {
                atk: _info.attack,
                def: _info.defend,
                battle: true
            }
            this.teamListVo.push(_teamVo)
        }
        //添加等待
        let atkQueue = cityBattleDetail.attackQueue
        let atkQuLength = atkQueue.length
        let defQueue = cityBattleDetail.garrisonQueue.concat(cityBattleDetail.defendQueue)
        let defQuLength = defQueue.length
        let cycleLength = Math.max(atkQuLength, defQuLength)
        for (let index = 0; index < cycleLength; index++) {
            let _teamVo: teamListData = {
                atk: atkQueue[index],
                def: defQueue[index],
                battle: false
            }
            this.teamListVo.push(_teamVo)
        }
    }

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }
}


