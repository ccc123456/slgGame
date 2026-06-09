import { _decorator, Asset, EditBox, instantiate, Node, resources, Sprite } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { LegionCreateViewController } from '../controller/LegionCreateViewController';
import IconFactory from '../../base/IconFactory';
const { ccclass, property } = _decorator;

@ccclass('LegionCreateView')
export class LegionCreateView extends UIView {
    static className: string = "LegionCreateView"
    delegate: LegionCreateViewController
    protected static prefabUrl: string = "ui/legion/LegionCreate"

    private _close: Node = null;
    private _nameEdit: Node = null;
    private _flagNameEdit: Node = null;
    private _flag: Node = null;
    private _flagItem: Node = null
    private _create: Node = null;

    onLoad() {
        let _bg = this.node.getChildByName("bg");
        this.registbuttonClick(_bg, () => {
            this.delegate.close()
        })
        this._close = this.node.getChildByName("close");
        this.registbuttonClick(this._close, () => {
            this.delegate.close()
        })
        this._nameEdit = this.node.getChildByName("nameEdit")
        this._flagNameEdit = this.node.getChildByName("flagEdit")
        this._flag = this.node.getChildByName("flag");
        this._flagItem = this.node.getChildByName("flagItem");
        this._flagItem.active = false
        this._create = this.node.getChildByName("create");
        this.registbuttonClick(this._create, () => {
            let nameEditBox = this._nameEdit.getComponent(EditBox)
            let nameStr = nameEditBox.string || nameEditBox.placeholder

            let flagEditBox = this._flagNameEdit.getComponent(EditBox)
            let flagStr = flagEditBox.string || flagEditBox.placeholder
            this.delegate.createHandler(nameStr, flagStr)
        })
    }

    updateView() {
        this._flag.destroyAllChildren()
        resources.loadDir('flagIcon', Asset, (err, assets) => {
            let flagIndex = 1
            assets.forEach((file) => {
                let fileName = file.name;
                if (fileName) {
                    let _item = instantiate(this._flagItem);
                    _item.active = true;
                    this._flag.addChild(_item)
                    _item[`data`] = flagIndex
                    //icon
                    let _icon = _item.getChildByName("icon");
                    let iconPath = `flagIcon/${fileName}`
                    IconFactory.decorateNodeWithSpriteFrame(iconPath, _icon, this.delegate, false, Sprite.SizeMode.CUSTOM)
                    this.registbuttonClick(_item, (node) => {
                        this.delegate.flagIndex = node.target['data']
                        this.updateFlagChose()
                    })
                    flagIndex++
                }
            })
            this.updateFlagChose()
        });
    }

    updateFlagChose() {
        this._flag.children.forEach((node) => {
            let nodeIndex = node[`data`]
            node.getChildByName("chose").active = nodeIndex == this.delegate.flagIndex
        })
    }
}


