import { _decorator } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import Hero from '../../hero/model/Hero';
import { HeroModel } from '../../hero/model/HeroModel';
import { TeamBtnState, teamBtnState } from '../model/TeamModel';
import { TeamView } from '../view/TeamView';
const { ccclass, property } = _decorator;

@ccclass('TeamViewController')
export class TeamViewController extends ViewController {
    static className: string = "TeamViewController"
    viewClass: (typeof UIView) = TeamView
    viewMode = viewMode.SCENE

    heroModel: HeroModel = <HeroModel>HeroModel.getInstance()
    heros: Hero[] = []
    teamHeroIds: string[] = []
    teamBtnState: TeamBtnState = TeamBtnState.citySiege

    viewDidLoad(): void {
        this.heros = this.heroModel.getHeros()
    }

    viewDidShow(rag?: any): void {
        this.teamBtnState = this.args.btnState
        this.viewDoAction('updateView')
    }

    oneKeyHandler() {
        this.teamHeroIds = [];
        for (let index = 0; index < 5; index++) {
            if (this.heros[index]) {
                this.teamHeroIds.push(this.heros[index].getId())
            }
        }
        this.viewDoAction("updateTeam")
    }
}


