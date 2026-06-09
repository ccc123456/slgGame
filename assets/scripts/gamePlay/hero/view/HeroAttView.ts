import { _decorator, Component, find, instantiate, Label, Node } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { HeroAttViewController } from '../controller/HeroAttViewController';
import DataReader from '../../../frameWork/data/DataReader';
const { ccclass, property } = _decorator;

@ccclass('HeroAttView')
export class HeroAttView extends UIView {
    static className: string = "HeroAttView"
    delegate: HeroAttViewController
    protected static prefabUrl: string = "ui/hero/HeroAtt"

    private _content: Node = null;
    private _attItem: Node = null;


    onLoad() {
        let _bg = this.node.getChildByName("bg");
        this.registbuttonClick(_bg, () => {
            this.delegate.close()
        })
        this._content = this.node.getChildByName("content");
        this._attItem = this.node.getChildByName("attItem")
        this._attItem.active = false
    }

    updateView() {
        this._content.destroyAllChildren()
        let starAttId = 800 //800-813
        for (let index = starAttId; index < 814; index++) {
            let _item = instantiate(this._attItem);
            _item.active = true;
            this._content.addChild(_item)

            let heroProConfig = DataReader.requireRecordById("HeroProperty", `${index}`)
            //name
            let _name = find('attLay/name', _item);
            _name.getComponent(Label).string = heroProConfig.viewShow
            //value
            let _value = find('attLay/value', _item);
            _value.getComponent(Label).string = this.delegate.heroVo.getAttValue(index).toString()
        }
    }

}
