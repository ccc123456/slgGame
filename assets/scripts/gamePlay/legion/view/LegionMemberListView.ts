import { _decorator, Component, find, FogInfo, instantiate, Label, Node, ScrollView, size, Toggle, UITransform } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { LegionMemberListViewController } from '../controller/LegionMemberListViewController';
import { TableView } from '../../../frameWork/utils/TableView';
import { LegionMemberList, PlayerBaseInfo } from 'db://assets/resource/proto/structure';
import DataReader from '../../../frameWork/data/DataReader';
const { ccclass, property } = _decorator;

@ccclass('LegionMemberListView')
export class LegionMemberListView extends UIView {
    static className: string = "LegionMemberListView"
    delegate: LegionMemberListViewController
    protected static prefabUrl: string = "ui/legion/LegionMemberList"

    private _close: Node = null
    private _scrollView: Node = null;
    private _cellClone: Node = null
    private _tabBar: Node = null;

    private _toggles: Node[] = [];
    private legionListScroll: TableView = null;
    onLoad() {
        this._close = find("close/close", this.node);
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })
        this._scrollView = this.node.getChildByName("ScrollView")
        this._cellClone = this.node.getChildByName("cellClone");
        this._cellClone.active = false
        this._tabBar = this.node.getChildByName("tabBar")
        for (let index = 0; index < 2; index++) {
            let tabBar = this._tabBar.getChildByName(`toggle${index + 1}`)
            this._toggles[index] = tabBar
            let toggle = tabBar.getComponent(Toggle)
            let scrollViewEventHandler = new Component.EventHandler();
            scrollViewEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
            scrollViewEventHandler.component = "LegionMemberListView";// 这个是代码文件名
            scrollViewEventHandler.handler = "onClickToggle";
            scrollViewEventHandler.customEventData = index.toString();
            toggle.checkEvents.push(scrollViewEventHandler);
        }
    }

    onClickToggle(event, index: string | number) {
        if (this.delegate._toggleIndex == index) {
            return;
        }
        this.delegate._toggleIndex = Number(index);
        this.delegate.updateToggleHandler()
    }

    updateView() {
        this.updateListView()
    }

    updateListView() {
        if (!this.legionListScroll) {
            let collectionView = new TableView({
                view: this._scrollView.getComponent(ScrollView),
            })
            collectionView.cellSizeForTable = this.cellSizeForTable;
            collectionView.numberOfCellsInTableView = this.numberOfCellsInTableView;
            collectionView.cellAtIndex = this.cellAtIndex;
            this.legionListScroll = collectionView;
        }
        this.legionListScroll.reloadData()
    }


    //返回size大小
    cellSizeForTable = (view: ScrollView, index: number) => {
        let size1 = this._cellClone.getComponent(UITransform).contentSize;
        return size(size1.width, size1.height + 10);
    }

    //返回scrollview数量
    numberOfCellsInTableView = () => {
        return this.delegate._toggleIndex == 0
            ? this.delegate.legionMemberList.length :
            this.delegate.legionApplicaList.length
    }

    //设置item
    cellAtIndex = (view: ScrollView, index: number) => {
        let cell = this.legionListScroll.dequeueCellByKey()
        if (!cell) {
            cell = instantiate(this._cellClone)
        }
        cell.active = true
        let _member = cell.getChildByName("member");
        let _apply = cell.getChildByName("apply")
        _member.active = this.delegate._toggleIndex == 0
        _apply.active = this.delegate._toggleIndex == 1
        switch (this.delegate._toggleIndex) {
            case 0:
                this.updateMemberInfo(_member, this.delegate.legionMemberList[index])
                break;
            case 1:
                this.updateApplyInfo(_apply, this.delegate.legionApplicaList[index])
                break;
        }
        return cell
    }

    updateMemberInfo(cell: Node, legionMemberListInfo: LegionMemberList) {
        //name
        this.updateName(cell, legionMemberListInfo.playerInfo.name)
        //name
        this.updateLevel(cell, legionMemberListInfo.playerInfo.lv)
        //updatePower
        this.updatePower(cell, legionMemberListInfo.playerInfo.power)
        let _postion = cell.getChildByName("position")
        let _posIndex = legionMemberListInfo.position;
        let _posName = DataReader.requireDataByNameIdAndKey("factionPermission", `${_posIndex}`, "name")
        _postion.getComponent(Label).string = _posName
    }

    updateApplyInfo(cell: Node, playerBase: PlayerBaseInfo) {
        //name
        this.updateName(cell, playerBase.name)
        //power
        this.updatePower(cell, playerBase.power)
        //level
        this.updateLevel(cell, playerBase.lv)
        //approve
        let _approve = cell.getChildByName("approve");
        this.registbuttonClick(_approve, () => {
            this.delegate.approveApplication(playerBase.playerId, true)
        })
        //refuse
        let _refuse = cell.getChildByName("refuse");
        this.registbuttonClick(_refuse, () => {
            this.delegate.approveApplication(playerBase.playerId, false)
        })
    }

    //name
    updateName(cell: Node, nameStr: string) {
        let _name = cell.getChildByName("name");
        _name.getComponent(Label).string = nameStr
    }

    //level
    updateLevel(cell: Node, level: number) {
        let _level = cell.getChildByName("level");
        _level.getComponent(Label).string = `Lv.${level}`
    }

    //power
    updatePower(cell: Node, power: string) {
        let _power = cell.getChildByName("power");
        _power.getComponent(Label).string = `战斗力${power}`
    }
}


