/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: PlaerModel.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Fri May 29 2026 11:14:58 GMT+0800 (中国标准时间) 
 **********************************************/


import { _decorator, Component, Node } from 'cc';
import Model from '../../../frameWork/data/Model';
import { PlayerInfo, ScPlayerLogin, scPlayerLoginId } from 'db://assets/resource/proto/MessagePlayer';
const { ccclass, property } = _decorator;

@ccclass('PlaerModel')
export default class PlayerModel extends Model {
    static modelName: string = "PlayerModel";

    private name: string = ""
    private playerInfo: PlayerInfo = null

    getMessageListeners() {
        return {}
    }

    initPush() {
        this.addResponeHandler(scPlayerLoginId, (msg: any) => {
            let data: ScPlayerLogin = ScPlayerLogin.decode(msg.payload)
            this.synchronize(data)
        })
    }

    public synchronize(data: ScPlayerLogin) {
        this.playerInfo = data.playerInfo
    }

    getName() {
        return this.playerInfo ? this.playerInfo.playerName : ""
    }

    getLegionId() {
        return this.playerInfo ? this.playerInfo.legionId : ''
    }

    getLevel() {
        return this.playerInfo ? this.playerInfo.lv : 1
    }

    getWorldLevel() {
        return this.playerInfo ? this.playerInfo.worldLv : 1
    }
}


