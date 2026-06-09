import { _decorator, EventTouch, Node, UITransform, Vec3 } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { DebugBoxView } from '../view/DebugBoxView';
import { DebugBoxModel } from '../mode/DebugBoxModel';
import IconFactory from '../../base/IconFactory';
import { CsGmCmd, csGmCmdId } from 'db://assets/resource/proto/MessageCommon';
import EventManager from '../../../frameWork/manager/EventManager';
import { GLOBALZINDEX, SHOWTIPS } from '../../../GameConfig';
const { ccclass, property } = _decorator;

@ccclass('DebugBoxViewController')
export class DebugBoxViewController extends ViewController {
    static className: string = "DebugBoxViewController"
    viewClass: (typeof UIView) = DebugBoxView
    viewMode = viewMode.ALERT
    debugBoxModel: DebugBoxModel = <DebugBoxModel>DebugBoxModel.getInstance()

    public pageKey: string = ""
    public subPageKey: string = ""
    viewDidLoad(): void {
        super.viewDidLoad()
        this.createDebugBox()
        this.disable()
        this.viewDoAction("initView")
    }

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }

    disable(): void {
        super.disable()
    }

    enable(): void {
        super.enable()
        this.viewDoAction("clearTab")
    }


    resetPageKey(index: number) {
        this.pageKey = this.getPageIds()[index]
    }

    getPageIds() {
        return this.debugBoxModel.getPageIds()
    }

    getSubConfig() {
        return this.debugBoxModel.getConfigById(this.subPageKey)
    }
    createDebugBox() {
        let debugBtn = new Node()
        IconFactory.decorateNodeWithSpriteFrame("itemIcon/dun", debugBtn, this)
        let _layer = this.controllerManager.getAlertLayer()
        _layer.addChild(debugBtn)
        debugBtn.x = 450
        debugBtn.y = 800
        debugBtn.on(Node.EventType.TOUCH_END, () => {
            if (!this.isEnable()) {
                this.enable()
            }
        }, debugBtn)
    }

    getSubList() {
        return this.debugBoxModel.getSubPageIdsById(this.pageKey)
    }


    resetSubPageKey(index: number) {
        let list = this.getSubList()
        this.subPageKey = list[index]
    }

    debugHandler(str: string) {
        let config = this.getSubConfig()
        let playerLogin: CsGmCmd = {
            gmCode: config.cmdname,
            params: str
        }
        let cmCreate = CsGmCmd.create(playerLogin)
        let cmLoginbuffer = CsGmCmd.encode(cmCreate).finish()
        this.debugBoxModel.request(cmLoginbuffer, csGmCmdId, (msg) => {
            console.log("收到服务器响应", msg)
            EventManager.emit(SHOWTIPS, "操作成功")
        })
    }
}


