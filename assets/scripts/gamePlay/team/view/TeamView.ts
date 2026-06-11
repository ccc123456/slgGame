import { _decorator, instantiate, Label, Layout, Node, Prefab, ScrollView, size, UITransform, Widget } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { TeamViewController } from '../controller/TeamViewController';
import { TableView } from '../../../frameWork/utils/TableView';
import { HeroListItemView } from '../../hero/view/HeroListItemView';
import { TeamBtnState } from '../model/TeamModel';
const { ccclass, property } = _decorator;

@ccclass('TeamView')
export class TeamView extends UIView {
    static className: string = "TeamView"
    delegate: TeamViewController
    protected static prefabUrl: string = "ui/team/Team"

    @property(Prefab)
    herolistItemPre: Prefab = null

    private _close: Node = null;
    private _scrollView: Node = null
    private _oneKeyTeam: Node = null;
    private _team: Node = null
    private _teamItem: Node = null
    private _citySiegeBtn: Node = null
    private _citySiegeBtnLab: Node = null
    private _citySiegeBtnCost: Node = null

    private heroListScroll: TableView = null;
    private _row: number = 3;
    onLoad(): void {
        this._close = this.node.getChildByName("close");
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })
        this._oneKeyTeam = this.node.getChildByName("oneKeyTeam");
        this.registbuttonClick(this._oneKeyTeam, () => {
            this.delegate.oneKeyHandler()
            this.updateBtnTip()
        })
        this._team = this.node.getChildByName("team")
        this._scrollView = this.node.getChildByName("scrollView")
        this._teamItem = this.node.getChildByName("teamItem")
        this._teamItem.active = false
        this._citySiegeBtn = this.node.getChildByName("citySiegeBtn")
        this.registbuttonClick(this._citySiegeBtn, () => {
            this.delegate.siegeHadler()
        })
        this._citySiegeBtnLab = this._citySiegeBtn.getChildByName("tip")
        this._citySiegeBtnCost = this._citySiegeBtn.getChildByName("BtnCost");
    }

    updateView() {
        this.updateBtnState()
        this.updateListView()
        this.updateTeam()
        this.updateBtnTip()
    }

    updateBtnState() {
        this._citySiegeBtn.active = this.delegate.teamBtnState == TeamBtnState.citySiege ||
            this.delegate.teamBtnState == TeamBtnState.cityDefence
        let btnLab: string = '';
        switch (this.delegate.teamBtnState) {
            case TeamBtnState.citySiege:
                btnLab = '进攻'
                break;
            case TeamBtnState.cityDefence:
                btnLab = '防守'
                break;
        }
        this._citySiegeBtnLab.getComponent(Label).string = btnLab

    }

    updateBtnTip() {
        switch (this.delegate.teamBtnState) {
            case TeamBtnState.citySiege:
            case TeamBtnState.cityDefence:
                let allCount = this.delegate.playerModel.getProvisions()
                let costCount = 0;
                for (let index = 0; index < this.delegate.teamHeroIds.length; index++) {
                    let heorId = this.delegate.teamHeroIds[index];
                    let heroVo = this.delegate.heroModel.getHero(heorId);
                    if (heroVo) {
                        costCount += heroVo.getCityCost()
                    }
                }
                this.delegate._cityCostEnough = allCount >= costCount
                this._citySiegeBtnCost.getComponent(Label).string = `${costCount}/${allCount}`

                break;

            default:
                break;
        }

    }

    updateTeam() {
        for (let index = 0; index < 5; index++) {
            let teamItem = this._team.getChildByName(`team${index + 1}`)
            if (!teamItem) {
                teamItem = instantiate(this._teamItem);
                teamItem.name = `team${index + 1}`
                this._team.addChild(teamItem)
            }
            teamItem.active = true
            let _itemNode = teamItem.getChildByName("item");
            let _itemPre = _itemNode.getChildByName("itemPre");
            if (!_itemPre) {
                _itemPre = instantiate(this.herolistItemPre)
                _itemPre.name = `itemPre`
                _itemNode.addChild(_itemPre)
            }
            let heroId = this.delegate.teamHeroIds[index]
            _itemPre.active = heroId ? true : false
            if (heroId) {
                let _herolistItem = _itemPre.getComponent(HeroListItemView);
                _herolistItem.initView(this.delegate)
                _herolistItem.updateView(`${heroId}`)
            }
        }
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
        return Math.ceil(this.delegate.heros.length / this._row);
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
            let _heroVo = this.delegate.heros[_index]
            if (_heroVo) {
                let _item = cell.getChildByName(`item${i}`)
                if (!_item) {
                    _item = instantiate(this.herolistItemPre)
                    _item.name = `item${i}`
                    cell.addChild(_item)
                    _item.y = 0
                    this.registbuttonClick(_item, () => {

                    })
                }
                _item.active = true
                let _herolistItem = _item.getComponent(HeroListItemView);
                _herolistItem.initView(this.delegate)
                _herolistItem.updateView(_heroVo.getId())
            }
        }
        return cell
    }
}


