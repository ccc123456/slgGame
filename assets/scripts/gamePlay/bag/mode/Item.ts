import { _decorator, Component, Node } from 'cc';
import { ItemInfo } from 'db://assets/resource/proto/structure';
import DataReader from '../../../frameWork/data/DataReader';
const { ccclass, property } = _decorator;

@ccclass('Item')
export default class Item {
    private _id: string = null
    private _count: number = 0
    private _configId: string = null
    private _config: { [key: string]: any } = {}    //item

    constructor(id: string) {
        this._id = id
    }

    public synchronize(data: ItemInfo) {
        // cc.log(" ItemModel_synchronize ", JSON.stringify(data))

        this._count = data.itemCount || this._count

        //装备特殊处理
        if (data.tableId) {
            this._configId = `${data.tableId}`
        }
        this.initConfig()
    }

    private initConfig() {
        this._config = DataReader.requireRecordById("Item", this._configId)
        // cc.log(" this._config = ", JSON.stringify(this._config))
    }

    getConfigId() {
        return this._configId
    }

    getName() {
        return this._config.name
    }

    public getCount() {
        return this._count
    }
}


