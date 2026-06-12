import { _decorator, instantiate, Label, Node } from 'cc';
import ViewController from '../../../frameWork/controller/ViewController';
import BaseUI from '../../../frameWork/ui/BaseUI';
import { BagModel } from '../../bag/mode/BagModel';
import IconFactory from '../../base/IconFactory';
import Hero, { heroActivateItem } from '../model/Hero';
import { HeroModel } from '../model/HeroModel';
import { HeroViewController } from '../controller/HeroViewController';
import { HeroDeadInfo } from 'db://assets/resource/proto/MessageCity';
import DataReader from '../../../frameWork/data/DataReader';
import { getItemConfigCount } from '../../../frameWork/utils/CommonUtils';
import { TeamViewController } from '../../team/controller/TeamViewController';
const { ccclass, property } = _decorator;

@ccclass('HeroListItem')
export class HeroListItemView extends BaseUI {
    delegate: ViewController

    @property(Node)
    icon: Node = null;

    @property(Node)
    lvLab: Node = null;

    @property(Node)
    nameLab: Node = null;

    @property(Node)
    campLab: Node = null;

    @property(Node)
    typeLab: Node = null;

    @property(Node)
    star: Node = null;

    @property(Node)
    starItem: Node = null;

    @property(Node)
    noGet: Node = null;

    @property(Node)
    activate: Node = null;

    @property(Node)
    activateBtn: Node = null;

    @property(Node)
    dispatchCity: Node = null;

    @property(Node)
    healInjured: Node = null;

    @property(Node)
    healInjuredBtn: Node = null;

    initView(_delegate: ViewController) {
        this.delegate = _delegate
    }

    updateView(viewData: { heroId: string, team?: boolean, deadHeroId?: HeroDeadInfo[] }) {
        let heroId = viewData.heroId
        let heroModel: HeroModel = <HeroModel>HeroModel.getInstance()
        let bagModel: BagModel = <BagModel>BagModel.getInstance()
        let heroVo: Hero = heroModel.getHero(heroId)
        let isGetHero = heroVo ? true : false
        this.noGet.active = heroVo ? false : true
        this.lvLab.active = heroVo ? true : false
        if (!heroVo) {
            heroVo = new Hero(heroId)
        }
        this.lvLab.active = isGetHero
        let needAc: heroActivateItem = heroVo.getAtivateNeedCount()
        let itemId = needAc.itemId;
        let bagCount = bagModel.getCountByConfigId(itemId)
        let itemEnough = bagCount >= needAc.itemCount
        this.noGet.active = !isGetHero && !itemEnough
        this.activate.active = !isGetHero && itemEnough

        //icon
        let iconPath = heroVo.getListIconPath()
        IconFactory.decorateNodeWithSpriteFrame(iconPath, this.icon, this)
        //name
        this.nameLab.getComponent(Label).string = heroVo.getName()
        //等级
        if (isGetHero) {
            this.lvLab.getComponent(Label).string = heroVo.getLevel() + ''
        }
        //camp
        this.campLab.getComponent(Label).string = heroVo.getCampName()
        //job
        this.typeLab.getComponent(Label).string = heroVo.getJobName()
        //star
        this.star.children.forEach((node) => {
            node.active = false
        })
        let heroStarNu = heroVo.getStar();
        for (let index = 0; index < heroStarNu; index++) {
            let _item = this.star.getChildByName(`star${index}`);
            if (!_item) {
                _item = instantiate(this.starItem);
                _item.name = `star${index}`;
                this.star.addChild(_item)
            }
            _item.active = true
        }
        this.registbuttonClick(this.activateBtn, () => {
            let heroDe: HeroViewController = <HeroViewController>this.delegate
            heroDe.activateHandler(heroId)
        })
        this.dispatchCity.active = false
        this.healInjured.active = false
        if (viewData.team) {
            this.dispatchCity.active = heroVo.getDispatchToCityId() ? true : false
            //复活
            this.updateHealinjured(viewData, heroId)
        }
        this.registbuttonClick(this.healInjuredBtn, () => {
            let teamDe: TeamViewController = <TeamViewController>this.delegate
            let heroIds: number[] = [];
            heroIds.push(Number(heroId))
            teamDe.HealinjuredHandler(heroIds, () => {
                this.healInjured.active = false
            })
        })
    }

    updateHealinjured(viewData, heroId) {
        let isDead = false;
        let healCount = 0;
        if (viewData.deadHeroId) {
            for (let index = 0; index < viewData.deadHeroId.length; index++) {
                if (viewData.deadHeroId[index].heroTableId == Number(heroId)) {
                    isDead = true
                    healCount = viewData.deadHeroId[index].healTimes
                }
            }
        }
        this.healInjured.active = isDead
        if (isDead) {
            let allSecondConfig = DataReader.requireRecordById("CityParameter", "4")
            let costStr = allSecondConfig.value
            let costConfigC = getItemConfigCount(costStr);
            //name
            let _name = this.healInjured.getChildByName("itemName");
            _name.getComponent(Label).string = costConfigC.config.name
            //coun
            let bagModel: BagModel = BagModel.getInstance() as BagModel
            let _curCount = bagModel.getCountByConfigId(costConfigC.configId)
            let needCont = costConfigC.count
            let _count = this.healInjured.getChildByName("itemCount");
            _count.getComponent(Label).string = `${_curCount}/${needCont}`
            //复活次数
            let healInjuredCount = this.healInjured.getChildByName("healInjuredCount")
            let allSecondConfigf = DataReader.requireRecordById("CityParameter", "3")
            let allHeaCount = allSecondConfigf.value
            healInjuredCount.getComponent(Label).string = `${healCount}/${allHeaCount}`
        }
    }
}


