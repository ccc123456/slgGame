import { _decorator, instantiate, Label, Node } from 'cc';
import BaseUI from '../../../frameWork/ui/BaseUI';
import { HeroViewController } from '../controller/HeroViewController';
import Hero, { heroActivateItem } from '../model/Hero';
import { HeroModel } from '../model/HeroModel';
import IconFactory from '../../base/IconFactory';
import { BagModel } from '../../bag/mode/BagModel';
const { ccclass, property } = _decorator;

@ccclass('HeroListItem')
export class HeroListItemView extends BaseUI {
    delegate: HeroViewController

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

    initView(_delegate) {
        this.delegate = _delegate
    }

    updateView(heroId: string) {
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
            this.delegate.activateHandler(heroId)
        })
    }
}


