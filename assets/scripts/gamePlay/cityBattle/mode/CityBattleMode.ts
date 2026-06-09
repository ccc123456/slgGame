import { _decorator, Component, Node } from 'cc';
import Model from '../../../frameWork/data/Model';
import DataReader from '../../../frameWork/data/DataReader';
import City from './City';
const { ccclass, property } = _decorator;

@ccclass('CityBattleMode')
export class CityBattleMode extends Model {
    static modelName: string = "CityBattleMode";
    private citys: City[] = []

    getMessageListeners() {
        return {}
    }

    getAllCityIds() {
        let cityIds = DataReader.getKeysOfTable("City")
        this.citys = []
        for (let index = 0; index < cityIds.length; index++) {
            let _city: City = new City(cityIds[index]);
            this.citys.push(_city)
        }
        return this.citys
    }
}


