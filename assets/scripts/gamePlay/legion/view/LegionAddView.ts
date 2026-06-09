import { _decorator, Component, EditBox, instantiate, Label, Node, ScrollView, size, UITransform, Vec3 } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { LegionAddViewController } from '../controller/LegionAddViewController';
import { TableView } from '../../../frameWork/utils/TableView';
import { LegionInfo, LegionListInfo } from 'db://assets/resource/proto/structure';
import IconFactory from '../../base/IconFactory';
const { ccclass, property } = _decorator;

@ccclass('LegionAddView')
export class LegionAddView extends UIView {
    static className: string = "LegionAddView"
    delegate: LegionAddViewController
    protected static prefabUrl: string = "ui/legion/LegionAdd"

    private _searchEdit: Node = null;
    private _search: Node = null;
    private _scrollView: Node = null;
    private _cellClone: Node = null;
    private _create: Node = null;
    private _noLegion: Node = null;

    private legionAddListScroll: TableView = null;
    onLoad() {
        let _bg = this.node.getChildByName("bg");
        this.registbuttonClick(_bg, () => {
            this.delegate.close()
        })
        this._searchEdit = this.node.getChildByName("searchEdit");
        this._search = this.node.getChildByName("search");
        this.registbuttonClick(this._search, () => {
            let _editBox = this._searchEdit.getComponent(EditBox)
            let _legionName = _editBox.string || _editBox.placeholder
            this.delegate.searchHandler(_legionName, () => {
                this.updateListView()
            })
        })
        this._scrollView = this.node.getChildByName("scrollView");
        this._cellClone = this.node.getChildByName("cellClone");
        this._cellClone.active = false;
        this._create = this.node.getChildByName("create");
        this.registbuttonClick(this._create, () => {
            this.delegate.createHandler()
        })
        this._noLegion = this.node.getChildByName("noLegion");
        this._noLegion.active = false
    }

    updateView() {
        this._noLegion.active = this.delegate.legionIds.length <= 0
        if (this.delegate.legionIds.length > 0) {
            this.updateListView()
        }
    }


    updateListView() {
        if (!this.legionAddListScroll) {
            let collectionView = new TableView({
                view: this._scrollView.getComponent(ScrollView),
            })
            collectionView.cellSizeForTable = this.cellSizeForTable;
            collectionView.numberOfCellsInTableView = this.numberOfCellsInTableView;
            collectionView.cellAtIndex = this.cellAtIndex;
            this.legionAddListScroll = collectionView;
        }
        this.legionAddListScroll.reloadData()
    }

    //返回size大小
    cellSizeForTable = (view: ScrollView, index: number) => {
        let size1 = this._cellClone.getComponent(UITransform).contentSize;
        return size(size1.width, size1.height + 10);
    }

    //返回scrollview数量
    numberOfCellsInTableView = () => {
        return this.delegate.legionIds.length;
    }

    //设置item
    cellAtIndex = (view: ScrollView, index: number) => {
        let cell = this.legionAddListScroll.dequeueCellByKey()
        if (!cell) {
            cell = instantiate(this._cellClone)
        }
        cell.active = true
        let legionInfo: LegionListInfo = this.delegate.legionIds[index];
        //icon
        let _icon = cell.getChildByName("icon");
        _icon.destroyAllChildren();
        let _iconNode = IconFactory.createLegionIcon(legionInfo.flagId, legionInfo.banner, this.delegate)
        _iconNode.scale = new Vec3(2, 2, 2)
        _icon.addChild(_iconNode)
        //name
        let _name = cell.getChildByName("name");
        _name.getComponent(Label).string = legionInfo.name
        //level
        let _level = cell.getChildByName("level");
        _level.getComponent(Label).string = `${legionInfo.level}`
        //apply
        let _apply = cell.getChildByName("apply");
        let _applyTyp = _apply.getChildByName("applyTip")
        _applyTyp.getComponent(Label).string = legionInfo.application ? "申请中" : "申请"
        this.registbuttonClick(_apply, () => {
            if (legionInfo.application) {
                return
            }
            let legionId = legionInfo.legionId
            this.delegate.applyHandler(legionId, () => {
                this.delegate.legionIds[index].application = true
                _applyTyp.getComponent(Label).string = '申请中'
            })
        })
        let _check = cell.getChildByName("check");
        this.registbuttonClick(_check, () => {

        })

        return cell
    }
}


