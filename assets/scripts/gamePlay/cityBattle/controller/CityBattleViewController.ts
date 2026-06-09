import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { CityBattleView } from '../view/CityBattleView';
import { CityBattleMode } from '../mode/CityBattleMode';
import { CsGetCityDetail, csGetCityDetailId, ScGetCityDetail } from 'db://assets/resource/proto/MessageCity';
import { CityInfo } from 'db://assets/resource/proto/structure';
import { CityInfoViewController } from './CityInfoViewController';
import City from '../mode/City';
import { TeamViewController } from '../../team/controller/TeamViewController';
import { TeamBtnState } from '../../team/model/TeamModel';
const { ccclass, property } = _decorator;

@ccclass('CityBattleViewController')
export class CityBattleViewController extends ViewController {
    static className: string = "CityBattleViewController"
    viewClass: (typeof UIView) = CityBattleView
    viewMode = viewMode.SCENE

    ciryBattleModel: CityBattleMode = <CityBattleMode>CityBattleMode.getInstance()

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }

    openInfoHandler(_cityId: number) {
        let getCityDetail: CsGetCityDetail = {
            cityId: _cityId
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

    siegeHandler() {
        this.pushController(TeamViewController, { btnState: TeamBtnState.citySiege })
    }
}


