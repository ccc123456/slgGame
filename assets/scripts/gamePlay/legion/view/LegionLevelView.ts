import { _decorator, Component, instantiate, Label, Node } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { LegionLevelViewController } from '../controller/LegionLevelViewController';
import DataReader from '../../../frameWork/data/DataReader';
import Strings from '../../../frameWork/data/Strings';
const { ccclass, property } = _decorator;

@ccclass('LegionLevelView')
export class LegionLevelView extends UIView {
    static className: string = "LegionLevelView"
    delegate: LegionLevelViewController
    protected static prefabUrl: string = "ui/legion/LegionLevel"

    private _level: Node = null;
    private _levelCost: Node = null;
    private _changeNode: Node = null;
    private _changeItem: Node = null;
    private _upNode: Node = null

    onLoad(): void {
        let _bg = this.node.getChildByName("bg")
        this.registbuttonClick(_bg, () => {
            this.delegate.close()
        })
        this._level = this.node.getChildByName("level");
        this._levelCost = this.node.getChildByName("levelCost")
        this._changeNode = this.node.getChildByName("changeNode")
        this._changeItem = this.node.getChildByName("changItem");
        this._changeItem.active = false
        this._upNode = this.node.getChildByName("upNode");
        this.registbuttonClick(this._upNode, () => {
            this.delegate.upHandler()
        })
    }

    updateView() {
        //level
        let legionLv = this.delegate.legionInfo.level
        this._level.getComponent(Label).string = `${legionLv}`
        //levelCost
        let curCount = this.delegate.legionInfo.militaryFund
        let nextLvConfig = DataReader.requireRecordById("factionLv", `${legionLv + 1}`)
        let isMax = nextLvConfig ? false : true
        let curCoiuntRu = Strings.curentShowRule(Number(curCount))
        let nextCoiuntRu = nextLvConfig ? Strings.curentShowRule(Number(nextLvConfig.upCost)) : 0
        let costStr = isMax ? "满级" : `${curCoiuntRu}/${nextCoiuntRu}`
        this._levelCost.getComponent(Label).string = costStr
        //change
        this._changeNode.children.forEach((node) => {
            node.active = false
        })
        let showChangeStrs: string[] = ['lv', 'perNum', 'duCityNum', 'xianCityNum', 'checkpoint', 'declareWar']
        let curLvConfig = DataReader.requireRecordById("factionLv", `${legionLv}`)
        for (let index = 0; index < showChangeStrs.length; index++) {
            let _item = this._changeNode.getChildByName(`item${index}`);
            if (!_item) {
                _item = instantiate(this._changeItem);
                _item.name = `item${index}`
                this._changeNode.addChild(_item);
            }
            _item.active = true
            let _curValue = _item.getChildByName("curValue")
            let _jian = _item.getChildByName("jian")
            let _nextValue = _item.getChildByName("nextValue")
            let configStr = showChangeStrs[index]
            _curValue.getComponent(Label).string = curLvConfig[configStr];
            _jian.active = !isMax;
            _nextValue.active = !isMax;
            if (!isMax) {
                _nextValue.getComponent(Label).string = nextLvConfig[configStr];
            }

        }
    }
}


