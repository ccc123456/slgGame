import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import { LegionMemberListView } from '../view/LegionMemberListView';
import UIView from '../../../frameWork/ui/UIView';
import { LegionMemberInfo, LegionMemberList, PlayerBaseInfo } from 'db://assets/resource/proto/structure';
import { CsApproveApplication, csApproveApplicationId, CsGetLegionMemberList, csGetLegionMemberListId, CsLegionApplications, csLegionApplicationsId, ScApproveApplication, ScGetLegionMemberList, ScLegionApplications } from 'db://assets/resource/proto/MessageLegion';
import { LegionModel } from '../model/LegionModel';
const { ccclass, property } = _decorator;

@ccclass('LegionMemberListViewController')
export class LegionMemberListViewController extends ViewController {
    static className: string = "HeroViewController"
    viewClass: (typeof UIView) = LegionMemberListView
    viewMode = viewMode.SCENE

    _toggleIndex: number = 0;
    legionModel: LegionModel = <LegionModel>LegionModel.getInstance()

    legionMemberList: LegionMemberList[] = [];
    legionApplicaList: PlayerBaseInfo[] = []

    viewDidShow(rag?: any): void {
        this.updateToggleHandler()
    }

    updateToggleHandler() {
        switch (this._toggleIndex) {
            case 0:
                this.getLegionMemberList(() => {
                    this.viewDoAction("updateView")
                })
                break;
            case 1:
                this.getLegionApplicationsList(() => {
                    this.viewDoAction("updateView")
                })
                break;
        }
    }

    //获取军团成员列表
    getLegionMemberList(callBack?: Function) {
        let legionId = this.legionModel.getLegionMemberId()
        let legionMeList: CsGetLegionMemberList = {
            legionId: legionId,
        }
        // protobuf
        let legionMeListCreate = CsGetLegionMemberList.create(legionMeList)
        let legionMeListBUff = CsGetLegionMemberList.encode(legionMeListCreate).finish()

        this.legionModel.request(legionMeListBUff, csGetLegionMemberListId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScGetLegionMemberList = ScGetLegionMemberList.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.legionMemberList = plater.memberList
            callBack && callBack()
        })
    }

    //获取军团申请列表
    getLegionApplicationsList(callBack?: Function) {
        let legionAppList: CsLegionApplications = {}
        // protobuf
        let legionAppListCreate = CsLegionApplications.create(legionAppList)
        let legionAppListBUff = CsLegionApplications.encode(legionAppListCreate).finish()

        this.legionModel.request(legionAppListBUff, csLegionApplicationsId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScLegionApplications = ScLegionApplications.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.legionApplicaList = plater.playerInfo
            callBack && callBack()
        })
    }

    //申请处理 true 同意 false 拒绝
    approveApplication(playerId: string, approve: boolean) {
        let approveApp: CsApproveApplication = {
            legionId: this.legionModel.getLegionMemberId(),
            applyPlayerId: playerId,
            approved: approve
        }
        // protobuf
        let approveAppCreate = CsApproveApplication.create(approveApp)
        let approveAppBUff = CsApproveApplication.encode(approveAppCreate).finish()

        this.legionModel.request(approveAppBUff, csApproveApplicationId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScApproveApplication = ScApproveApplication.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.updateToggleHandler()
        })
    }
}


