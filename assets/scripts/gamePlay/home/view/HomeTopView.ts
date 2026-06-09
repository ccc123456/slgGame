
import { _decorator, Label, Node } from 'cc';
import BaseUI from '../../../frameWork/ui/BaseUI';
import { HomeViewController } from "../controller/HomeViewController";
const { ccclass, property } = _decorator;

@ccclass('HomeTopView')
export class HomeTopView extends BaseUI {
    static className: string = "HomeTopView"
    delegate: HomeViewController
    protected static prefabUrl: string = "ui/home/HomeTop"

    private _head: Node = null
    private _playername: Node = null

    onLoad() {
        super.onLoad()
        this._head = this.node.getChildByName("head");
        this._playername = this.node.getChildByName("name")
    }

    initview(_delegate: HomeViewController) {
        this.delegate = _delegate

    }

    updateView() {
        this._playername.getComponent(Label).string = this.delegate.playerModel.getName()
    }
}


