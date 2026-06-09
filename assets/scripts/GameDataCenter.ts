import Model from "./frameWork/data/Model";
import { SingletonFactory } from "./frameWork/utils/SingletonFactory";
import { BagModel } from "./gamePlay/bag/mode/BagModel";
import { HeroModel } from "./gamePlay/hero/model/HeroModel";
import PlayerModel from "./gamePlay/home/mode/PlayerModel";


class GameDataCenter {
    initModules() {
        throw new Error("Method not implemented.");
    }

    private _modelMap: { [key: string]: Model } = {}
    loadModel<T extends Model>(c: { new(): T }): T {
        let obj = SingletonFactory.getInstance(c);
        this._modelMap[c["modelName"]] = obj
        return obj
    }

    clear() {
        for (const key in this._modelMap) {
            const model = this._modelMap[key];
            model.clear();
        }
    }
    /**
     * 加载游戏的model,所有需要在游戏启动的时候就需要初始化的model以及提供对外接口的model都需要在此处进行加载
     */
    initModels() {
        this.loadModel(PlayerModel)
        this.loadModel(HeroModel)
        this.loadModel(BagModel)
    }

    /**
     * 通过名字获取model
     * @param name model的名字
     */
    getModelByName(name: string) {
        return this._modelMap[name]
    }
}

export default new GameDataCenter();