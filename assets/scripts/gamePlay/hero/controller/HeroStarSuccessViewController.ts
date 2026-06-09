import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { HeroStarSuccessView } from '../view/HeroStarSuccessView';
import { HeroModel } from '../model/HeroModel';
const { ccclass, property } = _decorator;

@ccclass('HeroStarSuccessViewController')
export class HeroStarSuccessViewController extends ViewController {
    static className: string = "HeroStarSuccessViewController"
    viewClass: (typeof UIView) = HeroStarSuccessView
    viewMode = viewMode.PANEL

    heroModel: HeroModel = <HeroModel>HeroModel.getInstance()

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }
}


