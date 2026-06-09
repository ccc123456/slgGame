import { isValid, Label, Node, Sprite, SpriteFrame } from "cc"
import ViewController from "../../frameWork/controller/ViewController"
import BaseUI from "../../frameWork/ui/BaseUI"

class IconFactory {

    /**
     * @desc add spriteFrame for node
     * @param path 资源路径
     * @param node 目标 node
     * @param controller node 所在的 ViewController，主要用于资源管理
     * @param sizemodeType sizemode类型
     */
    public async decorateNodeWithSpriteFrame(path: string, node: Node, controller: ViewController | BaseUI, isAtlas: boolean = false,
        sizemodeType = Sprite.SizeMode.RAW, callback?: Function, clone?: boolean) {
        let sprite = node.getComponent(Sprite) || node.addComponent(Sprite)
        sprite.sizeMode = sizemodeType
        sprite.trim = false
        path += `/spriteFrame`
        let spriteFrame = <SpriteFrame>await (isAtlas ? controller.getUISpriteFrame(path) : controller.getRes(path, SpriteFrame))
        if (!isValid(node, true)) {
            return
        }
        if (spriteFrame) {
            sprite.spriteFrame = clone ? spriteFrame.clone() : spriteFrame;
        }
        callback && callback()
    }
    /**
    * @desc add spriteFrame for node
    * @param path 资源路径
    * @param node 目标 node
    * @param controller node 所在的 ViewController，主要用于资源管理
    * @param sizemodeType sizemode类型
    * LegionBaseInfo.flagId, LegionBaseInfo.banner
    */
    public createLegionIcon(legionFlag: number, flagName: string, controller: ViewController | BaseUI) {
        let node = new Node();
        let flagIconPath = `flagIcon/flagIcon${legionFlag}`
        this.decorateNodeWithSpriteFrame(flagIconPath, node, controller)
        //增加name
        let nameNode = new Node();
        node.addChild(nameNode);
        let nameLab = nameNode.getComponent(Label) || nameNode.addComponent(Label);
        nameLab.getComponent(Label).string = flagName
        return node
    }

}


export default new IconFactory();


