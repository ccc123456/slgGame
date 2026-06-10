import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { CityTeamDetailViewController } from '../controller/CityTeamDetailViewController';
import { CityTeamDetailItemView } from './CityTeamDetailItemView';
import { BattleUnit } from 'db://assets/resource/proto/structure';
const { ccclass, property } = _decorator;

@ccclass('CityTeamDetailView')
export class CityTeamDetailView extends UIView {
    static className: string = "CityTeamDetailView"
    delegate: CityTeamDetailViewController
    protected static prefabUrl: string = "ui/cityBattle/CityTeamDetail"

    @property(Prefab)
    detailItem: Prefab = null;

    private _close: Node;
    private _atk: Node;
    private _def: Node;
    private _checkBattle: Node;

    onLoad(): void {
        this._close = this.node.getChildByName("close")
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })
        this._atk = this.node.getChildByName("atk")
        this._def = this.node.getChildByName("def")
    }

    updateView() {
        this.updateItem(this._atk, this.delegate.battleInfo.attack)
        this.updateItem(this._def, this.delegate.battleInfo.defend)
    }

    updateItem(node: Node, battleUnit: BattleUnit) {
        node.destroyAllChildren();
        let _item = instantiate(this.detailItem);
        _item.active = true;
        node.addChild(_item)
        let _itemSc: CityTeamDetailItemView = _item.getComponent(CityTeamDetailItemView)
        _itemSc.updateView("进攻队伍", battleUnit)
    }
}


