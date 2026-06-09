/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: Adapter.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Fri May 29 2026 15:45:19 GMT+0800 (中国标准时间) 
 **********************************************/


export enum AdjustTpye {
    LEFT = 1,
    RIGHT = LEFT << 1,
    TOP =  LEFT << 2,
    BOTTOM =  LEFT << 3,
    ALL = LEFT|RIGHT|TOP|BOTTOM
}
import { _decorator, Canvas, Component, director, mat4, Node, rect, UITransform, v2, Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Adapter')
export default class Adapter extends Component {
    static _offset = v2(0,0);
    //节点适配
    static adjustForType(node: Node, tpye: AdjustTpye) {
        let widget = node.getComponent(Widget)
        if (!widget) {
            widget = node.addComponent(Widget)
        }

        let curScene = director.getScene()
        let canvas = curScene.getChildByName('Canvas')
        let carme = canvas.getChildByName('Camera');
        let rootNode = carme.getChildByName("rootNode")
        // let rootNode = cc.Canvas.instance.node.getChildByName("rootNode")

        //这里其实可以直接加偏移的，但是为了在机制上统一，所以也就直接借用widget了
        let size = node.getComponent(UITransform).contentSize
        let anchorPoint = node.getComponent(UITransform).anchorPoint
        let width = size.width;
        let height = size.height;
        let box = rect(
            -anchorPoint.x * width,
            -anchorPoint.y * height,
            width,
            height);
        box.transformMat4(node.getWorldMatrix(mat4()))


        let canvasSize = canvas.getComponent(UITransform).contentSize

        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE
        widget.isAlignTop = (tpye & AdjustTpye.TOP) == AdjustTpye.TOP
        widget.isAlignBottom = (tpye & AdjustTpye.BOTTOM) == AdjustTpye.BOTTOM
        widget.isAlignLeft = (tpye & AdjustTpye.LEFT) == AdjustTpye.LEFT
        widget.isAlignRight = (tpye & AdjustTpye.RIGHT) == AdjustTpye.RIGHT
        widget.isAbsoluteBottom = widget.isAbsoluteTop = widget.isAbsoluteLeft = widget.isAbsoluteRight = true

        widget.left = 0//box.xMin - Adapter._offset.x
        widget.bottom = 0//box.yMin - Adapter._offset.y
        widget.right = 0//canvasSize.width - box.xMax - Adapter._offset.x
        widget.top = 0//canvasSize.height - box.yMax - Adapter._offset.y
        //可以尝试判断上下拉伸的情况 忽略top安全区域,防止列表类受上安全区域导致列表缩放过大
        if (widget.isAlignTop && tpye != AdjustTpye.ALL) {
            widget.top -= rootNode.getComponent(Widget).top
        }
        widget.target = rootNode
        widget.updateAlignment()
    }

}


