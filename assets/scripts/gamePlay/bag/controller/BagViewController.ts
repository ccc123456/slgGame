import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { BagView } from '../view/BagView';
import { BagModel } from '../mode/BagModel';
const { ccclass, property } = _decorator;

@ccclass('BagViewController')
export class BagViewController extends ViewController {
    static className: string = "BagViewController"
    viewClass: (typeof UIView) = BagView
    viewMode = viewMode.SCENE

    bagModel: BagModel = <BagModel>BagModel.getInstance()

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }
}


