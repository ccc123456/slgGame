import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { CityTeamDetailView } from '../view/CityTeamDetailView';
import { BattleInfo } from 'db://assets/resource/proto/structure';
const { ccclass, property } = _decorator;

@ccclass('CityTeamDetailViewController')
export class CityTeamDetailViewController extends ViewController {
    static className: string = "CityTeamDetailViewController"
    viewClass: (typeof UIView) = CityTeamDetailView
    viewMode = viewMode.PANEL

    battleInfo: BattleInfo = null

    viewDidLoad(): void {
        this.battleInfo = this.args.battleInfo
    }

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }
}


