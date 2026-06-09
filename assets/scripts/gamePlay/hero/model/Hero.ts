import { _decorator } from 'cc';
import DataReader from '../../../frameWork/data/DataReader';
import { Attribute, HeroInfo } from 'db://assets/resource/proto/structure';
import { camps, jobs } from './HeroModel';
import { ExcelStrToArr } from '../../../frameWork/utils/CommonUtils';
const { ccclass, property } = _decorator;

//武将状态
export const enum heroState {
    canGet = 0,   //可激活
    get = 1, //激活
    noGet = 2, //未激活
}

export interface skillData {
    skillId: string,
    skillLv: number
}

export interface qualityCost {
    itemId: string,
    itemCount: number,
    needLv: number
}

//升阶界面状态
export const enum heroQuailtyState {
    quality = 1,   //可升阶
    train = 2, //训练
    mop = 3, //扫荡
}

export interface starShowAtt {
    attId: string,
    curAttValue: number
    endAttValue: number
}

export interface starShowAttItem {
    attId: string,
    attValue: number
}

export interface heroActivateItem {
    itemId: string,
    itemCount: number
}

export default class Hero {
    private id: string = null
    private config: { [key: string]: any } = {}
    private heroServer: HeroInfo

    constructor(id: string) {
        this.id = id
        this.initConfig()
    }

    public getId() {
        return this.id
    }

    private initConfig() {
        this.config = DataReader.requireRecordById("Hero", this.id)
        // cc.log(" this.config = ", JSON.stringify(this.config))
    }

    public synchronize(data: HeroInfo) {
        this.heroServer = data
    }

    public getStar() {
        return this.heroServer ? this.heroServer.star : this.config.star
    }

    public getLevel() {
        return this.heroServer ? this.heroServer.lv : 1
    }

    public getName() {
        return this.config.name
    }

    public getAttValue(attId) {
        if (this.heroServer) {
            for (let index = 0; index < this.heroServer.attributes.length; index++) {
                let attribute: Attribute = this.heroServer.attributes[index];
                if (attribute.attrKey == attId) {
                    return attribute.attrValue
                }
            }
            return 0
        }
        return 0
    }

    //粮草 根据战力计算
    public getAttFodder() {
        let _pwer = Number(this.getPower())
        return Math.floor(_pwer / 10)
    }

    public getListIconPath() {
        //先根据性别取
        let iconName = `heroList${this.config.sex}`
        let iconPath = `hero/${iconName}`
        return iconPath
    }

    public getIconPath() {
        //先根据性别取
        let iconName = `hero${this.config.sex}`
        let iconPath = `hero/${iconName}`
        return iconPath
    }

    public getCampName() {
        let _camp = this.config.country;
        for (let index = 0; index < camps.length; index++) {
            if (camps[index].type == _camp) {
                return camps[index].name
            }
        }
        return ''
    }

    public getJob() {
        return this.config.job
    }

    public getJobName() {
        return jobs[this.getJob()].name
    }

    public getJobIconPath() {
        let iconName = jobs[this.getJob()].icon
        let iconPath = `itemIcon/${iconName}`
        return iconPath
    }

    public getQuality() {
        return this.config.showPotential
    }

    public getRank() {
        return this.heroServer ? this.heroServer.rank : 1
    }

    public getQialityId() {
        let qualityTab = DataReader.getDataTable("HeroQuality")
        let job = this.getJob()
        let rank = this.getRank()
        for (const key in qualityTab) {
            let starConfig = qualityTab[key]
            if (starConfig.job == job && starConfig.rank == rank) {
                return key
            }
        }
        return ''
    }

    public getTrainState() {
        return this.heroServer && this.heroServer.train1
            && this.heroServer.train2
            && this.heroServer.train3
            && this.heroServer.train4
    }

    public getNeedSoul() {
        return this.config.needSoul
    }

    public getStarNeedCount(): number {
        let star = this.getStar()
        let potential = this.config.potential;
        let starTab = DataReader.getDataTable("HeroStar")
        for (const key in starTab) {
            let starConfig = starTab[key]
            if (starConfig.star == star && starConfig.potential == potential) {
                let endStarId = Number(key) + 1
                let endStarConfig = DataReader.requireRecordById("HeroStar", `${endStarId}`)
                return endStarConfig.consumeSoul
            }
        }
        return 0
    }

    public getStarConfigId(): string {
        let star = this.getStar()
        let potential = this.config.potential;
        let starTab = DataReader.getDataTable("HeroStar")
        for (const key in starTab) {
            let starConfig = starTab[key]
            if (starConfig.star == star && starConfig.potential == potential) {
                return key
            }
        }
        return ''
    }

