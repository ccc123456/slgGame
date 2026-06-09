import { _decorator, Component, find, instantiate, Label, Node } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { HeroStarSuccessViewController } from '../controller/HeroStarSuccessViewController';
import Hero from '../model/Hero';
import DataReader from '../../../frameWork/data/DataReader';
const { ccclass, property } = _decorator;

@ccclass('HeroStarSuccessView')
export class HeroStarSuccessView extends UIView {
    static className: string = "HeroStarSuccessView"
    delegate: HeroStarSuccessViewController
    protected static prefabUrl: string = "ui/hero/HeroStarSuccess"

    private showAtt: Node = null;
    private showAttItem: Node = null
    private curStar: Node = null;
    private beforStar: Node = null;
    private starItem: Node = null;
    onLoad() {
        super.onLoad();
        this.registbuttonClick(this.node, () => {
            this.delegate.close()
        })
        this.showAtt = this.node.getChildByName("showAtt");
        this.showAttItem = this.node.getChildByName("showItem")
        this.showAttItem.active = false
        this.beforStar = find("star/beforStar", this.node)
        this.curStar = find("star/curStar", this.node)
        this.starItem = this.node.getChildByName("starItem")
        this.starItem.active = false
    }

    updateView() {

        let heroId = this.delegate.heroModel.getSelectHeroId();
        let heroVo: Hero = this.delegate.heroModel.getHero(heroId);
        let atts = heroVo.getStarSuccessShowAtts();
        for (let index = 0; index < atts.length; index++) {
            let attItem = this.showAtt.getChildByName(`item${index}`);
            if (!attItem) {
                attItem = instantiate(this.showAttItem);
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
            let _endValue = attItem.getChildByName("endValue");
            _endValue.getComponent(Label).string = `${atts[index].endAttValue}`
        }


        let star = heroVo.getStar();
        this.updateStar(this.curStar, star)
        this.updateStar(this.beforStar, star - 1)

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


