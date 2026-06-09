import { _decorator, Label, Node } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { CityInfoViewController } from '../controller/CityInfoViewController';
import IconFactory from '../../base/IconFactory';
import { LegionBaseInfo } from 'db://assets/resource/proto/structure';
const { ccclass, property } = _decorator;

@ccclass('CityInfoView')
export class CityInfoView extends UIView {
    static className: string = "CityInfoView"
    delegate: CityInfoViewController
    protected static prefabUrl: string = "ui/cityBattle/CityInfo"

    private _bg: Node = null
    private _close: Node = null
    private _cityName: Node = null
    private _cityIcon: Node = null
    private _cityType: Node = null
    private _noClub: Node = null;
    private _club: Node = null;
    private _clubIcon: Node = null
    private _clubName: Node = null
    private _cityState: Node = null
    private _cityCount: Node = null
    private _cityLevel: Node = null


    onLoad() {
        this._bg = this.node.getChildByName('bg')
        this._close = this.node.getChildByName('close')
        this.registbuttonClick(this._bg, () => {
            this.delegate.close()
        })
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })
        this._cityName = this.node.getChildByName("name")
        this._cityIcon = this.node.getChildByName("icon")
        this._cityType = this.node.getChildByName("type")
        this._noClub = this.node.getChildByName("noClub");
        this._noClub.active = false
        this._club = this.node.getChildByName("club");
        this._club.active = false
        this._clubIcon = this._club.getChildByName("clubIcon")
        this._clubName = this._club.getChildByName("clubName")
        this._cityState = this.node.getChildByName("state")
        this._cityCount = this.node.getChildByName("count")
        this._cityLevel = this.node.getChildByName("level")
    }

    updateView() {
        //name
        let _name = this.delegate.cityVo.getName()
        this._cityName.getComponent(Label).string = _name
        //icon
        let iconPath = this.delegate.cityVo.getCityIcon()
        IconFactory.decorateNodeWithSpriteFrame(iconPath, this._cityIcon, this)
        //type
        let typeStr = this.delegate.cityVo.getTypeName()
        this._cityType.getComponent(Label).string = typeStr
        //club
        let legionInfo: LegionBaseInfo = this.delegate.cityVo.getLegionBaseInfo()
        let _isHasClub = legionInfo ? true : false
        this._noClub.active = !_isHasClub
        this._club.active = _isHasClub;
        if (_isHasClub) {
            //clubIcon
            this._clubIcon.destroyAllChildren();
            let _icon = IconFactory.createLegionIcon(legionInfo.flagId, legionInfo.banner, this.delegate)
            this._clubIcon.addChild(_icon)
            //clubName
            this._clubName.getComponent(Label).string = legionInfo.name
        }
        //_cityState
        this._cityState.getComponent(Label).string = this.delegate.cityVo.getCityStateName();
        //_cityCount
        this._cityCount.getComponent(Label).string = `${this.delegate.cityVo.getCityCountStr()}`;
        //_cityLevel
        this._cityLevel.getComponent(Label).string = `${this.delegate.cityVo.getCityLevel()}`;
    }
}


