import { _decorator } from 'cc';
import Model from '../../../frameWork/data/Model';
import Hero, { heroState } from './Hero';
import { HeroInfo } from 'db://assets/resource/proto/structure';
import DataReader from '../../../frameWork/data/DataReader';
import { ScGetPlayerHeroes, scGetPlayerHeroesId } from 'db://assets/resource/proto/MessageHero';
const { ccclass, property } = _decorator;

export const camps = [{ name: "全", sort: 1, type: -1 },
{ name: "魏", sort: 2, type: 1 },
{ name: "蜀", sort: 3, type: 2 },
{ name: "吴", sort: 4, type: 3 },
{ name: "群", sort: 5, type: 4 }
]

export const jobs = {
    1: { name: "盾", icon: "dun" },
    2: { name: "弓", icon: "gong" },
    3: { name: "骑", icon: "qi" },
    4: { name: "谋", icon: "mou" },
    5: { name: "枪", icon: "qiang" }
}

//获取所有武将数据的类型    控制排序
export const enum HerosState {
    teamCity = 1,   //城战编队
}


export const HeroCultivateShowAtt = [803, 804, 805]
@ccclass('HeroModel')
export class HeroModel extends Model {
    static modelName: string = "HeroModel";
    private _heroes: { [key: string]: Hero } = {}   //所有已经获得的武将
    public heroAllIds: string[] = [];

    private _selectHeroId: string = ""  //选择的角色
    getMessageListeners() {
        return {}
    }

    initPush() {
        this.addResponeHandler(scGetPlayerHeroesId, (msg: any) => {
            let data: ScGetPlayerHeroes = ScGetPlayerHeroes.decode(msg.payload)
            this.synchronize(data)
        })
    }

    public synchronize(data: ScGetPlayerHeroes) {
        super.synchronize(data)

        let heros = data.heroInfos || []
        for (let index = 0; index < heros.length; index++) {
            let heroInfo: HeroInfo = heros[index]
            this.addHero(heroInfo)
        }
    }

    addHero(heroInfo: HeroInfo) {
        let heroVo: Hero = this._heroes[heroInfo.heroTableId]
        if (!heroVo) {
            heroVo = new Hero(`${heroInfo.heroTableId}`)
            this._heroes[heroInfo.heroTableId] = heroVo
        }
        heroVo.synchronize(heroInfo)
    }


    updateHero(heroid: string, data: HeroInfo) {
        let heroVo: Hero = this._heroes[heroid]
        if (heroVo) {
            heroVo.synchronize(data)
        }
    }

    public udpateHeroIds(_type: number = -1) {
        this.heroAllIds = []
        let tab = DataReader.getDataTable("Hero")
        for (const key in tab) {
            let heroBaConfig = DataReader.requireRecordById("Hero", key);
            if (heroBaConfig.isShow == 1) {
                if (_type == -1) {
                    this.heroAllIds.push(key)
                } else {
                    if (_type == heroBaConfig.country) {
                        this.heroAllIds.push(key)
                    }
                }
            }
        }
        //排序
        this.heroAllIds.sort((a: string, b: string) => {
            //状态 可激活＞已激活＞未激活
            let aConfig = DataReader.requireRecordById("Hero", a)
            let bConfig = DataReader.requireRecordById("Hero", b)
            let aHero = this.getHero(a)
            let bHero = this.getHero(b)
            let aHeroState = aHero ? heroState.get : heroState.noGet
            let bHeroState = bHero ? heroState.get : heroState.noGet
            if (aHeroState != bHeroState) {
                return aHeroState - bHeroState
            }
            //战力
            let aPower = aHero ? aHero.getPower() : 0
            let bPower = bHero ? bHero.getPower() : 0
            if (aPower != bPower) {
                return bPower - aPower
            }
            //资质
            let aPotemtoal = aConfig.potential
            let bPotemtoal = bConfig.potential
            if (aPotemtoal != bPotemtoal) {
                return bPotemtoal - aPotemtoal
            }
            //国际
            let aCountry = aConfig.country
            let bCountry = bConfig.country
            if (aCountry != bCountry) {
                return aCountry - bCountry
            }
        })
    }

    public getHeros(state: HerosState): Hero[] {
        let heros: Hero[] = [];
        for (const key in this._heroes) {
            heros.push(this._heroes[key])
        }
        switch (state) {
            case HerosState.teamCity:
                this.cityHeroSort(heros)
                break;

            default:
                break;
        }
        return heros
    }

    cityHeroSort(heros: Hero[]) {
        heros.sort((a: Hero, b: Hero) => {
            //战力
            if (a.getPower() != b.getPower()) {
                return a.getPower() - b.getPower()
            }
            //派遣城池
            if (a.getDispatchToCityId() != b.getDispatchToCityId()) {
                return a.getDispatchToCityId() - b.getDispatchToCityId()
            }
        })
    }

    public getHero(heroId): Hero {
        return this._heroes[heroId]
    }

    public setSelectHeroId(id: string) {
        this._selectHeroId = id
    }

    public getSelectHeroId() {
        return this._selectHeroId
    }

    public getHeroGetIds() {
        let getids: string[] = []
        for (let index = 0; index < this.heroAllIds.length; index++) {
            let _id = this.heroAllIds[index]
            if (this.getHero(this.heroAllIds[index])) {
                getids.push(_id)
            }
        }
        return getids
    }

    public reduceSelectHeroId() {
        let changeIndex = -1
        let changIds = this.getHeroGetIds()
        for (let index = 0; index < changIds.length; index++) {
            if (changIds[index] == this._selectHeroId) {
                changeIndex = index
                break
            }
        }
        if (changeIndex == 0) {
            changeIndex = changIds.length - 1
        } else {
            changeIndex--
        }
        this.setSelectHeroId(changIds[changeIndex])
    }

    public addSelectHeroId() {
        let changeIndex = -1
        let changIds = this.getHeroGetIds()
        for (let index = 0; index < changIds.length; index++) {
            if (changIds[index] == this._selectHeroId) {
                changeIndex = index
                break
            }
        }
        if (changeIndex == changIds.length - 1) {
            changeIndex = 0
        } else {
            changeIndex++
        }

        this.setSelectHeroId(changIds[changeIndex])
    }
}


