import { _decorator, Component, EditBox, find, instantiate, Label, Node } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { DebugBoxViewController } from '../controller/DebugBoxViewController';
const { ccclass, property } = _decorator;

@ccclass('DebugBoxView')
export class DebugBoxView extends UIView {
    static className: string = "DebugBoxView"
    delegate: DebugBoxViewController
    protected static prefabUrl: string = "ui/debugBox/DebugBox"

    private _bg: Node = null
    private _TabScrollContent: Node = null
    private _tabItem: Node = null
    private _subTabScrollContent: Node = null
    private _content: Node = null;
    private _contentItem: Node = null
    private _sureBtn: Node = null

    private _tab1: number = 0
    private _tab2: number = 0;

    onLoad() {
        super.onLoad()
        this._bg = this.node.getChildByName("bg")
        this.registbuttonClick(this._bg, () => {
            this.delegate.disable()
        })
        this._TabScrollContent = find("TabScroll/view/content", this.node)
        this._tabItem = this.node.getChildByName("tabItem")
        this._tabItem.active = false
        this._subTabScrollContent = find("subTabScroll/view/content", this.node)
        this._content = this.node.getChildByName("content");
        this._contentItem = this.node.getChildByName("contentItem")
        this._contentItem.active = false
        this._sureBtn = this.node.getChildByName("sureNode")
        this.registbuttonClick(this._sureBtn, () => {
            let str = '';
            this._content.children.forEach((node) => {
                let edit = node.getChildByName("edit")
                let editStr = edit.getComponent(EditBox).string || edit.getComponent(EditBox).placeholder
                if (str == '') {
                    str += `${editStr}`
                } else {
                    str += `_${editStr}`
                }
            })
            this.delegate.debugHandler(str)
        })
        this.node.name
        console.log("---- debug index" + this.node.getSiblingIndex());
    }

    updateView() {
        this.refreshPageBtns()
    }

    clearTab() {
        this._tab1 = 0;
        this._tab2 = 0;
    }

    refreshPageBtns() {
        this.delegate.resetPageKey(this._tab1)
        this.updatgeToggleState()
        this.refreshSubPageView()
        this.refreshSubPageBtns()
    }

    updatgeToggleState() {
        this._TabScrollContent.children.forEach((node) => {
            node.getChildByName("choseBg").active = node['data'] == this._tab1
        })
    }

    // 一级 page 
    initView() {
        let pageIds = this.delegate.getPageIds()
        let length = pageIds.length
        for (let i = 0; i < length; i++) {
            const str = pageIds[i];
            let node = instantiate(this._tabItem)
            node.active = true
            node.parent = this._TabScrollContent
            node['data'] = i

            let btn = node.getChildByName("text")
            btn.getComponent(Label).string = str

            this.registbuttonClick(node, () => {
                this._tab1 = node['data'];
                this.refreshPageBtns()
            })

        }
    }

    updatgeSubToggleState() {
        this._subTabScrollContent.children.forEach((node) => {
            node.getChildByName("choseBg").active = node['data'] == this._tab2
        })
    }

    // 二级 page
    refreshSubPageView() {
        // this._subPageBtns = []
        let list = this.delegate.getSubList()

        this._subTabScrollContent.destroyAllChildren()

        let length = list.length
        for (let i = 0; i < length; i++) {
            const str = list[i];
            let node = instantiate(this._tabItem)
            node.active = true
            node.parent = this._subTabScrollContent
            node['data'] = i

            let btn = node.getChildByName("text")
            btn.getComponent(Label).string = str

            this.registbuttonClick(btn, () => {
                this._tab2 = node['data']
                this.refreshSubPageBtns()
            }, btn)
        }
    }
    refreshSubPageBtns() {
        this.updatgeSubToggleState()
        this.delegate.resetSubPageKey(this._tab2)
        this.refreshContent()
    }

    refreshContent() {
        let config = this.delegate.getSubConfig()
        let configs = config.config
        config.cmdName
        console.log(config);
        this._content.destroyAllChildren();
        for (let index = 0; index < configs.length; index++) {
            let conItem = instantiate(this._contentItem);
            conItem.active = true
            this._content.addChild(conItem)
            let title = conItem.getChildByName("title")
            title.getComponent(Label).string = configs[index].title;
            //edit
            let edit = conItem.getChildByName("edit")
            edit.getComponent(EditBox).placeholder = configs[index].default
        }
    }

}


