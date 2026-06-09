import { _decorator, Component, instantiate, Label, Node, Tween, tween } from 'cc';
import BaseUI from '../../../frameWork/ui/BaseUI';
import Hero, { skillData } from '../model/Hero';
import DataReader from '../../../frameWork/data/DataReader';
import { HeroCultivateViewController } from '../controller/HeroCultivateViewController';
import { HeroModel } from '../model/HeroModel';
import { BagModel } from '../../bag/mode/BagModel';
import { ExcelStrToArr } from '../../../frameWork/utils/CommonUtils';
import EventManager from '../../../frameWork/manager/EventManager';
import { SHOWTIPS } from '../../../GameConfig';
const { ccclass, property } = _decorator;

@ccclass('HeroLevelView')
export class HeroLevelView extends BaseUI {
    @property(Node)
    skill: Node = null;
    @property(Node)
    skillItem: Node = null;
    @property(Node)
    upNode: Node = null;
    @property(Node)
    cost: Node = null;
    @property(Node)
    level: Node = null;
    @property(Node)
    maxLevel: Node = null;


    delegate: HeroCultivateViewController
    private isEnough: boolean = false

    private changeLv: number = 0
    private _heroVo: Hero = null
    private bagItemCount: number = 0

    onLoad(): void {
        this.upNode.on(Node.EventType.TOUCH_START, () => {
            if (!this.isEnough) {
                return
            }
            this.starTouch()
        })
        this.upNode.on(Node.EventType.TOUCH_END, () => {
            if (!this.isEnough) {
                EventManager.emit(SHOWTIPS, "武将经验不足")
                return
            }
            this.stopTouch()
        })
        // this.registbuttonClick(this.upNode, () => {
        //     // if (!this.isEnough) {
        //     //     EventManager.emit(SHOWTIPS, "武将经验不足")
        //     //     return
        //     // }
        //     // this.delegate && this.delegate.upLevelHandler()
        // })
    }

    refreshView(_delegate?: HeroCultivateViewController) {
        this.delegate = _delegate || this.delegate
        let heroModel: HeroModel = <HeroModel>HeroModel.getInstance()
        let heroid = heroModel.getSelectHeroId()
        this._heroVo = heroModel.getHero(heroid)
        let skills: skillData[] = this._heroVo.getSkillData()
        this.skill.children.forEach((node) => {
            node.active = false
        })
        for (let index = 0; index < skills.length; index++) {
            let _item = this.skill.getChildByName(`skill${index}`)
            if (!_item) {
                _item = instantiate(this.skillItem)
                _item.name = `skill${index}`
                this.skill.addChild(_item)
            }
            _item.active = true
            let skillVo = skills[index]
            let skillConfig = DataReader.getRecordById("HeroSkill", skillVo.skillId)
            //name
            let _name = _item.getChildByName("name");
            _name.getComponent(Label).string = skillConfig.skillName
            //kv
            let skillLv = skillVo.skillLv
            let _lvBg = _item.getChildByName("lvBg")
            let _lv = _lvBg.getChildByName("level")
            _lvBg.active = skillLv != 0
            _lv.getComponent(Label).string = `${skillLv}`
            //suo
            let _lock = _item.getChildByName("lock")
            _lock.active = skillLv == 0
        }
        //道具
        let curLv = this._heroVo.getLevel();
        let lvConfig = DataReader.requireRecordById("HeroLv", `${curLv + 1}`)
        let isMaxLv = lvConfig ? false : true;
        this.level.active = !isMaxLv;
        this.maxLevel.active = isMaxLv;
        if (!isMaxLv) {
            this.updateCount(true)
        }
    }

    updateCount(showInit?: boolean) {
        let curLv = this._heroVo.getLevel() + this.changeLv;
        let lvConfig = DataReader.requireRecordById("HeroLv", `${curLv + 1}`)
        let lvCostStr = ExcelStrToArr(lvConfig.cost)
        let itemId = lvCostStr[1];
        let itemCofig = DataReader.requireRecordById("Item", itemId)
        let itemName = itemCofig.name;
        let bagModel: BagModel = <BagModel>BagModel.getInstance()
        if (showInit) {
            this.bagItemCount = bagModel.getCountByConfigId(itemId);
        }
        let needCount = lvCostStr[2]
        let costStr = `${itemName} ${this.bagItemCount}/${needCount}`
        this.cost.getComponent(Label).string = costStr
        this.isEnough = this.bagItemCount >= Number(needCount)
    }

    starTouch() {
        tween(this.upNode) // 绑定在节点上，节点销毁时 tween 自动停止
            .delay(1.0)   // 等待 1 秒
            .call(() => {
                //手动减
                let curLv = this._heroVo.getLevel() + this.changeLv;
                let lvConfig = DataReader.requireRecordById("HeroLv", `${curLv + 1}`)
                let lvCostStr = ExcelStrToArr(lvConfig.cost)
                let needCount = lvCostStr[2]
                this.bagItemCount -= Number(needCount)
                this.changeLv++
                this.updateCount()

                if (!this.checkAddLv()) {
                    this.stopTouch()
                }
            })
            .union()      // 将前面的 action 封装成一个整体
            .repeatForever()   // repeatForever 永久执行
            .start();     // 启动
    }

    stopTouch() {
        Tween.stopAllByTarget(this.upNode)
        //点击一下升一级
        if (this.changeLv == 0) {
            this.changeLv = 1
        }
        this.delegate && this.delegate.upLevelHandler(this.changeLv)
        this.changeLv = 0
    }

    checkAddLv() {
        let curLv = this._heroVo.getLevel() + this.changeLv;
        let lvConfig = DataReader.requireRecordById("HeroLv", `${curLv + 1}`)
        let isMaxLv = lvConfig ? false : true;
        if (isMaxLv) {
            return false
        }
        let lvCostStr = ExcelStrToArr(lvConfig.cost)
        let needCount = lvCostStr[2]
        if (this.bagItemCount < Number(needCount)) {
            return false
        }

        return true
    }
}


