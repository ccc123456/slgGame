import { _decorator, Component, find, instantiate, Label, log, Node, Prefab, Toggle, UITransform } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { HeroCultivateViewController } from '../controller/HeroCultivateViewController';
import Hero from '../model/Hero';
import { HeroCultivateShowAtt, HeroModel } from '../model/HeroModel';
import IconFactory from '../../base/IconFactory';
import DataReader from '../../../frameWork/data/DataReader';
import BaseUI from '../../../frameWork/ui/BaseUI';
const { ccclass, property } = _decorator;

export const enum DevelopTab {
    KLevel = "Hero_LvUp",
    KStar = "Hero_Star",
}

export const developTabType = {
    KLevel: "Hero_LvUp",
    KQuality: "Hero_Quality",
    KStar: "Hero_Star",
}

const ViewInfo = {
    [developTabType.KLevel]: ["HeroLevel", "HeroLevelView"],
    [developTabType.KQuality]: ["HeroQuality", "HeroQualityView"],
    [developTabType.KStar]: ["HeroStar", "HeroStarView"]
}

@ccclass('HeroCultivateView')
export class HeroCultivateView extends UIView {
    static className: string = "HeroCultivateView"
    delegate: HeroCultivateViewController
    protected static prefabUrl: string = "ui/hero/HeroCultivate"

    @property(Prefab)
    HeroLevel: Prefab = null

    @property(Prefab)
    HeroQuality: Prefab = null

    @property(Prefab)
    HeroStar: Prefab = null

    private _close: Node = null
    private _tabBar: Node = null;
    private _toggles: Node[] = [];
    private _icon: Node = null
    private _campLab: Node = null
    private _nameLab: Node = null
    private _star: Node = null
    private _starItem: Node = null
    private _typeIcon: Node = null
    private _qualityLab: Node = null
    private _left: Node = null;
    private _right: Node = null;
    private _power: Node = null;
    private _level: Node = null;
    private _stageLan: Node = null;
    private _positionLab: Node = null
    private _changeNode: Node = null
    private _baseAtt: Node = null
    private _bastAttItem: Node = null
    private _allAtt: Node = null

