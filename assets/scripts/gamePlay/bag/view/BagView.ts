import { _decorator, Component, find, instantiate, Label, Node, ScrollView, size, UITransform } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { BagViewController } from '../controller/BagViewController';
import Item from '../mode/Item';
import { TableView } from '../../../frameWork/utils/TableView';
const { ccclass, property } = _decorator;

@ccclass('BagView')
export class BagView extends UIView {
    static className: string = "BagView"
    delegate: BagViewController
    protected static prefabUrl: string = "ui/bag/Bag"

    private _close: Node = null
    private _scrollView: Node = null;
    private _cellNode: Node = null;
    private _cellItem: Node = null;

    private _itemDatas: Item[] = [];
    private bagListScroll: TableView = null;
    private _row: number = 5;

    onLoad(): void {
        super.onLoad()
        this._close = find("close/close", this.node);
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })
        this._scrollView = this.node.getChildByName("scrollView")
        this._cellNode = this.node.getChildByName("cellClone");
        this._cellNode.active = false
        this._cellItem = this.node.getChildByName("cellItem");
        this._cellItem.active = false
    }

    updateView() {
        this._itemDatas = this.delegate.bagModel.getDataBySheet()
        if (!this.bagListScroll) {
            let collectionView = new TableView({
                view: this._scrollView.getComponent(ScrollView),
            })
            collectionView.cellSizeForTable = this.cellSizeForTable;
            collectionView.numberOfCellsInTableView = this.numberOfCellsInTableView;
            collectionView.cellAtIndex = this.cellAtIndex;
            this.bagListScroll = collectionView;
        }
        this.bagListScroll.reloadData()
    }

    //返回size大小
    cellSizeForTable = (view: ScrollView, index: number) => {
        let size1 = this._cellNode.getComponent(UITransform).contentSize;
        return size(size1.width, size1.height + 10);
    }

    //返回scrollview数量
    numberOfCellsInTableView = () => {
        return Math.ceil(this._itemDatas.length / this._row);
    }

    //设置item
    cellAtIndex = (view: ScrollView, index: number) => {
        let cell = this.bagListScroll.dequeueCellByKey()
        if (!cell) {
            cell = instantiate(this._cellNode)
        }
        cell.active = true
        let _itemNode = cell.getChildByName("item");
        _itemNode.children.forEach((node) => {
            node.active = false
        })
        for (let i = 0; i < this._row; i++) {
            let _index = this._row * index + i;
            let _item: Item = this._itemDatas[_index]
            if (_item) {
                let _itemcell = _itemNode.getChildByName(`cellItem${i}`)
                if (!_itemcell) {
                    _itemcell = instantiate(this._cellItem)
                    _itemcell.name = `cellItem${i}`
                    _itemNode.addChild(_itemcell)
                }
                _itemcell.active = true;
                //name
                let _name = _itemcell.getChildByName("name");
                _name.getComponent(Label).string = _item.getName();
                //count
                let _count = _itemcell.getChildByName("count");
                _count.getComponent(Label).string = `${_item.getCount()}`
            }
        }
        return cell
    }
}


