import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import { HeroAttView } from '../view/HeroAttView';
import UIView from '../../../frameWork/ui/UIView';
import { HeroModel } from '../model/HeroModel';
import Hero from '../model/Hero';
const { ccclass, property } = _decorator;

@ccclass('HeroAttViewController')
export class HeroAttViewController extends ViewController {
    static className: string = "HeroAttViewController"
    viewClass: (typeof UIView) = HeroAttView
    viewMode = viewMode.PANEL

    heroModel: HeroModel = <HeroModel>HeroModel.getInstance();
    heroVo: Hero = null

    viewDidShow(rag?: any): void {
        this.heroVo = this.heroModel.getHero(this.heroModel.getSelectHeroId())
        this.viewDoAction("updateView")
    }
}


