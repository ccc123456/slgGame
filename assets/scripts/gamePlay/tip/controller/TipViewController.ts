import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { TipView } from '../view/TipView';
import { GLOBALZINDEX } from '../../../GameConfig';
const { ccclass, property } = _decorator;

@ccclass('TipViewController')
export class TipViewController extends ViewController {
    static className: string = "TipViewController"
    viewClass: (typeof UIView) = TipView
    viewMode = viewMode.ALERT
    viewDidLoad() {
        super.viewDidLoad()
        this.rootView.setSiblingIndex(GLOBALZINDEX.tips)
    }
    
    getMessageListeners() {
        return {
            SHOWTIPS: (tip: string | { tip: string, errorEffect: boolean }) => {
                !tip && (tip += "")

                if (typeof tip === "string") {
                    this.viewDoAction("showTips", tip)
                    return
                }

                this.viewDoAction("showTips", tip.tip)
             }
        };
    };

}


