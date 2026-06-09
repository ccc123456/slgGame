import { _decorator } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { LegionView } from '../view/LegionView';
import { LegionModel } from '../model/LegionModel';
import { LegionInfo } from 'db://assets/resource/proto/structure';
import { LegionLevelViewController } from './LegionLevelViewController';
const { ccclass, property } = _decorator;

@ccclass('LegionViewController')
export class LegionViewController extends ViewController {
    static className: string = "LegionViewController"
    viewClass: (typeof UIView) = LegionView
    viewMode = viewMode.SCENE

    legionModel: LegionModel = <LegionModel>LegionModel.getInstance();
    legionInfo: LegionInfo = null

    getMessageListeners(): {} {
        return {
            LEGIN_UP_SUCCESS: () => {
                this.legionInfo = this.legionModel.getOwnLegionInfo()
                this.viewDoAction("updateLevel")
            }
        }
    }

    viewDidShow(rag?: any): void {
        this.legionInfo = this.legionModel.getOwnLegionInfo()
        this.viewDoAction("updateView")
    }

    levelHandler() {
        this.pushController(LegionLevelViewController)
    }
}