    public isMaxStar() {
        let starId = this.getStarConfigId()
        let curStarConfig = DataReader.requireRecordById("HeroStar", starId)
        let endStarId = Number(starId) + 1
        let endStarConfig = DataReader.requireRecordById("HeroStar", `${endStarId}`)
        return endStarConfig.potential != curStarConfig.potential
    }

    //升星预览界面展示显示前3个
    public getStarShowAtts(): starShowAtt[] {
        let atts: starShowAtt[] = []
        let starId = this.getStarConfigId()
        let curStarConfig = DataReader.requireRecordById("HeroStar", starId)
        let endStarId = Number(starId) + 1
        let endStarConfig = DataReader.requireRecordById("HeroStar", `${endStarId}`)
        let addAttArr = curStarConfig.starAddAttribute.split(",")
        let endAddAttArr = endStarConfig.starAddAttribute.split(",")
        for (let index = 0; index < 3; index++) {
            let attArr = ExcelStrToArr(addAttArr[index])
            let endattArr = ExcelStrToArr(endAddAttArr[index])
            let addattItem: starShowAtt = {
                attId: attArr[0],
                curAttValue: Number(attArr[1]),
                endAttValue: Number(endattArr[1])
            }
            atts.push(addattItem)
        }
        return atts
    }

    //升星成功界面展示
    public getStarSuccessShowAtts(): starShowAtt[] {
        let atts: starShowAtt[] = []
        let starId = this.getStarConfigId()
        let beforStarId = Number(starId) - 1
        let curStarConfig = DataReader.requireRecordById("HeroStar", starId)
        let beforStarConfig = DataReader.requireRecordById("HeroStar", `${beforStarId}`)
        let addAttArr = curStarConfig.starAddAttribute.split(",")
        let beforAddAttArr = beforStarConfig.starAddAttribute.split(",")
        for (let index = 0; index < beforAddAttArr.length; index++) {
            let beforattArr = ExcelStrToArr(beforAddAttArr[index])
            let endattArr = ExcelStrToArr(addAttArr[index])
            let addattItem: starShowAtt = {
                attId: beforattArr[0],
                curAttValue: Number(beforattArr[1]),
                endAttValue: Number(endattArr[1])
            }
            atts.push(addattItem)
        }
        return atts
    }

    public getTarinStateByIndex(index) {
        return this.heroServer && this.heroServer[`train${index}`]
    }


    public getQualityCost() {
        let costs: qualityCost[] = []
        let qualityId = this.getQialityId();
        let qualityCofig = DataReader.requireRecordById("HeroQuality", `${qualityId}`);
        let equPolicyConfig = DataReader.requireRecordById("HeroEquPolicy", qualityCofig.policy)
        for (let index = 0; index < 4; index++) {
            let equStr = equPolicyConfig[`equ${index + 1}`]
            let equArr = ExcelStrToArr(equStr);
            let itemId = equArr[1];
            let itemCount = equArr[2]
            let needLv = equPolicyConfig[`lv${index + 1}`]
            let _qualityCost: qualityCost = {
                itemId: itemId,
                itemCount: Number(itemCount),
                needLv: needLv
            }
            costs.push(_qualityCost)
        }
        return costs
    }

    public getDutyProfession() {
        return this.config.dutyProfession
    }

    public getSkillData(): skillData[] {
        let skills: skillData[] = []
        for (let index = 0; index < 4; index++) {
            let skIndex = index + 1
            let skillId = this.config[`sk${skIndex}`]
            if (skillId) {
                let serLv = 0
                if (this.heroServer) {
                    serLv = this.getServerSkillLV(Number(skillId))
                }
                let skVo: skillData = {
                    skillId: skillId,
                    skillLv: serLv
                }
                skills.push(skVo)
            }
        }
        return skills
    }

    getServerSkillLV(skillId: number) {
        let skillInfo = this.heroServer.skillInfo
        if (skillInfo) {
            for (let index = 0; index < skillInfo.length; index++) {
                if (skillInfo[index].skillId == skillId) {
                    //技能等级就是角色等级
                    return this.getLevel()//skillInfo[index].skillLv
                }
            }
        }
        return 0
    }

    public getPower() {
        return this.heroServer ? Number(this.heroServer.power) : 0
    }

    public getAtivateNeedCount(): heroActivateItem {
        let itemId = this.config.needSoul;
        let heroInitStar = this.config.star;
        let herOpotential = this.config.potential;
        let count = 0;
        let starTab = DataReader.getDataTable("HeroStar")
        for (const key in starTab) {
            let starConfig = starTab[key]
            if (starConfig.star == heroInitStar && starConfig.potential == herOpotential) {
                count = starConfig.consumeSoul
            }
        }

        let items: heroActivateItem = {
            itemId: itemId,
            itemCount: count
        }
        return items
    }
}


