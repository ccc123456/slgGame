import { _decorator, instantiate, Label, Node, ProgressBar, ScrollView, size, Sprite, Tween, tween, UITransform } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { CityTeamListViewController } from '../controller/CityTeamListViewController';
import { TableView } from '../../../frameWork/utils/TableView';
import { BattleUnit, HeroState } from 'db://assets/resource/proto/structure';
import DataReader from '../../../frameWork/data/DataReader';
import IconFactory from '../../base/IconFactory';
import { teamListData } from '../mode/City';
const { ccclass, property } = _decorator;

@ccclass('CityTeamListView')
export class CityTeamListView extends UIView {
    static className: string = "CityTeamListView"
    delegate: CityTeamListViewController
    protected static prefabUrl: string = "ui/cityBattle/CityTeamList"

    private _close: Node = null
    private _scrollView: Node = null;
    private _cellClone: Node = null
    private _infoItem: Node = null

    private teamListScroll: TableView = null;
    onLoad() {
        this._close = this.node.getChildByName("close");
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })
        this._scrollView = this.node.getChildByName("scrollView")
        this._cellClone = this.node.getChildByName("cellClone");
        this._cellClone.active = false
        this._infoItem = this.node.getChildByName("infoItem")
        this._infoItem.active = false
    }

    updateView() {
        this.updateListView()
    }

    updateListView() {
        if (!this.teamListScroll) {
            let collectionView = new TableView({
                view: this._scrollView.getComponent(ScrollView),
            })
            collectionView.cellSizeForTable = this.cellSizeForTable;
            collectionView.numberOfCellsInTableView = this.numberOfCellsInTableView;
            collectionView.cellAtIndex = this.cellAtIndex;
            this.teamListScroll = collectionView;
        }
        this.teamListScroll.reloadData()
    }

    //返回size大小
    cellSizeForTable = (view: ScrollView, index: number) => {
        let size1 = this._cellClone.getComponent(UITransform).contentSize;
        return size(size1.width, size1.height + 10);
    }

    //返回scrollview数量
    numberOfCellsInTableView = () => {
        return this.delegate.teamListVo.length;
    }

    //设置item
    cellAtIndex = (view: ScrollView, index: number) => {
        let cell = this.teamListScroll.dequeueCellByKey()
        if (!cell) {
            cell = instantiate(this._cellClone)
        }
        cell.active = true
        let teamList: teamListData = this.delegate.teamListVo[index]
        //battle
        let _battle = cell.getChildByName("battle");
        _battle.active = teamList.battle;
        this.registbuttonClick(_battle, () => {
            this.delegate.openTeamDetailHandler(index)
        })
        //atk
        let _atk = cell.getChildByName("atk");
        this.registbuttonClick(_atk, () => {
            this.delegate.openTeamDetailAtk(index)
        })
        this.updateInfoItem(_atk, teamList.atk, teamList.battle)
        //def
        let _def = cell.getChildByName("def");
        this.registbuttonClick(_def, () => {
            this.delegate.openTeamDetailDef(index)
        })
        this.updateInfoItem(_def, teamList.def, teamList.battle)
        //开始计时器 根据剩余时间请求下一次
        Tween.stopAllByTarget(cell)
        if (teamList.battle) {
            let lastTime = Number(this.delegate.cityVo.getLastBattleTime())
            tween(cell) // 绑定在节点上，节点销毁时 tween 自动停止
                .delay(lastTime)   // 等待 1 秒
                .call(() => {
                    this.delegate.cityBattleInfoHandler()
                })
                .union()      // 将前面的 action 封装成一个整体
                // .repeatForever()   // repeatForever 永久执行
                .start();     // 启动
        }

        return cell
    }

    updateInfoItem(cell: Node, battleUnit: BattleUnit, isBattle: boolean) {
        let _item = cell.getChildByName(`item`);
        if (!_item) {
            _item = instantiate(this._infoItem);
            _item.name = `item`
            cell.addChild(_item);
        }
        _item.active = battleUnit ? true : false;
        if (!battleUnit) {
            return
        }
        //icon
        let _icon = _item.getChildByName("icon");
        let isGarrison = battleUnit.isGarrison;
        let heros: HeroState[] = battleUnit.hero
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
        IconFactory.decorateNodeWithSpriteFrame(iconPath, _icon, this.delegate, false, Sprite.SizeMode.CUSTOM)
        //hp
        let _hp = _item.getChildByName("Hp");
        Tween.stopAllByTarget(_hp)
        let _hpLab = _item.getChildByName("proLab")
        let maxAllHp = 0;
        let lastBatleHp = 0
        let curAllHp = 0;
        for (let hpIndex = 0; hpIndex < heros.length; hpIndex++) {
            maxAllHp += Number(heros[hpIndex].maxHp)
            lastBatleHp += Number(heros[hpIndex].lastBattleHp)
            curAllHp += Number(heros[hpIndex].currentHp)
        }
        let poorHp = lastBatleHp - curAllHp
        let lastTime = Number(this.delegate.cityVo.getLastBattleTime())
        // console.log("maxAllHp...." + maxAllHp);
        // console.log("lastBatleHp...." + lastBatleHp);
        // console.log("curAllHp...." + curAllHp);
        // console.log("lastTime...." + lastTime);
        // console.log(".............");
        //每次减
        let onceReduce = poorHp / lastTime
        let setHp = () => {
            let pro = lastBatleHp / maxAllHp
            _hp.getComponent(ProgressBar).progress = pro
            let proB = Math.floor(pro * 100)
            _hpLab.getComponent(Label).string = `${proB}%`
        }
        setHp()
        if (isBattle) {
            let reduceHpHandler = () => {
                lastBatleHp -= onceReduce;
                lastBatleHp = lastBatleHp <= curAllHp ? curAllHp : lastBatleHp
                setHp();
                if (lastBatleHp <= curAllHp) {
                    Tween.stopAllByTarget(_hp)
                }
            }
            //先减一次 在循环减
            reduceHpHandler()
            tween(_hp) // 绑定在节点上，节点销毁时 tween 自动停止
                .delay(1.0)   // 等待 1 秒
                .call(() => {
                    reduceHpHandler()
                })
                .union()      // 将前面的 action 封装成一个整体
                .repeatForever()   // repeatForever 永久执行
                .start();     // 启动
        }

        //clubName
        let _cuubName = _item.getChildByName("clubName")
        _cuubName.getComponent(Label).string = battleUnit.legionName
        //name
        let _name = _item.getChildByName("name")
        _name.getComponent(Label).string = battleUnit.isGarrison ? "城防军" : battleUnit.playerName
    }
}


