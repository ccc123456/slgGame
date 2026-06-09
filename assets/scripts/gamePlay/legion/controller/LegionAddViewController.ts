import { _decorator } from 'cc';
import { LegionListInfo } from 'db://assets/resource/proto/structure';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import PlayerModel from '../../home/mode/PlayerModel';
import { LegionModel } from '../model/LegionModel';
import { LegionAddView } from '../view/LegionAddView';
import { LegionCreateViewController } from './LegionCreateViewController';
import { LegionViewController } from './LegionViewController';
const { ccclass, property } = _decorator;

@ccclass('LegionAddViewController')
export class LegionAddViewController extends ViewController {
    static className: string = "LegionAddViewController"
    viewClass: (typeof UIView) = LegionAddView
    viewMode = viewMode.PANEL

    legionModel: LegionModel = <LegionModel>LegionModel.getInstance();
    legionIds: LegionListInfo[] = []

    viewDidShow(rag?: any): void {
        this.legionIds = this.legionModel.getLegionList()
        this.viewDoAction("updateView")
    }

    searchHandler(legionName: string, callBack: Function) {

    }

    createHandler() {
        this.pushController(LegionCreateViewController, {
            createCallBack: () => {
                this.close()
            }
        })
    }

    applyHandler(legionId: string, callBack: Function) {
        this.legionModel.applyLegion(legionId, () => {
            let playerModel: PlayerModel = <PlayerModel>PlayerModel.getInstance();
            let legionId = playerModel.getLegionId();
            if (legionId) {
                this.pushController(LegionViewController)
            } else {
                callBack && callBack()
            }
        })
    }
}


