import { _decorator, Component, Node } from 'cc';
import DataReader from '../../../frameWork/data/DataReader';
import { BattleInfo, BattleUnit, CityInfo, LegionBaseInfo } from 'db://assets/resource/proto/structure';
import PlayerModel from '../../home/mode/PlayerModel';
import TimeFactory from '../../base/TimeFactory';
const { ccclass, property } = _decorator;


export const enum cityState {
    peace = 0,   //和平
    fighting = 1, //争夺
    immune = 2, //免战
    declaring = 3, //宣战
}


export const enum cityLockState {
    lock = 1,   //锁定
    unlocktab = 2, //可解锁
    unlock = 3, //解锁
}

export interface teamListData {
    atk?: BattleUnit,
    def?: BattleUnit,
    battle?: boolean,
    battleInfo?: BattleInfo
}


@ccclass('City')
export default class City {
    private id: string = null
    private config: { [key: string]: any } = {}
    private cityServer: CityInfo = null

    constructor(id: string) {
        this.id = id
        this.initConfig()
    }

    private initConfig() {
        this.config = DataReader.requireRecordById("City", this.id)
    }

    public synchronize(data: CityInfo) {
        this.cityServer = data
    }

    getId() {
        return this.cityServer ? this.cityServer.cityId : this.id
    }

    getName() {
        return this.config.name
    }

    getCityPosition() {
        return this.config.cityPosition
    }

    getCityType() {
        return this.config.cityType
    }

    getCityIcon() {
        let cityType = this.getCityType();
        let cityName = `cityIcon${cityType}`
        let iconPath = `cityIcon/${cityName}`
        return iconPath
    }

    getTypeName() {
        let cityType = this.getCityType();
        switch (cityType) {
            case 1:
                return '关隘'
            case 2:
                return '县城'
            case 3:
                return '都城'
            case 4:
                return '皇宫'
        }
        return ""
    }

    //判断城池类型是不是都城
    getTypeIsCapital() {
        let cityType = this.getCityType();
        return cityType == 3
    }

    getLegionBaseInfo(): LegionBaseInfo {
        return this.cityServer ? this.cityServer.ownerLegionInfo : null
    }

    //宣战联盟信息
    getDeclaringLegionInfo() {
        return this.cityServer ? this.cityServer.declaringLegionInfo : null
    }

    getCityWordLv() {
        return this.config.cityWordLv
    }

    //ture 解锁
    getLockState() {
        if (this.cityServer) {
            if (this.cityServer.isUnlock) {
                return cityLockState.unlock
            } else {
                let playerModel: PlayerModel = <PlayerModel>PlayerModel.getInstance()
                let playerLv = playerModel.getLevel()
                let cityWordLv = this.getCityWordLv()
                if (playerLv >= cityWordLv) {
                    return cityLockState.unlocktab
                } else {
                    return cityLockState.lock
                }
            }
        }
        return cityLockState.lock
    }

    getCityStateName() {
        if (this.cityServer) {
            switch (this.cityServer.cityStatus) {
                case cityState.peace:
                    return "和平"
                case cityState.fighting:
                    return "争夺中"
                case cityState.immune:
                    return "免战"
                case cityState.declaring:
                    return "宣战中"
            }
        }
        return "和平"
    }

    getCityState() {
        return this.cityServer ? this.cityServer.cityStatus : cityState.peace
    }

    //进攻的队伍数量
    getAttackCount() {
        return this.cityServer ? this.cityServer.attackCount : 0
    }

    //防守队伍数量
    getDefendCount() {
        return this.cityServer ? this.cityServer.defendCount : 0
    }

    //城防军数量
    getCityGarrisonCount() {
        return this.cityServer ? this.cityServer.garrisonCurrentCount : 0
    }

    getCityCountStr() {
        let cityParConfig = DataReader.requireRecordById("CityParameter", "1")
        let time = cityParConfig.value
        let timeStr = TimeFactory.getTimeMinute(time)
        let cityCurrentCount = this.getCityGarrisonCount()

        return `${cityCurrentCount} (每${timeStr}分钟恢复1支)`
    }

    getCityLevel() {
        let playerModel: PlayerModel = <PlayerModel>PlayerModel.getInstance();
        let worldLv = playerModel.getWorldLevel()
        let cityNpcLvConfig = DataReader.requireRecordById("cityNpcLevel", `${worldLv}`)
        let cityType = this.getCityType();
        return cityNpcLvConfig[`cityLv${cityType}`]
    }

    getBattleInfo(): BattleInfo[] {
        return this.cityServer ? this.cityServer.battleInfo : []
    }

    getLastBattleTime() {
        return this.cityServer ? this.cityServer.battleRemainingTime : 10
    }

    getAttackEmptyCountdown() {
        return this.cityServer ? this.cityServer.attackEmptyCountdown : 0
    }
    
    getStatusChangeTime() {
        return this.cityServer ? this.cityServer.statusChangeTime : 0
    }

}


