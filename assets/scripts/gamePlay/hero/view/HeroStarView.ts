import { _decorator, Component, instantiate, Label, Node, ProgressBar } from 'cc';
import BaseUI from '../../../frameWork/ui/BaseUI';
import { HeroCultivateViewController } from '../controller/HeroCultivateViewController';
import { HeroModel } from '../model/HeroModel';
import Hero, { starShowAtt } from '../model/Hero';
import DataReader from '../../../frameWork/data/DataReader';
import { BagModel } from '../../bag/mode/BagModel';
import EventManager from '../../../frameWork/manager/EventManager';
import { SHOWTIPS } from '../../../GameConfig';
const { ccclass, property } = _decorator;

@ccclass('HeroStarView')
export class HeroStarView extends BaseUI {
    @property(Node)
    starUp: Node = null;
    @property(Node)
    info: Node = null;
    @property(Node)
    itemName: Node = null;
    @property(Node)
    itemPro: Node = null;
    @property(Node)
    itemProlLab: Node = null;
    @property(Node)
    starJian: Node = null;
    @property(Node)
    curStar: Node = null;
    @property(Node)
    endStar: Node = null;
    @property(Node)
    starItem: Node = null;
    @property(Node)
    showAtt: Node = null;
    @property(Node)
    showItem: Node = null;


    delegate: HeroCultivateViewController
    private isEnough: boolean = false

    onLoad(): void {
        this.registbuttonClick(this.starUp, () => {
            // if (!this.isEnough) {
            //     EventManager.emit(SHOWTIPS, "武将经验不足")
            //     return
            // }
            this.delegate && this.delegate.starUpHandler()
        })
    }
    refreshView(_delegate?: HeroCultivateViewController) {
        this.delegate = _delegate || this.delegate
        let heroModel: HeroModel = <HeroModel>HeroModel.getInstance()
        let heroid = heroModel.getSelectHeroId()
        let heroVo: Hero = heroModel.getHero(heroid)
        let itemId = heroVo.getNeedSoul();
        let itemCofig = DataReader.requireRecordById("Item", itemId);
        let star = heroVo.getStar();
        let isMaxStr = heroVo.isMaxStar()
        this.info.active = !isMaxStr
        if (!isMaxStr) {
            //name
            this.itemName.getComponent(Label).string = itemCofig.name
            //count
            let bagModel: BagModel = <BagModel>BagModel.getInstance()
            let curCount = bagModel.getCountByConfigId(itemId);
            let needCount = heroVo.getStarNeedCount();
            this.itemPro.getComponent(ProgressBar).progress = curCount / needCount;
            this.itemProlLab.getComponent(Label).string = `${curCount}/${needCount}`
            this.isEnough = curCount >= needCount
        }

        //star
        this.updateStar(this.curStar, star)
        this.endStar.active = !isMaxStr
        this.starJian.active = !isMaxStr
        if (!isMaxStr) {
            this.updateStar(this.endStar, star + 1)
        }
        //att
        let atts: starShowAtt[] = heroVo.getStarShowAtts()
        for (let index = 0; index < atts.length; index++) {
            let attItem = this.showAtt.getChildByName(`item${index}`);
            if (!attItem) {
                attItem = instantiate(this.showItem);
                attItem.name = `item${index}`;
                this.showAtt.addChild(attItem)
            }
            attItem.active = true
            //name
            let attId = atts[index].attId;
            let attConfig = DataReader.requireRecordById("HeroProperty", attId)
            let _name = attItem.getChildByName("name");
            _name.getComponent(Label).string = attConfig.viewShow
            //value
            let _curValue = attItem.getChildByName("curValue");
            _curValue.getComponent(Label).string = `${atts[index].curAttValue}`
            let _jian = attItem.getChildByName("right");
            _jian.active = !isMaxStr
            let _endValue = attItem.getChildByName("endValue");
            _endValue.active = !isMaxStr
            if (!isMaxStr) {
                _endValue.getComponent(Label).string = `${atts[index].endAttValue}`
            }
        }


    }

    updateStar(starNode: Node, starNum: number) {
        starNode.children.forEach((node) => {
            node.active = false
        })
        for (let index = 0; index < starNum; index++) {
            let item = starNode.getChildByName(`star${index}`);
            if (!item) {
                item = instantiate(this.starItem);
                item.name = `star${index}`
                starNode.addChild(item)
            }
            item.active = true
        }
    }
}


