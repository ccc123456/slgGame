import { _decorator, Component, find, instantiate, Label, Node, UITransform, Vec3 } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { CityBattleViewController } from '../controller/CityBattleViewController';
import DataReader from '../../../frameWork/data/DataReader';
import City, { cityLockState, cityState } from '../mode/City';
import EventManager from '../../../frameWork/manager/EventManager';
import { SHOWTIPS } from '../../../GameConfig';
import { BattleInfo, BattleUnit } from 'db://assets/resource/proto/structure';
import IconFactory from '../../base/IconFactory';
const { ccclass, property } = _decorator;

@ccclass('CityBattleView')
export class CityBattleView extends UIView {
    static className: string = "CityBattleView"
    delegate: CityBattleViewController
    protected static prefabUrl: string = "ui/cityBattle/CityBattle"

    private _close: Node = null
    private _map: Node = null;
    private _mapDi: Node = null
    private _cityItem: Node = null
    private _teamItem: Node = null
    private _checkNode: Node = null
    onLoad() {
        this._close = find("close/close", this.node)
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })

        this._map = find("scrollView/view/content/map/content", this.node)
        this._mapDi = find("scrollView/view/content/map/bg", this.node)
        this._mapDi.on(Node.EventType.TOUCH_START, () => {
            if (this._checkNode.isValid && this._checkNode.active) {
                this._checkNode.active = false
            }
        }, this._mapDi)
        this._cityItem = this.node.getChildByName("cityItem");
        this._cityItem.active = false
        this._teamItem = this.node.getChildByName("teamItem");
        this._teamItem.active = false
        this._checkNode = this.node.getChildByName("checkNode")
        this._checkNode.active = false
    }

    updateCheckNode() {
        //根据副本id来确定解锁没 后续添加
        let _unlockable = this._checkNode.getChildByName("unlockable")
        _unlockable.active = false
        let _unlock = this._checkNode.getChildByName("unlock")
        _unlock.active = true
        //没解锁查看
        let _unlockableCheck = _unlockable.getChildByName("check");
        this.registbuttonClick(_unlockableCheck, () => {
            this.delegate.openInfoHandler()
        })
        //解锁查看
        let _unlockCheck = _unlock.getChildByName("check");
        this.registbuttonClick(_unlockCheck, () => {
            this.delegate.openInfoHandler()
        })
        //攻城
        let _unlocksiege = _unlock.getChildByName("siege");
        this.registbuttonClick(_unlocksiege, () => {
            this.delegate.siegeHandler()
        })
        //政务
        let _unlockGovernment = _unlock.getChildByName("government");
        this.registbuttonClick(_unlockGovernment, () => {
            this.delegate.governmentHandler()
        })
        //防守
        let _unlockDefense = _unlock.getChildByName("defense");
        this.registbuttonClick(_unlockDefense, () => {

        })

        //宣战
        let _declarationWar = _unlock.getChildByName("declarationWar");
        _declarationWar.active = false
        this.registbuttonClick(_declarationWar, () => {

        })



    }

    updateView() {
        let citys: City[] = this.delegate.ciryBattleModel.getAllCitys()
        for (let index = 0; index < citys.length; index++) {
            let _city: City = citys[index]
            let _item = this._map.getChildByName(`item${index}`);
            if (!_item) {
                _item = instantiate(this._cityItem);
                _item.name = `item${index}`
                this._map.addChild(_item);
            }
            _item.active = true;
            let posCof: string = _city.getCityPosition()
            let posArr = posCof.split(",")
            _item.x = Number(posArr[0]);
            _item.y = Number(posArr[1]);
            //name
            let _name = _item.getChildByName("name");
            _name.getComponent(Label).string = _city.getName()
            //id
            let _id = _item.getChildByName("id")
            _id.getComponent(Label).string = `${_city.getId()}`
            //legion
            let _legion = _item.getChildByName("legion");
            _legion.destroyAllChildren();
            let legionBaseInfo = _city.getLegionBaseInfo()
            _legion.active = legionBaseInfo ? true : false
            if (legionBaseInfo) {
                let _legionIcon = IconFactory.createLegionIcon(legionBaseInfo.flagId, legionBaseInfo.banner, this.delegate)
                _legion.addChild(_legionIcon)
            }
            //lockState
            let _lockState = _city.getLockState();
            let _lock = _item.getChildByName("lock");
            _lock.active = _lockState == cityLockState.lock
            this.registbuttonClick(_item, () => {
                if (_lockState == cityLockState.lock) {
                    EventManager.emit(SHOWTIPS, "城池未解锁")
                    return
                }
                // 将该节点本地坐标转换到世界坐标（即该节点中心/锚点在世界中的位置）
                const uiTransform = _item.getComponent(UITransform);
                let worldPos = uiTransform.convertToWorldSpaceAR(new Vec3(0, 0, 0));
                // 2. 将世界坐标转换到目标根节点的本地坐标
                const rootUITrans = this.node.getComponent(UITransform);
                const localPos = rootUITrans.convertToNodeSpaceAR(worldPos);
                this.delegate.checkCity = _city
                this._checkNode.active = true;
                this._checkNode.x = localPos.x;
                this._checkNode.y = localPos.y
                this.updateCheckNode()
            })

            //battleResult
            let _battleResult = _item.getChildByName("battleResult");
            _battleResult.active = false

            //vs
            let _vs = _item.getChildByName("vs")
            let _state = _city.getCityState()
            let vsState = _state == cityState.fighting || _state == cityState.declaring
            _vs.active = vsState
            if (vsState) {
                let _atkCount = _vs.getChildByName("atkCount");
                _atkCount.getComponent(Label).string = `${_city.getAttackCount()}`
                let _defCount = _vs.getChildByName("defCount");
                _defCount.getComponent(Label).string = `${_city.getDefendCount()}`
                let _defenseCount = _vs.getChildByName("defenseCount");
                _defenseCount.getComponent(Label).string = `${_city.getCityGarrisonCount()}`
            }

            //战斗
            let battleInfos = _city.getBattleInfo()
            let _battle = _item.getChildByName("battle");
            _battle.active = battleInfos.length > 0
            if (battleInfos.length > 0) {
                _battle.children.forEach((node) => {
                    node.active = false
                })
                for (let index = 0; index < battleInfos.length; index++) {
                    let _team = _battle.getChildByName(`team${index + 1}`)
                    _team.destroyAllChildren()
                    _team.active = true
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
                    this.registbuttonClick(_team, () => {
                        this.delegate.cityBattleInfoHandler(_city)
                    })
                    for (let heroIndex = 0; heroIndex < heroIds.length; heroIndex++) {
                        let _itemTeam = instantiate(this._teamItem);
                        _itemTeam.active = true;
                        _team.addChild(_itemTeam)
                        _itemTeam.x = heroIndex * 20
                        //name
                        let _itemName = _itemTeam.getChildByName("name");
                        _itemName.getComponent(Label).string = heroIds[heroIndex]
                    }
                }
            }
        }
    }
}


