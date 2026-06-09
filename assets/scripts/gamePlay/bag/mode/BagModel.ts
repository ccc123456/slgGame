import { _decorator, Component, Node } from 'cc';
import Model from '../../../frameWork/data/Model';
import { ScGetItems, scGetItemsId, scUpdateItemsId } from 'db://assets/resource/proto/MessageItem';
import { ItemInfo } from 'db://assets/resource/proto/structure';
import Item from './Item';
const { ccclass, property } = _decorator;

@ccclass('BagModel')
export class BagModel extends Model {
    static modelName: string = "BagModel";
    private _items: { [key: string]: Item } = {}
    private _itemsCache: { [key: string]: string[] } = {}

    getMessageListeners() {
        return {}
    }

    initPush() {
        this.addResponeHandler(scGetItemsId, (msg: any) => {
            let data: ScGetItems = ScGetItems.decode(msg.payload)
            this.synchronize(data)
        })
        this.addResponeHandler(scUpdateItemsId, (msg: any) => {
            let data: ScGetItems = ScGetItems.decode(msg.payload)
            this.synchronize(data)
        })
    }

    public synchronize(data: ScGetItems) {
        super.synchronize(data)

        let items = data.itemInfo || []
        for (let index = 0; index < items.length; index++) {
            let itemInfo: ItemInfo = items[index]
            let count = itemInfo.itemCount
            let id = itemInfo.id
            if (count <= 0) {
                this.deleteItem(id)
                continue
            }
            if (!this.hasItem(id)) {
                this.addItem(id)
            }

            this._items[id].synchronize(itemInfo)

            let configId = this._items[id].getConfigId()
            if (this._itemsCache[configId]) {
                if (this._itemsCache[configId].indexOf(id) == -1) {
                    this._itemsCache[configId].push(id)
                }
            } else {
                this._itemsCache[configId] = [id]
            }
        }
    }

    hasItem(id: string) {
        if (this._itemsCache[id]) {
            return this._itemsCache[id].length > 0
        }
        return this._items[id]
    }

    addItem(id: string) {
        let item = new Item(id)
        this._items[id] = item
    }

    getItem(id: string) {
        return this._items[id]
    }

    /**
     * @desc 数量为0则删除
     * @param id 
     */
    deleteItem(id: string) {
        if (this._items[id]) {
            let configId = this._items[id].getConfigId()
            let _nindex = this._itemsCache[configId].indexOf(id);
            this._itemsCache[configId].splice(_nindex, 1)
            if (this._itemsCache[configId].length == 0) {
                delete this._itemsCache[configId]
            }
            delete this._items[id]
        }
    }

    /**
     * @desc 获取道具数量
     * @param id configId
     */
    getCountByConfigId(configId: string) {
        if (this.hasItem(configId)) {
            let count = 0;
            for (let index = 0; index < this._itemsCache[configId].length; index++) {
                let id = this._itemsCache[configId][index]
                this._items[id] && (count += this._items[id].getCount())
            }
            return count
        }
        return 0
    }

    /**
         * @desc 获取道具数量
         * @param id id(唯一ID)
         */
    getCountById(id: string) {
        if (this.hasItem(id)) {
            return this._items[id].getCount()
        }
        return 0
    }


    /**
     * @desc 获取道具
     * @param id configId
     */
    getItemByConfigId(configId: string) {
        if (this.hasItem(configId)) {
            let id = this._itemsCache[configId][0]
            return this._items[id]
        }
        return null
    }

    /**
    * @desc 根据页签获取列表数据 先全部显示出来
    * @param id configId
    */
    getDataBySheet() {
        let items: Item[] = [];
        for (const key in this._items) {
            let itemData: Item = this._items[key];
            items.push(itemData);
        }
        return items
    }
}


