import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { LegionCreateView } from '../view/LegionCreateView';
import { LegionModel } from '../model/LegionModel';
const { ccclass, property } = _decorator;

@ccclass('LegionCreateViewController')
export class LegionCreateViewController extends ViewController {
    static className: string = "LegionCreateViewController"
    viewClass: (typeof UIView) = LegionCreateView
    viewMode = viewMode.PANEL

    legionModel: LegionModel = <LegionModel>LegionModel.getInstance()
    flagIndex: number = 1
    createCallBack: Function = null

    viewDidShow(rag?: any): void {
        this.flagIndex = 1
        this.createCallBack = this.args.createCallBack
        this.viewDoAction("updateView")
    }

    createHandler(nameStr: string, bannerStr: string) {
        this.legionModel.createLegion(nameStr, bannerStr, this.flagIndex, () => {
            this.close()
            this.createCallBack && this.createCallBack()
        })
    }
}


