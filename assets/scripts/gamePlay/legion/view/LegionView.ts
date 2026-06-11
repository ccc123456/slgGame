import { _decorator, Component, find, Label, Node, ProgressBar, Vec3 } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { LegionViewController } from '../controller/LegionViewController';
import IconFactory from '../../base/IconFactory';
import DataReader from '../../../frameWork/data/DataReader';
import Strings from '../../../frameWork/data/Strings';
const { ccclass, property } = _decorator;

@ccclass('LegionView')
export class LegionView extends UIView {
    static className: string = "LegionView"
    delegate: LegionViewController
    protected static prefabUrl: string = "ui/legion/Legion"

    private _close: Node = null
    private _info: Node = null
    private _icon: Node = null;
    private _legionName: Node = null
    private _legionLevel: Node = null
    private _up: Node = null
    private _levelPro: Node = null
    private _levelCost: Node = null
    private _upNode: Node = null
    private _member: Node = null;

    onLoad() {
        this._close = find('close/close', this.node);
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })
        this._info = this.node.getChildByName("info")
        this._icon = this._info.getChildByName("icon")
        this._legionName = this._info.getChildByName("name")
        this._legionLevel = this._info.getChildByName("level")
        this._up = this._info.getChildByName("up")
        this._levelPro = this._up.getChildByName("lvPro")
        this._levelCost = this._up.getChildByName("levelCost")
        this._upNode = this._up.getChildByName("upNode")
        this.registbuttonClick(this._upNode, () => {
            this.delegate.levelHandler()
        })
        this._member = this.node.getChildByName("member");
        this.registbuttonClick(this._member, () => {
            this.delegate.memberHandler()
        })
    }

    updateView() {
        //icon
        this._icon.destroyAllChildren();
        let _iconNode = IconFactory.createLegionIcon(this.delegate.legionInfo.flagId, this.delegate.legionInfo.banner, this.delegate)
        _iconNode.scale = new Vec3(2, 2, 2)
        this._icon.addChild(_iconNode)
        //name
        this._legionName.getComponent(Label).string = this.delegate.legionInfo.name
        this.updateLevel()
    }

    updateLevel() {
        //level
        let legionLv = this.delegate.legionInfo.level
        this._legionLevel.getComponent(Label).string = `${legionLv}`
        //pro
        let curCount = this.delegate.legionInfo.militaryFund
        let lvConfig = DataReader.requireRecordById("factionLv", `${legionLv + 1}`)
        let isMax = lvConfig ? false : true
        this._up.active = !isMax
        if (!isMax) {
            let allCount = lvConfig.upCost
            let _pro = Number(curCount) / allCount
            this._levelPro.getComponent(ProgressBar).progress = _pro
            let curCountRul = Strings.curentShowRule(Number(curCount))
            let allCountRul = Strings.curentShowRule(allCount)
            this._levelCost.getComponent(Label).string = `${curCountRul}/${allCountRul}`
        }
    }
}


