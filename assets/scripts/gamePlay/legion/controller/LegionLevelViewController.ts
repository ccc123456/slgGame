import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { LegionLevelView } from '../view/LegionLevelView';
import { LegionModel } from '../model/LegionModel';
import { LegionInfo } from 'db://assets/resource/proto/structure';
import EventManager from '../../../frameWork/manager/EventManager';
import { LEGIN_UP_SUCCESS } from '../../../GameConfig';
const { ccclass, property } = _decorator;

@ccclass('LegionLevelViewController')
export class LegionLevelViewController extends ViewController {
    static className: string = "LegionLevelViewController"
    viewClass: (typeof UIView) = LegionLevelView
    viewMode = viewMode.PANEL

    legionModel: LegionModel = <LegionModel>LegionModel.getInstance();
    legionInfo: LegionInfo = null

    viewDidShow(rag?: any): void {
        this.updateView()
    }

    updateView() {
        this.legionInfo = this.legionModel.getOwnLegionInfo()
        this.viewDoAction("updateView")
    }

    upHandler() {
        this.legionModel.upLegion(this.legionInfo.legionId, () => {
            this.updateView()
            EventManager.emit(LEGIN_UP_SUCCESS)
        })
    }
}


