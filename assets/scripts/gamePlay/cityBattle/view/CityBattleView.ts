import { _decorator, Component, find, instantiate, Label, Node } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { CityBattleViewController } from '../controller/CityBattleViewController';
import DataReader from '../../../frameWork/data/DataReader';
import City, { cityLockState } from '../mode/City';
import EventManager from '../../../frameWork/manager/EventManager';
import { SHOWTIPS } from '../../../GameConfig';
import { BattleInfo, BattleUnit } from 'db://assets/resource/proto/structure';
const { ccclass, property } = _decorator;

@ccclass('CityBattleView')
export class CityBattleView extends UIView {
    static className: string = "CityBattleView"
    delegate: CityBattleViewController
    protected static prefabUrl: string = "ui/cityBattle/CityBattle"

    private _close: Node = null
    private _map: Node = null;
    private _cityItem: Node = null
    private _teamItem: Node = null
    onLoad() {
        this._close = find("close/close", this.node)
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })

        this._map = find("scrollView/view/content/map/content", this.node)
        this._cityItem = this.node.getChildByName("cityItem");
        this._cityItem.active = false
        this._teamItem = this.node.getChildByName("teamItem");
        this._teamItem.active = false
    }

    updateView() {
        let citys: City[] = this.delegate.ciryBattleModel.getAllCitys()
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
            //lockState
            let _lockState = _city.getLockState();
            let _lock = _item.getChildByName("lock");
            _lock.active = _lockState == cityLockState.lock
            let _unlockable = _item.getChildByName("unlockable")
            _unlockable.active = false
            //查看
            let _unlockableCheck = _unlockable.getChildByName("check");
            this.registbuttonClick(_unlockableCheck, () => {
                let _cityId = Number(_city.getId())
                this.delegate.openInfoHandler(_cityId)
            })
            let _unlock = _item.getChildByName("unlock")
            _unlock.active = false
            //查看
            let _unlockCheck = _unlock.getChildByName("check");
            this.registbuttonClick(_unlockCheck, () => {
                let _cityId = Number(_city.getId())
                this.delegate.openInfoHandler(_cityId)
            })
            //攻城
            let _unlocksiege = _unlock.getChildByName("siege");
            this.registbuttonClick(_unlocksiege, () => {
                this.delegate.siegeHandler()
            })
            //政务
            let _unlockGovernment = _unlock.getChildByName("government");
            this.registbuttonClick(_unlockGovernment, () => {

            })
            //防守
            let _unlockDefense = _unlock.getChildByName("defense");
            this.registbuttonClick(_unlockDefense, () => {

            })
            this.registbuttonClick(_item, () => {
                if (_lockState == cityLockState.lock) {
                    EventManager.emit(SHOWTIPS, "城池未解锁")
                    return
                }
                _unlockable.active = _lockState == cityLockState.unlocktab
                _unlock.active = _lockState == cityLockState.unlock
            })
            //战斗
            let battleInfos = _city.getBattleInfo()
            let _battle = _item.getChildByName("battle");
            _battle.active = battleInfos.length > 0
            if (battleInfos.length) {
                for (let index = 0; index < battleInfos.length; index++) {
                    let _team = _battle.getChildByName(`team${index + 1}`)
                    _team.destroyAllChildren()
                    let heroIds: string[] = []
                    let battleInfo: BattleInfo = battleInfos[index]
                    let addHeroid = (battleUn: BattleUnit) => {
                        let heroState = battleUn.hero
                        let heroId = heroState[0].heroId;
                        heroIds.push(`${heroId}`)
                    }
                    if (battleInfo.attack) {
                        addHeroid(battleInfo.attack)
                    }
                    if (battleInfo.defend) {
                        addHeroid(battleInfo.defend)
                    }
                    for (let heroIndex = 0; heroIndex < heroIds.length; heroIndex++) {
                        let _itemTeam = instantiate(this._teamItem);
                        _itemTeam.active = true;
                        _team.addChild(_itemTeam)
                        _item.x = heroIndex * 20
                    }
                }
            }
        }
    }
}


