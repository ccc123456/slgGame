import { _decorator, Component, find, instantiate, Label, Node } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { CityBattleViewController } from '../controller/CityBattleViewController';
import DataReader from '../../../frameWork/data/DataReader';
import City from '../mode/City';
const { ccclass, property } = _decorator;

@ccclass('CityBattleView')
export class CityBattleView extends UIView {
    static className: string = "CityBattleView"
    delegate: CityBattleViewController
    protected static prefabUrl: string = "ui/cityBattle/CityBattle"

    private _close: Node = null
    private _map: Node = null;
    private _cityItem: Node = null
    onLoad() {
        this._close = find("close/close", this.node)
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })

        this._map = find("scrollView/view/content/map/content", this.node)
        this._cityItem = this.node.getChildByName("cityItem");
        this._cityItem.active = false
    }

    updateView() {
        let citys: City[] = this.delegate.ciryBattleModel.getAllCityIds()
        for (let index = 0; index < citys.length; index++) {
            let _city: City = citys[index]
            let _item = instantiate(this._cityItem);
            _item.active = true;
            this._map.addChild(_item);
            let posCof: string = _city.getCityPosition()
            let posArr = posCof.split(",")
            _item.x = Number(posArr[0]);
            _item.y = Number(posArr[1]);
            //name
            let _name = _item.getChildByName("name");
            _name.getComponent(Label).string = _city.getName()
            //id
            let _id = _item.getChildByName("id")
            _id.getComponent(Label).string = _city.getId()
        }
    }
}


