import { _decorator, Label, Animation, Node, UIOpacity } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { TipViewController } from '../controller/TipViewController';
const { ccclass, property } = _decorator;

@ccclass('TipView')
export class TipView extends UIView {
    static className: string = "TipView"
    protected static prefabUrl: string = "ui/common/Tip";
    delegate: TipViewController

    private _aniNode: Node = null
    private _tipStr: Label = null

    onLoad() {
        this._aniNode = this.node.getChildByName("aniNode")
        this._aniNode.getComponent(UIOpacity).opacity = 0;
        this._aniNode.y = -200;
        this._tipStr = this._aniNode.getChildByName("tip").getComponent(Label)
    }


    showTips(str: string) {
        this._tipStr.string = str
        this._aniNode.getComponent(Animation).play('tipAni')
    }
}


