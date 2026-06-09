import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { CityBattleView } from '../view/CityBattleView';
import { CityBattleMode } from '../mode/CityBattleMode';
const { ccclass, property } = _decorator;

@ccclass('CityBattleViewController')
export class CityBattleViewController extends ViewController {
    static className: string = "CityBattleViewController"
    viewClass: (typeof UIView) = CityBattleView
    viewMode = viewMode.SCENE

    ciryBattleModel: CityBattleMode = <CityBattleMode>CityBattleMode.getInstance()

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }
}


