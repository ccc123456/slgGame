import { _decorator } from 'cc';
import { CsApplyJoinLegion, csApplyJoinLegionId, CsCreateLegion, csCreateLegionId, CsGetLegionInfo, csGetLegionInfoId, CsGetLegionList, csGetLegionListId, CsUpgradeLegion, csUpgradeLegionId, ScApplyJoinLegion, ScCreateLegion, ScGetLegionInfo, ScGetLegionList, ScGetPlayerLegionInfo, scGetPlayerLegionInfoId, ScUpgradeLegion } from 'db://assets/resource/proto/MessageLegion';
import { LegionInfo, LegionListInfo, LegionMemberInfo } from 'db://assets/resource/proto/structure';
import Model from '../../../frameWork/data/Model';
import PlayerModel from '../../home/mode/PlayerModel';
const { ccclass, property } = _decorator;


//权限
export const enum LegionPermissions {
    dissolve = 1,   //解散军团
    change = 2,   //修改军团名称/军旗/军号
    recruitment = 3,   //世界招募
    announcement = 4,   //修改军团公告
    mail = 5,   //群发军团邮件
    condition = 6,   //修改入团条件
    apply = 7,   //入团申请批准
    dismiss = 8,   //开除团员
    upgrade = 9,   //升级军团
    declarationWar = 10,   //宣战
    mobilizeTroops = 11,   //大营调兵
    giveUp = 12,   //放弃军团城池
    position = 13,   //设置军团职位
}


@ccclass('LegionModel')
export class LegionModel extends Model {
    static modelName: string = "LegionModel";

    private legionAddList: LegionListInfo[] = []
    private legionInfo: LegionInfo = null
    private legionMemberInfo: LegionMemberInfo

    getMessageListeners() {
        return {}
    }

    initPush(): void {
        this.addResponeHandler(scGetPlayerLegionInfoId, (msg: any) => {
            let data: ScGetPlayerLegionInfo = ScGetPlayerLegionInfo.decode(msg.payload)
            this.legionMemberInfo = data.legionMemberInfo
        })
    }

    getLegionMemberInfo() {
        return this.legionMemberInfo
    }

    getOwnLegionInfo() {
        return this.legionInfo
    }

    public synchronize(data: LegionInfo): void {
        this.legionInfo = data
    }

    public synchronizeList(data: ScGetLegionList): void {
        this.legionAddList = data.legionInfos
    }

    //获取军团信息
    getLegionInfo(legionId: string, callBack?: Function) {
        let csGetLegionInfo: CsGetLegionInfo = {
            legionId: legionId
        }
        let csGetLegioninfoCre = CsGetLegionInfo.create(csGetLegionInfo)
        let csGetLegioninfobuff = CsGetLegionInfo.encode(csGetLegioninfoCre).finish()

        this.request(csGetLegioninfobuff, csGetLegionInfoId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScGetLegionInfo = ScGetLegionInfo.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            let playerModel: PlayerModel = <PlayerModel>PlayerModel.getInstance()
            if (playerModel.getLegionId() == legionId) {
                this.synchronize(plater.legionInfo)   //数据同步
            }
            console.log("解包后的数据", plater)
            callBack && callBack()
        })
    }


    //获取军团列表
    getLegionAllList(callBack?: Function) {
        let playerLogin: CsGetLegionList = {}
        // protobuf

        let csGetLegionList = CsGetLegionList.create(playerLogin)
        let legionListbuffer = CsGetLegionList.encode(csGetLegionList).finish()

        this.request(legionListbuffer, csGetLegionListId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScGetLegionList = ScGetLegionList.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.synchronizeList(plater)   //数据同步
            console.log("解包后的数据", plater)
            callBack && callBack()
        })
    }

    //创建军团
    createLegion(nameStr: string, bannerStr: string, flagId: number, callBack?: Function) {
        let createLegion: CsCreateLegion = {
            name: nameStr,
            banner: bannerStr,
            flagId: flagId
        }
        let cerateLegion = CsCreateLegion.create(createLegion)
        let cerateLegionbuffer = CsCreateLegion.encode(cerateLegion).finish()
        this.request(cerateLegionbuffer, csCreateLegionId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScCreateLegion = ScCreateLegion.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.synchronize(plater.legionInfo)   //数据同步
            console.log("解包后的数据", plater)
            callBack && callBack()
        })

    }

    getLegionList() {
        return this.legionAddList
    }

    //升级
    upLegion(legionId: string, callBack?: Function) {
        let csUpgradeLegion: CsUpgradeLegion = {
            legionId: legionId
        }
        let csUpgradeUp = CsUpgradeLegion.create(csUpgradeLegion)
        let csUpgradeUpbuff = CsUpgradeLegion.encode(csUpgradeUp).finish()

        this.request(csUpgradeUpbuff, csUpgradeLegionId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScUpgradeLegion = ScUpgradeLegion.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            let playerModel: PlayerModel = <PlayerModel>PlayerModel.getInstance()
            if (playerModel.getLegionId() == legionId) {
                this.synchronize(plater.legionInfo)   //数据同步
            }
            console.log("解包后的数据", plater)
            callBack && callBack()
        })

    }

    //申请军团
    applyLegion(legionId: string, callBack?: Function) {
        let csApplyLegion: CsApplyJoinLegion = {
            legionId: legionId
        }
        let csApplyUp = CsApplyJoinLegion.create(csApplyLegion)
        let csApplybuff = CsApplyJoinLegion.encode(csApplyUp).finish()

        this.request(csApplybuff, csApplyJoinLegionId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScApplyJoinLegion = ScApplyJoinLegion.decode(msg.payload)     //用proto 二进制消息转换成对象
            console.log("解包后的数据", plater)
            callBack && callBack()
        })

    }
}


