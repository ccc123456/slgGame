/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: PlaerModel.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Fri May 29 2026 11:14:58 GMT+0800 (中国标准时间) 
 **********************************************/


import { _decorator, Component, Node } from 'cc';
import Model from '../../../frameWork/data/Model';
import { PlayerInfo, ScPlayerLogin, scPlayerLoginId, ScUpdateCurrency, scUpdateCurrencyId } from 'db://assets/resource/proto/MessagePlayer';
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
        this.addResponeHandler(scUpdateCurrencyId, (msg: any) => {
            let data: ScUpdateCurrency = ScUpdateCurrency.decode(msg.payload)
            //更新货币
            if (data.ingot) {
                this.playerInfo && (this.playerInfo.ingot = data.ingot)
            }
            if (data.copperCoin) {
                this.playerInfo && (this.playerInfo.ingot = data.copperCoin)
            }
            if (data.provisions) {
                this.playerInfo && (this.playerInfo.ingot = data.provisions)
            }
            if (data.exploit) {
                this.playerInfo && (this.playerInfo.ingot = data.exploit)
            }
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

    getProvisions() {
        return this.playerInfo ? this.playerInfo.provisions : 0
    }
}


