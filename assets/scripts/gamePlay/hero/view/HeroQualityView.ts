import { _decorator, Component, find, instantiate, Label, Node } from 'cc';
import BaseUI from '../../../frameWork/ui/BaseUI';
import { HeroCultivateViewController } from '../controller/HeroCultivateViewController';
import { HeroModel } from '../model/HeroModel';
import Hero, { heroQuailtyState, qualityCost } from '../model/Hero';
import DataReader from '../../../frameWork/data/DataReader';
import { BagModel } from '../../bag/mode/BagModel';
const { ccclass, property } = _decorator;

@ccclass('HeroQualityView')
export class HeroQualityView extends BaseUI {
    @property(Node)
    content: Node = null;
    @property(Node)
    contentItem: Node = null;
    @property(Node)
    qualityBtn: Node = null;
    @property(Node)
    qualityBtnLab: Node = null;


    private qualtiyState: heroQuailtyState = heroQuailtyState.mop

    onLoad() {
        super.onLoad();
        this.registbuttonClick(this.qualityBtn, () => {
            switch (this.qualtiyState) {
                case heroQuailtyState.quality:
                    this.delegate && this.delegate.upQualityHandler()
                    break;
                case heroQuailtyState.train:
                    this.delegate && this.delegate.trainHandler()
                    break;
                case heroQuailtyState.mop:
                    this.delegate && this.delegate.mopHandler()
                    break;
            }
        })
    }


    refreshView(_delegate: HeroCultivateViewController) {
        this.delegate = _delegate
        let heroModel: HeroModel = <HeroModel>HeroModel.getInstance()
        let bagModel: BagModel = <BagModel>BagModel.getInstance()
        let heroid = heroModel.getSelectHeroId()
        let heroVo: Hero = heroModel.getHero(heroid)
        let costs = heroVo.getQualityCost()
        let itemCountEnough = false
        for (let index = 0; index < costs.length; index++) {
            let _item = this.content.getChildByName(`item${index}`);
            if (!_item) {
                _item = instantiate(this.contentItem);
                _item.name = `item${index}`;
                this.content.addChild(_item)
            }
            _item.active = true
            let costVo: qualityCost = costs[index]
            let itemCofig = DataReader.requireRecordById("Item", costVo.itemId)
            let curCount = bagModel.getCountByConfigId(costVo.itemId)
            //name
            let _name = _item.getChildByName("name");
            _name.getComponent(Label).string = itemCofig.name;
            //count
            let lvEnouth = heroVo.getLevel() >= costVo.needLv
            let _countNode = _item.getChildByName("count")
            _countNode.active = lvEnouth
            if (lvEnouth) {
                let _count = _countNode.getChildByName("count");
                let trainState = heroVo.getTarinStateByIndex(index + 1)
                _count.getComponent(Label).string = trainState ? "可进阶" : `${curCount}/${costVo.itemCount}`
            }
            //lock
            let _lock = _item.getChildByName("lock");
            _lock.active = !lvEnouth
            if (!lvEnouth) {
                let _lockTip = _lock.getChildByName("lockTip");
                _lockTip.getComponent(Label).string = `${costVo.needLv}级解锁`
            }
            if (curCount >= costVo.itemCount) {
                itemCountEnough = true
            }
        }
        //设置按钮状态
        let TrainState = heroVo.getTrainState();
        this.qualtiyState = TrainState ? heroQuailtyState.quality :
            itemCountEnough ? heroQuailtyState.train : heroQuailtyState.mop
        switch (this.qualtiyState) {
            case heroQuailtyState.quality:
                this.qualityBtnLab.getComponent(Label).string = "升阶"
                break;
            case heroQuailtyState.train:
                this.qualityBtnLab.getComponent(Label).string = "一键训练"
                break;
            case heroQuailtyState.mop:
                this.qualityBtnLab.getComponent(Label).string = "一键扫荡"
                break;
        }
    }
}


