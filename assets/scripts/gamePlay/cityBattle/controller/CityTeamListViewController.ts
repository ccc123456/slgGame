import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { CityTeamListView } from '../view/CityTeamListView';
import { BattleInfo, BattleUnit, CityBattleDetail } from 'db://assets/resource/proto/structure';
import City, { teamListData } from '../mode/City';
import { CityTeamDetailViewController } from './CityTeamDetailViewController';
import { CityTeamDetailAtkViewController } from './CityTeamDetailAtkViewController';
import { CsCityBattleDetail, csCityBattleDetailId, ScCityBattleDetail } from 'db://assets/resource/proto/MessageCity';
import { CityBattleMode } from '../mode/CityBattleMode';
const { ccclass, property } = _decorator;

@ccclass('CityTeamListViewController')
export class CityTeamListViewController extends ViewController {
    static className: string = "CityTeamListViewController"
    viewClass: (typeof UIView) = CityTeamListView
    viewMode = viewMode.SCENE
    teamListVo: teamListData[] = []
    cityVo: City = null

    cityBattleModel: CityBattleMode = <CityBattleMode>CityBattleMode.getInstance()

    viewDidLoad(): void {
        this.cityVo = this.args.cityVo
        let cityBattleDetail: CityBattleDetail = this.args.cityBattleDetail
        this.updateTeamList(cityBattleDetail)
    }

    updateTeamList(cityBattleDetail: CityBattleDetail) {
        this.teamListVo = []
        //添加战斗信息
        let _battleInfo = cityBattleDetail.battleInfo;
        for (let index = 0; index < _battleInfo.length; index++) {
            let _info: BattleInfo = _battleInfo[index]
            let _teamVo: teamListData = {
                atk: _info.attack,
                def: _info.defend,
                battle: true,
                battleInfo: _info
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

    //战斗中的队伍详情
    openTeamDetailHandler(index: number) {
        let teamVo: teamListData = this.teamListVo[index];
        this.pushController(CityTeamDetailViewController, { battleInfo: teamVo.battleInfo })
    }

    //战斗中的队伍详情
    openTeamDetailAtk(index: number) {
        let teamVo: teamListData = this.teamListVo[index];
        if (teamVo.atk) {
            this.pushController(CityTeamDetailAtkViewController, { battleUnit: teamVo.atk, titleStr: "进攻队伍" })
        }
    }

    //战斗中的队伍详情
    openTeamDetailDef(index: number) {
        let teamVo: teamListData = this.teamListVo[index];
        if (teamVo.def) {
            this.pushController(CityTeamDetailAtkViewController, { battleUnit: teamVo.def, titleStr: "防守队伍" })
        }
    }

    //动画播完之后请求下一个战斗
    cityBattleInfoHandler() {
        let cityBattleDetail: CsCityBattleDetail = {
            cityId: Number(this.cityVo.getId())
        }
        let cityBattleDetailCreate = CsCityBattleDetail.create(cityBattleDetail)
        let cityBattleDetailbuffer = CsCityBattleDetail.encode(cityBattleDetailCreate).finish()

        this.cityBattleModel.request(cityBattleDetailbuffer, csCityBattleDetailId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScCityBattleDetail = ScCityBattleDetail.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            console.log(plater);
            this.updateTeamList(plater.detail)
            this.viewDoAction("updateView")
        })
    }
}


