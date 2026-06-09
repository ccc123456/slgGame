import { _decorator, Component, Node } from 'cc';
import DataReader from '../../../frameWork/data/DataReader';
import { CityInfo } from 'db://assets/resource/proto/structure';
const { ccclass, property } = _decorator;


export const enum cityState {
    peace = 0,   //和平
    fighting = 1, //争夺
    immune = 3, //免战
    declaring = 2, //宣战
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
        return this.id
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

    getClubId() {
        return ''
    }

    getClubIcon() {
        return ''
    }

    getClubName() {
        return ""
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

    getCityCount() {
        return 30
    }

    getCityLevel() {
        return 30
    }
}


