import { _decorator, Component, find, instantiate, Label, Layout, Node, Prefab, ScrollView, size, Toggle, UITransform } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { TableView } from '../../../frameWork/utils/TableView';
import { HeroViewController } from '../controller/HeroViewController';
import { camps } from '../model/HeroModel';
import { HeroListItemView } from './HeroListItemView';
const { ccclass, property } = _decorator;


@ccclass('HeroView')
export class HeroView extends UIView {
    static className: string = "HeroView"
    delegate: HeroViewController
    protected static prefabUrl: string = "ui/hero/Hero"

    @property(Prefab)
    herolistItemPre: Prefab = null

    private _camp: Node = null;
    private _campItem: Node = null;
    private _scrollView: Node = null;
    private _close: Node = null;

    private heroListScroll: TableView = null;
    private _row: number = 3;

    onLoad() {
        super.onLoad()
        this._camp = find("filter/camp", this.node);
        this._campItem = this.node.getChildByName("campItem");
        this._campItem.active = false
        this._scrollView = this.node.getChildByName("ScrollView")
        this._close = this.node.getChildByName("close");
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })

        this.updateCamp()
    }

    initView() {
        let _item = this._camp.getChildByName(`campItem${this.delegate._toggleIndex}`)
        _item && (_item.getComponent(Toggle).isChecked = true)
    }

    updateView() {
        this.updateListView()
    }

    updateListView() {
        if (!this.heroListScroll) {
            let collectionView = new TableView({
                view: this._scrollView.getComponent(ScrollView),
            })
            collectionView.cellSizeForTable = this.cellSizeForTable;
            collectionView.numberOfCellsInTableView = this.numberOfCellsInTableView;
            collectionView.cellAtIndex = this.cellAtIndex;
            this.heroListScroll = collectionView;
        }
        this.heroListScroll.reloadData()
    }


    //返回size大小
    cellSizeForTable = (view: ScrollView, index: number) => {
        let size1 = this._scrollView.getComponent(UITransform).contentSize;
        return size(size1.width, 410);
    }

    //返回scrollview数量
    numberOfCellsInTableView = () => {
        return Math.ceil(this.delegate.heroModel.heroAllIds.length / this._row);
    }

    //设置item
    cellAtIndex = (view: ScrollView, index: number) => {
        let cell = this.heroListScroll.dequeueCellByKey()
        if (!cell) {
            cell = new Node()
            let cellUItr = cell.addComponent(UITransform)
            cellUItr.anchorX = 0
            cellUItr.anchorY = 0
            let lay = cell.addComponent(Layout);
            lay.type = Layout.Type.HORIZONTAL
            lay.resizeMode = Layout.ResizeMode.CONTAINER;
            lay.paddingLeft = 20;
            lay.spacingX = 70
        }
        cell.active = true

        cell.children.forEach((node) => {
            node.active = false
        })

        for (let i = 0; i < this._row; i++) {
            let _index = this._row * index + i;
            let _heroId = this.delegate.heroModel.heroAllIds[_index]
            if (_heroId) {
                let _item = cell.getChildByName(`item${i}`)
                if (!_item) {
                    _item = instantiate(this.herolistItemPre)
                    _item.name = `item${i}`
                    cell.addChild(_item)
                    _item.y = 0
                    this.registbuttonClick(_item, () => {
                        if (this.delegate.heroModel.getHero(_heroId)) {
                            this.delegate.openCultivateView(_heroId)
                        }
                    })
                }
                _item.active = true
                let _herolistItem = _item.getComponent(HeroListItemView);
                _herolistItem.initView(this.delegate)
                _herolistItem.updateView({ heroId: _heroId })
            }
        }
        return cell;
    }

    updateCamp() {
        this._camp.children.forEach((node) => {
            node.active = false
        })
        for (let index = 0; index < camps.length; index++) {
            let _item = this._camp.getChildByName(`campItem${index}`)
            let _itemVo = camps[index];
            if (!_item) {
                _item = instantiate(this._campItem);
                _item.name = `campItem${index}`
                this._camp.addChild(_item)
            }
            _item.active = true;
            let _name = _item.getChildByName("name");
            let _name1 = find("Checkmark/name", _item);
            _name.getComponent(Label).string = _itemVo.name
            _name1.getComponent(Label).string = _itemVo.name
        }
        let index = 0
        this._camp.children.forEach((tabBar) => {
            let toggle = tabBar.getComponent(Toggle)
            let scrollViewEventHandler = new Component.EventHandler();
            scrollViewEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
            scrollViewEventHandler.component = "HeroView";// 这个是代码文件名
            scrollViewEventHandler.handler = "onClickToggle";
            scrollViewEventHandler.customEventData = index.toString();
            toggle.checkEvents.push(scrollViewEventHandler);
            index++
        })
    }

    onClickToggle(event, index: string | number) {
        if (!this.delegate) {
            return
        }
        if (this.delegate._toggleIndex == index) {
            return;
        }
        this.delegate._toggleIndex = Number(index);
        this.delegate.updateHeroIds()
    }
}


