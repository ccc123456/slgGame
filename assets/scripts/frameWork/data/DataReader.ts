import { JsonReader, lipsyncPath } from "./JsonReader"

/*
 * @Descripttion: 数据读取器
 * @Author: wenzhong
 * @Date: 2020-06-19 15:22:07
 */ 
export default class DataReader {
    static _reader = new JsonReader()
    static getDataTable (tableName:string) {
        return this._reader.getDataTable(tableName)
    }

    static getRecordById (tableName:string, id:string) {
        return this._reader.getRecordById(tableName,id)
    }

    static requireRecordById (tableName:string, id:string) {
        return this._reader.requireRecordById(tableName,id)
    }

    static getDataByNameIdAndKey(tableName:string, id:string,key:string) {
        return this._reader.getDataByNameIdAndKey(tableName,id,key)
    }

    static requireDataByNameIdAndKey(tableName:string, id:string,key:string) {
        return this._reader.requireDataByNameIdAndKey(tableName,id,key)
    }

    static getCountOfRecordByTableName(tableName:string) {
        return this._reader.getCountOfRecordByTableName(tableName)
    }


    static getKeysOfTable(tableName:string) {
        return this._reader.getKeysOfTable(tableName)
    }

    static async loadAllTableForBrowser() {
        return await this._reader.loadAllTableForBrowser()
    }

    static getLipSyncTxt(fileName: string, id: string) {
        let dir = lipsyncPath + '/' + id + '/';
        return this._reader.getTxtTable(fileName, dir, '.adxlip');
    }

    static getTxtTable(fileName: string, dir: string, ext: string) {
        return this._reader.getTxtTable(fileName, dir, ext);
    }
}