    private _toggleIndex: number = 0;
    private _viewCache: { [key: string]: any } = {}
    private _curTabType: string = developTabType.KLevel
    private _hero: Hero = null
    onLoad() {
        super.onLoad()
        this._tabBar = find("close/tabBar", this.node);
        for (let index = 0; index < 3; index++) {
            let tabBar = this._tabBar.getChildByName(`toggle${index + 1}`)
            this._toggles[index] = tabBar
            let toggle = tabBar.getComponent(Toggle)
            let scrollViewEventHandler = new Component.EventHandler();
            scrollViewEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
            scrollViewEventHandler.component = "HeroCultivateView";// 这个是代码文件名
            scrollViewEventHandler.handler = "onClickToggle";
            scrollViewEventHandler.customEventData = index.toString();
            toggle.checkEvents.push(scrollViewEventHandler);
        }
        this._icon = this.node.getChildByName("icon")
        this._close = find("close/close", this.node);
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })
        this._campLab = find('info/camp/campLab', this.node)
        this._nameLab = find('info/name/nameLab', this.node)
        this._star = find('info/star', this.node)
        this._starItem = this.node.getChildByName("starItem");
        this._starItem.active = false
        this._typeIcon = find('info/typeIcon', this.node)
        this._qualityLab = find('info/quality/qualityLab', this.node)
        this._left = this.node.getChildByName("left")
        this.registbuttonClick(this._left, () => {
            this.delegate.heromodel.reduceSelectHeroId();
            this.updateView()
        })
        this._right = this.node.getChildByName("right")
        this.registbuttonClick(this._right, () => {
            this.delegate.heromodel.addSelectHeroId();
            this.updateView()
        })
        this._power = find("power/powerLab", this.node)
        this._level = find("updateInfo/level/level", this.node)
        this._stageLan = find("updateInfo/stage/stageLab", this.node)
        this._positionLab = find("updateInfo/position/positionLab", this.node)
        this._changeNode = find("updateInfo/changeNode", this.node)
        this._baseAtt = find("updateInfo/baseAtt", this.node)
        this._bastAttItem = this.node.getChildByName("baseAttItem");
        this._allAtt = find("updateInfo/allAtt", this.node)
        this.registbuttonClick(this._allAtt, () => {
            this.delegate.showAttAll()
        })
        this._bastAttItem.active = false
    }

    updateView() {
        let slectHeroId = this.delegate.heromodel.getSelectHeroId()
        this._hero = this.delegate.heromodel.getHero(slectHeroId)
        this.updateChange()
        this.updateIcon()
        this.updateInfo()
        this.updatePower()
        this.updateShowAtt()
        this.udpateLv()
        this.updateStar()
        this.updateRank()
    }

    //玩家升级后界面刷新
    updateLvHandler() {
        this.udpateLv();
        this.updateShowAtt();
        this.updateChange()
    }

    //玩家升星后界面刷新
    updateStarHandler() {
        this.updateStar()
        this.updateChange()
    }

    //玩家进阶后界面刷新
    updateQualityHandler() {
        this.updateRank()
        this.updateChange()
    }

    updateRank() {
        this._stageLan.getComponent(Label).string = `阶段：${this._hero.getRank()}阶`
    }

    udpateLv() {
        this._level.getComponent(Label).string = `${this._hero.getLevel()}`
    }

    updateIcon() {
        let heroIcon = this._hero.getIconPath();
        IconFactory.decorateNodeWithSpriteFrame(heroIcon, this._icon, this.delegate)
    }

    updateStar() {
        this._star.children.forEach((node) => {
            node.active = false
        })
        let starNum = this._hero.getStar()
        for (let index = 0; index < starNum; index++) {
            let _item = this._star.getChildByName(`starItem${index}`);
            if (!_item) {
                _item = instantiate(this._starItem);
                _item.name = `starItem${index}`;
                this._star.addChild(_item)
            }
            _item.active = true
        }
    }

    updateInfo() {
        this._campLab.getComponent(Label).string = this._hero.getCampName()
        this._nameLab.getComponent(Label).string = this._hero.getName()

        let trypeIconPa = this._hero.getJobIconPath();
        IconFactory.decorateNodeWithSpriteFrame(trypeIconPa, this._typeIcon, this.delegate)
        this._qualityLab.getComponent(Label).string = `${this._hero.getQuality()}`
        this._positionLab.getComponent(Label).string = `定位：${this._hero.getDutyProfession()}阶`
    }

    updatePower() {
        this._power.getComponent(Label).string = `战斗力：${this._hero.getPower()}`
    }

    updateShowAtt() {
        for (let index = 0; index < HeroCultivateShowAtt.length; index++) {
            let attItem = this._baseAtt.getChildByName(`item${index}`)
            if (!attItem) {
                attItem = instantiate(this._bastAttItem);
                attItem.name = `item${index}`
                this._baseAtt.addChild(attItem)
            }
            attItem.active = true;
            let attId = HeroCultivateShowAtt[index];
            let heroProConfig = DataReader.requireRecordById("HeroProperty", `${attId}`)
            //name
            let _name = attItem.getChildByName("name");
            _name.getComponent(Label).string = heroProConfig.viewShow
            //value
            let _value = attItem.getChildByName("value");
            _value.getComponent(Label).string = this._hero.getAttValue(attId) + ''
        }
        //增加粮草 根据战力计算
        let attItem = this._baseAtt.getChildByName(`item${HeroCultivateShowAtt.length}`)
        if (!attItem) {
            attItem = instantiate(this._bastAttItem);
            attItem.name = `item${HeroCultivateShowAtt.length}`
            this._baseAtt.addChild(attItem)
        }
        attItem.active = true;
        //name
        let _name = attItem.getChildByName("name");
        _name.getComponent(Label).string = '粮草'
        //value
        let _value = attItem.getChildByName("value");
        _value.getComponent(Label).string = this._hero.getAttFodder() + ''
    }

    onClickToggle(event, index: string | number) {
        if (this._toggleIndex == index) {
            return;
        }

        this._toggleIndex = Number(index);
        let node = this._viewCache[this._curTabType];
        if (node) {
            this.closeView()
            switch (Number(index)) {
                case 0:
                    this._curTabType = developTabType.KLevel
                    break;
                case 1:
                    this._curTabType = developTabType.KQuality
                    break;
                case 2:
                    this._curTabType = developTabType.KStar
                    break;
            }
            this.updateChange()
        }
    }


    //切换页签清空上一个界面
    closeView() {
        let node: Node = this._viewCache[this._curTabType];
        if (node) {
            let info = ViewInfo[this._curTabType];
            node.active = false;
            // node.getComponent(info[1]).closeView();
        }
    }

    updateChange() {
        this._baseAtt.active = this._curTabType != developTabType.KStar
        this._allAtt.active = this._curTabType != developTabType.KStar
        let info = ViewInfo[this._curTabType];
        let node: Node = this._viewCache[this._curTabType];
        if (!node) {
            node = instantiate(this[info[0]])
            node.parent = this._changeNode
            this._viewCache[this._curTabType] = node
        }
        node.active = true
        let scriotCom = node.getComponent(info[1]) as any
        scriotCom.refreshView(this.delegate)
    }


}


