import { _decorator, Node } from 'cc';
import BaseUI from '../../../frameWork/ui/BaseUI';
import { HomeViewController } from '../controller/HomeViewController';
const { ccclass, property } = _decorator;

@ccclass('HomeBottomView')
export class HomeBottomView extends BaseUI {
    static className: string = "HomeTopView"
    delegate: HomeViewController
    protected static prefabUrl: string = "ui/home/HomeTop"

    private _campaign: Node = null
    private _lord: Node = null
    private _hero: Node = null
    private _bag: Node = null
    private _club: Node = null
    private _city: Node = null

    onLoad() {
        super.onLoad()
        this._campaign = this.node.getChildByName("campaign");
        this.registbuttonClick(this._campaign, () => {
            this.delegate.clickCampaignHandler()
        })
        this._lord = this.node.getChildByName("lord")
        this.registbuttonClick(this._lord, () => {
            this.delegate.clickLordHandler()
        })
        this._hero = this.node.getChildByName("hero")
        this.registbuttonClick(this._hero, () => {
            this.delegate.clickHeroHandler()
        })
        this._bag = this.node.getChildByName("bag")
        this.registbuttonClick(this._bag, () => {
            this.delegate.clickBagHandler()
        })
        this._club = this.node.getChildByName("club")
        this.registbuttonClick(this._club, () => {
            this.delegate.clickClubHandler()
        })
        this._city = this.node.getChildByName("city")
        this.registbuttonClick(this._city, () => {
            this.delegate.clickCityHandler()
        })
    }

    initview(_delegate: HomeViewController) {
        this.delegate = _delegate
    }

    updateView() {

    }
}


