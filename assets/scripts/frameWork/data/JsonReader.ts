/*
 * @Descripttion: 
 * @Author: wenzhong
 * @Date: 2020-07-20 10:32:53
 */
import { DataReaderInterface } from "./DataReaderInterface";
import { loadResByPromise, getDataByBuildResPath } from "../utils/CommonUtils";
import { assert, Asset, JsonAsset, resources, sys } from "cc";
const configPath = "data/"
export const lipsyncPath = 'sound/lipsync';

const TAG = "JsonReader"
export class JsonReader implements DataReaderInterface {
    private _tables = {}
    private _txtTable = {};
    private _getJsonObj(fileName: string, configPath: string) {
        // resources.load('data/message-mapping', JsonAsset, (err, asset) => {
        //     if (err) {
        //         console.error('加载失败:', err);
        //         return;
        //     }
        //     // 获取 JSON 数据
        //     const jsonData = asset.json;
        //     console.log('读取成功:', jsonData);
        //     return jsonData
        // })
        let path = configPath + fileName
        let dataStr = getDataByBuildResPath(path, true, '.json')
        let data = JSON.parse(dataStr)
        let jsonRawData = data.json || data[5][0][2]
        return jsonRawData
    }

    private async _getJsonObjAsync(fileName: string, configPath: string) {
        let path = configPath + fileName
        let data = <JsonAsset>await loadResByPromise(path, JsonAsset)
        return data.json
    }

    private _createJsonObj(fileName: string, configPath: string) {
        let json = this._getJsonObj(fileName, configPath)
        let subJsons = [json]
        if (json._subJsonCount && json._subJsonCount > 0) {
            for (let index = 0; index < json._subJsonCount; index++) {
                let subjson = this._getJsonObj(fileName + `_sub${index + 1}`, configPath)
                subJsons.push(subjson)
            }
        }
        delete json._subJsonCount

        if (json._subFiles) {
            for (const key in json._subFiles) {
                let subjson = this._createJsonObj(key, configPath)
                subJsons.push(subjson)
            }
        }
        delete json._subFiles

        if (subJsons.length > 1) {
            Object.assign.apply(Object, subJsons)
        }
        return json
    }

    public getDataTable(tableName: string) {
        let table = this._tables[tableName]
        if (table) {
            return table
        } else {
            let json = <JsonAsset>this._createJsonObj(tableName, configPath)
            this._tables[tableName] = json
            return json
        }
    }

    private async _createJsonObjAsync(fileName: string, configPath: string) {
        let json = await this._getJsonObjAsync(fileName, configPath)
        // return json.elements
        let subJsons = [json]
        if (json._subJsonCount && json._subJsonCount > 0) {
            for (let index = 0; index < json._subJsonCount; index++) {
                let subjson = await this._getJsonObjAsync(fileName + `_sub${index + 1}`, configPath)
                subJsons.push(subjson)
            }
        }
        delete json._subJsonCount

        if (json._subFiles) {
            for (const key in json._subFiles) {
                let subjson = await this._createJsonObjAsync(key, configPath)
                subJsons.push(subjson)
            }
        }
        delete json._subFiles

        if (subJsons.length > 1) {
            Object.assign.apply(Object, subJsons)
        }
        return json.elements
    }

    async loadAllTableForBrowser() {
        resources.loadDir('data', (err, asset) => {
            if (err) {
                console.error('加载失败:', err);
                return;
            }
            this.loadJson(asset)
        })
    }

    async loadJson(asset) {
        for (let index = 0; index < asset.length; index++) {
            let tableName = asset[index].name
            let jsonData = await this._createJsonObjAsync(tableName, configPath)
            this._tables[tableName] = jsonData
        }
    }

    public getRecordById(tableName: string, id: string) {
        let data = this.getDataTable(tableName)
        return data[id]
    }

    public requireRecordById(tableName: string, id: string) {
        let data = this.getDataTable(tableName)
        assert(data[id], `未找到表:${tableName}的ID:${id}`)
        return data[id]
    }

    public getDataByNameIdAndKey(tableName: string, id: string, key: string) {
        let data = this.getDataTable(tableName)
        return data[id] && data[id][key]
    }

    public requireDataByNameIdAndKey(tableName: string, id: string, key: string) {
        let data = this.getDataTable(tableName)
        assert(data[id], `未找到表:${tableName}的ID:${id} 对应键值:${key}`)
        return data[id][key]
    }

    public async getCountOfRecordByTableName(tableName: string) {
        return this.getKeysOfTable(tableName).length
    }


    public getKeysOfTable(tableName: string) {
        return Object.keys(this.getDataTable(tableName))
    }

    getTxtTable(fileName: string, dir: string, ext: string) {
        if (this._txtTable[fileName]) {
            return this._txtTable[fileName];
        } else {
            if (sys.isNative) {
                return this._getTxtObj(fileName, dir, ext);
            }
        }

        return null;
    }

    private _getTxtObj(fileName: string, configPath: string, ext: string) {
        let path = configPath + fileName
        if (!resources.getInfoWithPath(path, Asset)) {
            console.error(TAG, " no asset:", path, ext)
            return "";
        }
        let dataStr = getDataByBuildResPath(path, false, ext)
        return dataStr
    }
}