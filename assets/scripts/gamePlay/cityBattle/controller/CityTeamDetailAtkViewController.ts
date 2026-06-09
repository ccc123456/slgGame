import { _decorator, Component, Node } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { CityTeamDetailAtkView } from '../view/CityTeamDetailAtkView';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import { BattleUnit } from 'db://assets/resource/proto/structure';
const { ccclass, property } = _decorator;

@ccclass('CityTeamDetailAtkViewController')
export class CityTeamDetailAtkViewController extends ViewController {
    static className: string = "CityTeamDetailAtkViewController"
    viewClass: (typeof UIView) = CityTeamDetailAtkView
    viewMode = viewMode.PANEL

    battleUnit: BattleUnit = null

    viewDidLoad(): void {
        this.battleUnit = this.args.battleUnit
    }

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }
}


