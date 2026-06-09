import { _decorator, Component, Node } from 'cc';
import Model from '../../../frameWork/data/Model';
import DataReader from '../../../frameWork/data/DataReader';
import City from './City';
import { CsGetCityList, csGetCityListId, ScGetCityList } from 'db://assets/resource/proto/MessageCity';
import { CityInfo } from 'db://assets/resource/proto/structure';
const { ccclass, property } = _decorator;

@ccclass('CityBattleMode')
export class CityBattleMode extends Model {
    static modelName: string = "CityBattleMode";
    private citys: City[] = []

    getMessageListeners() {
        return {}
    }

    synchronize(data: CityInfo[]) {
        this.citys = []
        for (let index = 0; index < data.length; index++) {
            let cityId = data[index].cityId
            let _city: City = new City(`${cityId}`);
            _city.synchronize(data[index])
            this.citys.push(_city)
        }
    }

    getAllCitys(): City[] {
        return this.citys
    }

    getCityList(callBack?: Function) {
        let getCityList: CsGetCityList = {}
        let cityListCreate = CsGetCityList.create(getCityList)
        let cityListbuffer = CsGetCityList.encode(cityListCreate).finish()

        this.request(cityListbuffer, csGetCityListId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScGetCityList = ScGetCityList.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.synchronize(plater.cityInfos)   //数据同步
            console.log("解包后的数据", plater)
            callBack && callBack()
        })
    }
}


