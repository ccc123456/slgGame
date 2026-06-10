import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { CityTeamDetailAtkViewController } from '../controller/CityTeamDetailAtkViewController';
import { CityTeamDetailItemView } from './CityTeamDetailItemView';
const { ccclass, property } = _decorator;

@ccclass('CityTeamDetailAtkView')
export class CityTeamDetailAtkView extends UIView {
    static className: string = "CityTeamDetailAtkView"
    delegate: CityTeamDetailAtkViewController
    protected static prefabUrl: string = "ui/cityBattle/CityTeamDetailAtk"

    @property(Prefab)
    detailItem: Prefab = null;

    private _close: Node;
    private _atk: Node;

    onLoad(): void {
        let _bg = this.node.getChildByName("bg");
        this.registbuttonClick(_bg, () => {
            this.delegate.close()
        })
        this._close = this.node.getChildByName("close")
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })
        this._atk = this.node.getChildByName("atk")
    }

    updateView() {
        this._atk.destroyAllChildren();
        let _atkItem = instantiate(this.detailItem);
        _atkItem.active = true;
        this._atk.addChild(_atkItem)
        let _atkItemSc: CityTeamDetailItemView = _atkItem.getComponent(CityTeamDetailItemView)
        _atkItemSc.updateView(this.delegate.titleStr, this.delegate.battleUnit)
    }

}


