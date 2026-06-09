import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { CityInfoView } from '../view/CityInfoView';
import { CityBattleMode } from '../mode/CityBattleMode';
import City from '../mode/City';
const { ccclass, property } = _decorator;

@ccclass('CityInfoViewController')
export class CityInfoViewController extends ViewController {
    static className: string = "CityInfoViewController"
    viewClass: (typeof UIView) = CityInfoView
    viewMode = viewMode.PANEL

    cityBattleModel: CityBattleMode = <CityBattleMode>CityBattleMode.getInstance()
    cityVo: City = null

    viewDidLoad(): void {
        this.cityVo = this.args.cityVo
    }

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }
}


