import { _decorator } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import Hero from '../../hero/model/Hero';
import { HeroModel, HerosState } from '../../hero/model/HeroModel';
import { TeamBtnState } from '../model/TeamModel';
import { TeamView } from '../view/TeamView';
import { CsDispatchTroops, csDispatchTroopsId, CsHealInjuredHeroes, csHealInjuredHeroesId, HeroDeadInfo, ScDispatchTroops, ScHealInjuredHeroes } from 'db://assets/resource/proto/MessageCity';
import EventManager from '../../../frameWork/manager/EventManager';
import { SHOWTIPS } from '../../../GameConfig';
import PlayerModel from '../../home/mode/PlayerModel';
const { ccclass, property } = _decorator;

@ccclass('TeamViewController')
export class TeamViewController extends ViewController {
    static className: string = "TeamViewController"
    viewClass: (typeof UIView) = TeamView
    viewMode = viewMode.SCENE

    heroModel: HeroModel = <HeroModel>HeroModel.getInstance()
    playerModel: PlayerModel = <PlayerModel>PlayerModel.getInstance()
    heros: Hero[] = []
    teamHeroIds: number[] = []
    teamBtnState: TeamBtnState = TeamBtnState.citySiege
    cityId: number = 0
    heroDeadList: HeroDeadInfo[] = []  //阵亡武将

    _cityCostEnough: boolean = false    //城战消耗是否足够
    viewDidLoad(): void {
        this.heros = this.heroModel.getHeros(HerosState.teamCity)
        this.heroDeadList = this.args.heroDeadList || []
        if (this.heroDeadList.length > 0) {
            //死亡的放到最前面
            this.heros.sort((a: Hero, b: Hero) => {
                let aHeroid = a.getId()
                let bHeroid = b.getId()
                let aisDead = this.getHeroIsDead(Number(aHeroid)) ? 0 : 1
                let bisDead = this.getHeroIsDead(Number(bHeroid)) ? 0 : 1
                return aisDead - bisDead
            })
        }
        this.cityId = this.args.cityId || 0
    }

    getHeroIsDead(heroid: number) {
        for (let index = 0; index < this.heroDeadList.length; index++) {
            if (this.heroDeadList[index].heroTableId == heroid) {
                return true
            }
        }
        return false
    }

    viewDidShow(rag?: any): void {
        this.teamBtnState = this.args.btnState
        this.viewDoAction('updateView')
    }

    oneKeyHandler() {
        this.teamHeroIds = [];
        for (let index = 0; index < 5; index++) {
            let heroVO = this.heros[index]
            if (heroVO && heroVO.getDispatchToCityId() == 0) {
                this.teamHeroIds.push(Number(this.heros[index].getId()))
            }
        }
        this.viewDoAction("updateTeam")
    }

    //城战进攻
    siegeHadler() {
        if (!this._cityCostEnough) {
            EventManager.emit(SHOWTIPS, "道具不足")
            return
        }
        if (this.teamHeroIds.length <= 0) {
            EventManager.emit(SHOWTIPS, "请上阵角色")
            return
        }
        if (this.teamHeroIds.length < 5) {
            EventManager.emit(SHOWTIPS, "角色数量不足")
            return
        }
        let troops: CsDispatchTroops = {
            cityId: this.cityId,
            side: this.teamBtnState,
            heroIds: this.teamHeroIds
        }

        // protobuf
        let troopsCreate = CsDispatchTroops.create(troops)
        let troopsbuffer = CsDispatchTroops.encode(troopsCreate).finish()

        this.heroModel.request(troopsbuffer, csDispatchTroopsId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScDispatchTroops = ScDispatchTroops.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.close()
        })
    }

    //复活
    HealinjuredHandler(heroIds: number[], callBack?: Function) {
        let healinjured: CsHealInjuredHeroes = {
            cityId: this.cityId,
            heroIds: heroIds
        }
        let healinjuredCreate = CsDispatchTroops.create(healinjured)
        let healinjuredbuffer = CsDispatchTroops.encode(healinjuredCreate).finish()

        this.heroModel.request(healinjuredbuffer, csHealInjuredHeroesId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScHealInjuredHeroes = ScHealInjuredHeroes.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            for (let index = 0; index < heroIds.length; index++) {
                let heroId = heroIds[index];
                let _heroIndex = -1
                for (let heroIndex = 0; heroIndex < this.heroDeadList.length; heroIndex++) {
                    if (this.heroDeadList[heroIndex].heroTableId == heroId) {
                        _heroIndex = heroIndex
                    }
                }
                if (_heroIndex != -1) {
                    this.heroDeadList.splice(_heroIndex, 1)
                }
            }
            callBack && callBack()
        })
    }
}


