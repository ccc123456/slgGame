import { _decorator } from 'cc';
import { CsGmCmd, csGmCmdId } from 'db://assets/resource/proto/MessageCommon';
import { CsActivateTrain, csActivateTrainId, CsUpgradeJobRank, csUpgradeJobRankId, CsUpgradeLevel, csUpgradeLevelId, CsUpgradeStar, csUpgradeStarId, ScActivateTrain, ScUpgradeJobRank, ScUpgradeLevel } from 'db://assets/resource/proto/MessageHero';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import DataReader from '../../../frameWork/data/DataReader';
import EventManager from '../../../frameWork/manager/EventManager';
import UIView from '../../../frameWork/ui/UIView';
import { SHOWTIPS } from '../../../GameConfig';
import PlayerModel from '../../home/mode/PlayerModel';
import Hero from '../model/Hero';
import { HeroModel } from '../model/HeroModel';
import { HeroCultivateView } from '../view/HeroCultivateView';
import { HeroAttViewController } from './HeroAttViewController';
import { HeroStarSuccessViewController } from './HeroStarSuccessViewController';
const { ccclass, property } = _decorator;

@ccclass('HeroCultivateViewController')
export class HeroCultivateViewController extends ViewController {
    static className: string = "HeroCultivateViewController"
    viewClass: (typeof UIView) = HeroCultivateView
    viewMode = viewMode.SCENE

    heromodel: HeroModel = <HeroModel>HeroModel.getInstance()
    viewDidLoad(): void {

    }

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }

    showAttAll() {
        this.pushController(HeroAttViewController)
    }

    //升级
    upLevelHandler(changeLv: number) {
        let herovo: Hero = this.heromodel.getHero(this.heromodel.getSelectHeroId())
        let lvData: CsUpgradeLevel = {
            heroTableId: Number(herovo.getId()),
            addLv: changeLv
        }
        // protobuf
        let lvCreate = CsUpgradeLevel.create(lvData)
        let lvbuffer = CsUpgradeLevel.encode(lvCreate).finish()

        this.heromodel.request(lvbuffer, csUpgradeLevelId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScUpgradeLevel = ScUpgradeLevel.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.heromodel.updateHero(herovo.getId(), plater.heroInfo)   //数据同步
            console.log("解包后的数据", plater)
            this.viewDoAction("updateLvHandler")
        })
    }

    //升阶
    upQualityHandler() {
        let herovo: Hero = this.heromodel.getHero(this.heromodel.getSelectHeroId())
        let TrainData: CsUpgradeJobRank = {
            heroTableId: Number(herovo.getId()),
        }
        // protobuf
        let qualtiyCreate = CsUpgradeJobRank.create(TrainData)
        let qualitybuffer = CsUpgradeJobRank.encode(qualtiyCreate).finish()

        this.heromodel.request(qualitybuffer, csUpgradeJobRankId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScActivateTrain = ScUpgradeJobRank.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.heromodel.updateHero(herovo.getId(), plater.heroInfo)   //数据同步
            console.log("解包后的数据", plater)
            this.viewDoAction("updateQualityHandler")
        })
    }

    //训练
    trainHandler() {
        let herovo: Hero = this.heromodel.getHero(this.heromodel.getSelectHeroId())
        let TrainData: CsActivateTrain = {
            heroTableId: Number(herovo.getId()),
            trainIndex: 0
        }
        // protobuf
        let trainCreate = CsActivateTrain.create(TrainData)
        let trainbuffer = CsActivateTrain.encode(trainCreate).finish()

        this.heromodel.request(trainbuffer, csActivateTrainId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScActivateTrain = ScActivateTrain.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.heromodel.updateHero(herovo.getId(), plater.heroInfo)   //数据同步
            console.log("解包后的数据", plater)
            this.viewDoAction("updateChange")
        })

    }

    //扫荡
    mopHandler() {
        let herovo: Hero = this.heromodel.getHero(this.heromodel.getSelectHeroId())
        // EventManager.emit(SHOWTIPS, "功能未开启 手动添加道具")
        //通过GM命令增加所有道具 后续删除
        let itemId = ''
        let qualityId = herovo.getQialityId();
        let qualityCofig = DataReader.requireRecordById("HeroQuality", `${qualityId}`);
        let equPolicyConfig = DataReader.requireRecordById("HeroEquPolicy", qualityCofig.policy)
        for (let index = 0; index < 4; index++) {
            let equStr = equPolicyConfig[`equ${index + 1}`]
            if (itemId == '') {
                itemId = itemId + `${equStr}`
            } else {
                itemId = itemId + `,${equStr}`
            }
        }
        let playerLogin: CsGmCmd = {
            gmCode: "ADD_ITEM",
            params: itemId
        }
        // protobuf

        let test = CsGmCmd.create(playerLogin)
        let playerLoginbuffer = CsGmCmd.encode(test).finish()
        let playermodel: PlayerModel = <PlayerModel>PlayerModel.getInstance()
        playermodel.request(playerLoginbuffer, csGmCmdId, (msg) => {
            console.log("收到服务器响应", msg)
            // EventManager.emit(SHOWTIPS, "道具添加成功")
            this.viewDoAction("updateChange")
        })
    }

    //升星
    starUpHandler() {
        let herovo: Hero = this.heromodel.getHero(this.heromodel.getSelectHeroId())
        let starData: CsUpgradeStar = {
            heroTableId: Number(herovo.getId())
        }
        // protobuf
        let starCreate = CsUpgradeStar.create(starData)
        let starbuffer = CsUpgradeStar.encode(starCreate).finish()

        this.heromodel.request(starbuffer, csUpgradeStarId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScUpgradeLevel = ScUpgradeLevel.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.heromodel.updateHero(herovo.getId(), plater.heroInfo)   //数据同步
            console.log("解包后的数据", plater)
            this.viewDoAction("updateStarHandler")
            this.pushController(HeroStarSuccessViewController)
        })


    }
}


