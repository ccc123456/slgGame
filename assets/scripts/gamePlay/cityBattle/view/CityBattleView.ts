import { _decorator, Component, find, instantiate, Label, Node, Tween, tween, UITransform, Vec3 } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { CityBattleViewController } from '../controller/CityBattleViewController';
import DataReader from '../../../frameWork/data/DataReader';
import City, { cityLockState, cityState } from '../mode/City';
import EventManager from '../../../frameWork/manager/EventManager';
import { SHOWTIPS } from '../../../GameConfig';
import { BattleInfo, BattleUnit, LegionMemberInfo } from 'db://assets/resource/proto/structure';
import IconFactory from '../../base/IconFactory';
import { LegionPermissions } from '../../legion/model/LegionModel';
import { TeamBtnState } from '../../team/model/TeamModel';
import { BattleSide } from 'db://assets/resource/proto/enum';
import TimeFactory from '../../base/TimeFactory';
import { nodeCreateTween } from '../../../frameWork/utils/CommonUtils';
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
    private _battleResult: Node = null
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
                this.delegate.checkCity = null
            }
        }, this._mapDi)
        this._cityItem = this.node.getChildByName("cityItem");
        this._cityItem.active = false
        this._teamItem = this.node.getChildByName("teamItem");
        this._teamItem.active = false
        this._checkNode = this.node.getChildByName("checkNode")
        this._checkNode.active = false
        this._battleResult = this.node.getChildByName("battleResult")
        this._battleResult.active = false
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
        let isCaptial = this.delegate.checkCity.getTypeIsCapital()

        //解锁查看
        let _unlockCheck = _unlock.getChildByName("check");
        this.registbuttonClick(_unlockCheck, () => {
            this.delegate.openInfoHandler()
        })
        //攻城 不是都城并且不是自己联盟下的城池显示攻城
        //城池所属联盟
        let ownerLegionInfo = this.delegate.checkCity.getLegionBaseInfo();
        //城池宣战联盟
        let declaringLegionInfo = this.delegate.checkCity.getDeclaringLegionInfo()
        //当前城池状态
        let _cityState = this.delegate.checkCity.getCityState()
        //自己所在联盟id
        let curLegionId = this.delegate.legionModel.getLegionMemberId()
        //城池类型
        let cityType = this.delegate.checkCity.getCityType()
        let hideAtkAll = cityType == 4  //皇宫不显示进攻防守等按钮 只显示查看

        //进攻
        let isShowAtk = !hideAtkAll;
        if (isCaptial) {
            //都城进攻按钮 在和平和免战状态下不显示
            if (_cityState == cityState.peace || _cityState == cityState.immune) {
                isShowAtk = false
            }
        } else {
            //自己的联盟的城池 不显示进攻按钮
            if (ownerLegionInfo && ownerLegionInfo.legionId == curLegionId) {
                isShowAtk = false
            }
        }
        let _unlocksiege = _unlock.getChildByName("siege");
        _unlocksiege.active = isShowAtk
        this.registbuttonClick(_unlocksiege, () => {
            this.delegate.siegeHandler(TeamBtnState.citySiege)
        })
        //政务
        let isShowGovernment = !hideAtkAll;
        let _unlockGovernment = _unlock.getChildByName("government");
        _unlockGovernment.active = isShowGovernment
        this.registbuttonClick(_unlockGovernment, () => {
            this.delegate.governmentHandler()
        })
        //防守 所有城池都有防守
        let isShowDefense = !hideAtkAll;
        if (isCaptial) {
            //都城防守按钮 在和平和免战状态下不显示
            if (_cityState == cityState.peace || _cityState == cityState.immune) {
                isShowDefense = false
            }
        }
        let _unlockDefense = _unlock.getChildByName("defense");
        _unlockDefense.active = isShowDefense
        this.registbuttonClick(_unlockDefense, () => {
            this.delegate.siegeHandler(TeamBtnState.cityDefence)
        })

        //宣战  都城&联盟权限有宣战&城池状态和平
        let isShowDeclar = false;
        //权限
        let legionMemberInfo: LegionMemberInfo = this.delegate.legionModel.getLegionMemberInfo()
        let isDeclar: boolean = false;
        if (legionMemberInfo && legionMemberInfo.legionId) {
            let posId = legionMemberInfo.position
            let factionConfig = DataReader.requireRecordById("factionPermission", `${posId}`)
            let permissions = factionConfig.Permissions;
            let permisArr: string[] = permissions.split(",");
            let poIndex = permisArr.indexOf(`${LegionPermissions.declarationWar}`)
            isDeclar = poIndex != -1
        }
        isShowDeclar = isCaptial && isDeclar && _cityState == cityState.peace
        let _declarationWar = _unlock.getChildByName("declarationWar");
        _declarationWar.active = isShowDeclar
        this.registbuttonClick(_declarationWar, () => {
            this.delegate.declaraHandler()
        })
    }

    updateView() {
        let citys: City[] = this.delegate.ciryBattleModel.getAllCitys()
        for (let index = 0; index < citys.length; index++) {
            let _city: City = citys[index]
            let _item = this._map.getChildByName(`item${_city.getId()}`);
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

            //endTip
            let _endTIp = _item.getChildByName("endTip");
            let atkEmCount = _city.getAttackEmptyCountdown()
            _endTIp.active = atkEmCount > 0
            Tween.stopAllByTarget(_endTIp)
            if (atkEmCount > 0) {
                let setTipCout = (_count) => {
                    _endTIp.getComponent(Label).string = `${_count}秒内无人进攻，则防守方胜利`
                }
                nodeCreateTween(_endTIp, 1, setTipCout, atkEmCount, 1, () => {
                    _endTIp.active = false
                })
            }

            //免战
            let _state = _city.getCityState()
            let _freeWar = _item.getChildByName("freeWar");
            _freeWar.active = _state == cityState.immune
            Tween.stopAllByTarget(_freeWar)
            if (_state == cityState.immune) {
                let statusChangeTime = _city.getStatusChangeTime()
                let curTime = Date.now()
                let chagneTime = curTime - Number(statusChangeTime)
                let allSecondConfig = DataReader.requireRecordById("CityParameter", "2")
                let allSecond = allSecondConfig.value
                let costSecond = TimeFactory.getSecondStr(chagneTime)
                let changeSecond = allSecond - costSecond
                let setChangeTime = (_count) => {
                    let timeStr = TimeFactory.getTimeStrSecond(Number(_count))
                    _freeWar.getComponent(Label).string = `免战中${timeStr}`
                }
                nodeCreateTween(_freeWar, 1, setChangeTime, changeSecond, 1, () => {
                    _freeWar.active = false
                })
            }

            //vs
            let _vs = _item.getChildByName("vs")
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
                        if (heroState[0]) {
                            let heroId = heroState[0].heroId;
                            heroIds.push(`${heroId}`)
                        }
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

    updateResult() {
        if (this.delegate.battleResult) {
            let _city = this.delegate.battleResult.cityInfo
            let _cityId = _city && _city.cityId;
            if (_cityId) {
                let _item = this._map.getChildByName(`item${_cityId}`);
                if (_item && _item.isValid) {
                    let _itemResult = _item.getChildByName("result");
                    if (!_itemResult) {
                        _itemResult = instantiate(this._battleResult)
                        _itemResult.name = "result";
                        _item.addChild(_itemResult)
                    }
                    _itemResult.active = true
                    _itemResult.y = -_item.getComponent(UITransform).height / 2
                    //更新胜利显示文字
                    let showText: string = ''
                    let battleSide: BattleSide = this.delegate.battleResult.battleSide
                    //1 进攻胜利 2 防守胜利
                    let winnerSize = this.delegate.battleResult.winnerSize
                    switch (battleSide) {
                        case BattleSide.attack:
                            showText = winnerSize == 1 ? "进攻胜利" : "进攻失败"
                            break;
                        case BattleSide.defend:
                            showText = winnerSize == 2 ? "防守胜利" : "防守失败"
                            break;
                        case BattleSide.watch:
                            showText = winnerSize == 1 ? "胜利" : "失败"
                            break;
                    }
                    let _state = _itemResult.getChildByName("state");
                    _state.getComponent(Label).string = showText

                    let setChangeTime = (_count) => {
                    }
                    nodeCreateTween(_itemResult, 1, setChangeTime, 10, 1, () => {
                        if (_itemResult && _itemResult.isValid) {
                            _itemResult.active = false
                        }
                    })
                }
            }

        }
    }
}


