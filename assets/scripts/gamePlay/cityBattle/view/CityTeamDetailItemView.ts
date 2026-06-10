import { _decorator, Component, instantiate, Label, Node, ProgressBar, Sprite } from 'cc';
import BaseUI from '../../../frameWork/ui/BaseUI';
import { BattleUnit, HeroState } from 'db://assets/resource/proto/structure';
import DataReader from '../../../frameWork/data/DataReader';
import IconFactory from '../../base/IconFactory';
const { ccclass, property } = _decorator;

@ccclass('CityTeamDetailItemView')
export class CityTeamDetailItemView extends BaseUI {
    @property(Node)
    title: Node = null;
    @property(Node)
    clubName: Node = null;
    @property(Node)
    playerName: Node = null;
    @property(Node)
    power: Node = null;
    @property(Node)
    hp: Node = null;
    @property(Node)
    hpLab: Node = null;
    @property(Node)
    team: Node = null;
    @property(Node)
    teamItem: Node = null;

    updateView(titleStr: string, battleUnit: BattleUnit) {
        this.title.getComponent(Label).string = titleStr
        let isGarrison = battleUnit.isGarrison
        //clubName
        this.clubName.active = !isGarrison
        if (!isGarrison) {
            this.clubName.getComponent(Label).string = battleUnit.legionName
        }
        //playName
        this.playerName.getComponent(Label).string = isGarrison ? "城防军" : battleUnit.playerName
        //power
        this.power.getComponent(Label).string = `战斗力 ${battleUnit.totalPower}`
        //hp
        let heros: HeroState[] = battleUnit.hero
        let maxAllHp = 0;
        let curAllHp = 0
        for (let hpIndex = 0; hpIndex < heros.length; hpIndex++) {
            maxAllHp += Number(heros[hpIndex].maxHp)
            curAllHp += Number(heros[hpIndex].lastBattleHp)
        }
        let pro = curAllHp / maxAllHp
        this.hp.getComponent(ProgressBar).progress = curAllHp / maxAllHp
        this.hpLab.getComponent(Label).string = `${pro * 100}%`
        //hero
        this.team.destroyAllChildren();
        for (let index = 0; index < heros.length; index++) {
            let teamItem = instantiate(this.teamItem);
            teamItem.active = true;
            this.team.addChild(teamItem);
            let iconPath = ''
            if (isGarrison) {
                let iconName = `heroList${1}`
                iconPath = `hero/${iconName}`
            } else {
                let heroId = heros[0].heroId;
                let _config = DataReader.requireRecordById("Hero", `${heroId}`)
                let iconName = `heroList${_config.sex}`
                iconPath = `hero/${iconName}`
            }
            IconFactory.decorateNodeWithSpriteFrame(iconPath, teamItem, this, false, Sprite.SizeMode.CUSTOM)
        }
    }
}


