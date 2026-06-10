import { _decorator, Component, Node } from 'cc';
import Model from '../../../frameWork/data/Model';
const { ccclass, property } = _decorator;


interface DebugParams {
    cmdname?: string,
    config?: {
        title?: string,
        key?: string,
        default?: string | number
        type?: string,// Input：可编辑模式;Label 为纯显示文本;Callback 指定回调 localInput 本地输入调试
        callback?: Function
    }[],
}

@ccclass('DebugBoxModel')
export class DebugBoxModel extends Model {
    static modelName: string = "DebugBoxModel";

    private _pageIds: string[] = []
    private _subPageIds: { [key: string]: any } = {}
    private _config: { [key: string]: any } = {}

    constructor() {
        super()

        // 一级
        this._pageIds = ["道具", "角色", "城战"]
        // 二级
        this._subPageIds = {
            "道具": ['增加道具'],
            "角色": ["增加角色", "提升角色等级"],
            "城战": ['解锁城池'],
        }
        // 实际发送数据
        this._config = {
            "增加道具": this.getAddItem(),
            "增加角色": this.getAddHero(),
            "提升角色等级": this.getUpHeroLv(),
            "解锁城池": this.getunLockCity(),

        }
    }

    private getAddItem(): DebugParams {
        return {
            cmdname: "ADD_ITEM",
            config: [
                {
                    title: "道具类型：1货币 3道具 4公共货币(军资)",
                    default: "3"
                },
                {
                    title: "道具id：",
                    key: "source_id",
                    default: "10000"
                },
                {
                    title: "添加数量：",
                    key: "source_quantity",
                    default: 100
                }
            ],
        }
    }


    private getAddHero(): DebugParams {
        return {
            cmdname: "ACTIVATE_HERO",
            config: [
                {
                    title: "英魂id：（-1增加所有角色）",
                    default: "1001"
                },
            ]
        }
    }

    private getUpHeroLv(): DebugParams {
        return {
            cmdname: "UPGRADE_HERO_LEVEL",
            config: [
                {
                    title: "英魂id：",
                    default: "1001"
                },
                {
                    title: "等级",
                    default: 100
                },
            ]
        }
    }

     private getunLockCity(): DebugParams {
        return {
            cmdname: "UNLOCK_CITY",
            config: [
                {
                    title: "城池id：（id之前的城池都会解锁）",
                    default: "1"
                },
            ]
        }
    }

    public getPageIds() {
        return this._pageIds
    }

    public getSubPageIdsById(pageId: string) {
        return this._subPageIds[pageId]
    }


    public getConfigById(subPageId: string) {
        return this._config[subPageId]
    }

}


