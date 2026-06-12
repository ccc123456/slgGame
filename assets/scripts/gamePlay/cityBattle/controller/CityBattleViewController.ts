import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { CityBattleView } from '../view/CityBattleView';
import { CityBattleMode } from '../mode/CityBattleMode';
import { CsCityBattleDetail, csCityBattleDetailId, CsDeclareCapital, csDeclareCapitalId, CsGetCityDetail, csGetCityDetailId, CsHeroDeadList, csHeroDeadListId, ScCityBattleDetail, ScCityBattleResult, ScDeclareCapital, ScGetCityDetail, ScHeroDeadList } from 'db://assets/resource/proto/MessageCity';
import { CityInfo } from 'db://assets/resource/proto/structure';
import { CityInfoViewController } from './CityInfoViewController';
import City from '../mode/City';
import { TeamViewController } from '../../team/controller/TeamViewController';
import { TeamBtnState } from '../../team/model/TeamModel';
import { CityTeamListViewController } from './CityTeamListViewController';
import { LegionModel } from '../../legion/model/LegionModel';
const { ccclass, property } = _decorator;

@ccclass('CityBattleViewController')
export class CityBattleViewController extends ViewController {
    static className: string = "CityBattleViewController"
    viewClass: (typeof UIView) = CityBattleView
    viewMode = viewMode.SCENE

    ciryBattleModel: CityBattleMode = <CityBattleMode>CityBattleMode.getInstance()
    legionModel: LegionModel = <LegionModel>LegionModel.getInstance()
    checkCity: City = null
    battleResult: ScCityBattleResult = null

    getMessageListeners(): {} {
        return {
            CITY_UPDATA: () => {
                this.viewDoAction("updateView")
                if (this.checkCity) {
                    this.checkCity = this.ciryBattleModel.getCityById(this.checkCity.getId())
                    this.viewDoAction("updateCheckNode")
                }
            },
            CITY_RESULT: (_battleResult: ScCityBattleResult) => {
                this.battleResult = _battleResult
                this.viewDoAction("updateResult")
            }
        }
    }

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }

    openInfoHandler() {
        let getCityDetail: CsGetCityDetail = {
            cityId: Number(this.checkCity.getId())
        }
        let cityDetailCreate = CsGetCityDetail.create(getCityDetail)
        let cityDetailbuffer = CsGetCityDetail.encode(cityDetailCreate).finish()

        this.ciryBattleModel.request(cityDetailbuffer, csGetCityDetailId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScGetCityDetail = ScGetCityDetail.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            let _city: CityInfo = plater.cityInfo;
            let cityId = _city.cityId
            let _cityVo: City = new City(`${cityId}`);
            _cityVo.synchronize(_city)
            this.pushController(CityInfoViewController, {
                cityVo: _cityVo
            })
        })
    }

    //政务
    governmentHandler() {

    }

    //战斗信息
    cityBattleInfoHandler(_cityVo: City) {
        let cityBattleDetail: CsCityBattleDetail = {
            cityId: Number(_cityVo.getId())
        }
        let cityBattleDetailCreate = CsCityBattleDetail.create(cityBattleDetail)
        let cityBattleDetailbuffer = CsCityBattleDetail.encode(cityBattleDetailCreate).finish()

        this.ciryBattleModel.request(cityBattleDetailbuffer, csCityBattleDetailId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScCityBattleDetail = ScCityBattleDetail.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            console.log(plater);
            this.pushController(CityTeamListViewController, {
                cityBattleDetail: plater.detail,
                cityVo: _cityVo
            })
        })
    }

    //进攻防守
    siegeHandler(btnState: TeamBtnState) {
        let heroDeadList: CsHeroDeadList = {
            cityId: Number(this.checkCity.getId())
        }
        let heroDeadListCreate = CsHeroDeadList.create(heroDeadList)
        let heroDeadListBuffer = CsHeroDeadList.encode(heroDeadListCreate).finish()

        this.ciryBattleModel.request(heroDeadListBuffer, csHeroDeadListId, (msg) => {
            let plater: ScHeroDeadList = ScHeroDeadList.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            console.log("收到服务器响应 1517..", plater)
            console.log(plater);
            this.pushController(TeamViewController, {
                btnState: btnState,
                cityId: Number(this.checkCity.getId()),
                heroDeadList: plater.deadInfo
            })
        })
    }

    //宣战
    declaraHandler() {
        let declareCapital: CsDeclareCapital = {
            cityId: Number(this.checkCity.getId())
        }
        let declareCapitalCreate = CsHeroDeadList.create(declareCapital)
        let declareCapitalBuffer = CsHeroDeadList.encode(declareCapitalCreate).finish()

        this.ciryBattleModel.request(declareCapitalBuffer, csDeclareCapitalId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScDeclareCapital = ScDeclareCapital.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            console.log(plater);
        })
    }
}


