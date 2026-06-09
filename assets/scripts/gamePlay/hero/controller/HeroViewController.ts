import { _decorator } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { camps, HeroModel } from '../model/HeroModel';
import { HeroView } from '../view/HeroView';
import { HeroCultivateViewController } from './HeroCultivateViewController';
import { CsActivateHero, csActivateHeroId, ScActivateHero } from 'db://assets/resource/proto/MessageHero';
const { ccclass, property } = _decorator;

@ccclass('HeroViewController')
export class HeroViewController extends ViewController {
    static className: string = "HeroViewController"
    viewClass: (typeof UIView) = HeroView
    viewMode = viewMode.SCENE

    heroModel: HeroModel = <HeroModel>HeroModel.getInstance()
    public _toggleIndex: number = 0;

    viewDidLoad(): void {
        this._toggleIndex = 0
        this.updateHeroIds()
        this.viewDoAction("initView")
    }

    viewDidShow(rag?: any): void {
        this.viewDoAction("updateView")
    }

    updateHeroIds() {
        let _type = camps[this._toggleIndex].type
        this.heroModel.udpateHeroIds(_type)
        this.viewDoAction("updateView")
    }

    openCultivateView(heroId: string) {
        this.heroModel.setSelectHeroId(heroId)
        this.pushController(HeroCultivateViewController)
    }


    //训练
    activateHandler(heroId: string) {
        let TrainData: CsActivateHero = {
            heroTableId: Number(heroId),
        }
        // protobuf
        let trainCreate = CsActivateHero.create(TrainData)
        let trainbuffer = CsActivateHero.encode(trainCreate).finish()

        this.heroModel.request(trainbuffer, csActivateHeroId, (msg) => {
            console.log("收到服务器响应", msg)
            let plater: ScActivateHero = ScActivateHero.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
            this.heroModel.addHero(plater.heroInfo)   //数据同步
            this.updateHeroIds()
        })

    }



}


