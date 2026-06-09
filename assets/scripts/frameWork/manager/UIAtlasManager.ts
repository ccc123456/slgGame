/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: UIAtlasManager.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Wed May 27 2026 16:52:39 GMT+0800 (中国标准时间) 
 **********************************************/

import { getDataByBuildResPath, loadResByPromise } from "../utils/CommonUtils";
import ViewController from "../controller/ViewController";
import BaseUI from "../ui/BaseUI";
import { isValid, JsonAsset } from "cc";

const TAG = "UIAtlasManager";
class UIAtlasManager {
    private _indexJson:JsonAsset = null
    private _indexPath:string = "uiatlas/index"
    private _spriteFramePath:string = "uiatlas/"
    private _spriteFrameCache:{[key:string]:string} = {}

    /**
     * @desc 初始化 index.json
     */
    private initIndex(){
        let dataStr = getDataByBuildResPath(this._indexPath,true,'.json')
        let data = JSON.parse(dataStr)
        this._indexJson = data.json||data[5][0][2]
    }

    async loadAtlasIndexForBrowser() {
        let data = <JsonAsset> await loadResByPromise(this._indexPath, JsonAsset)
        this._indexJson = data
        return data
    }

    /**
     * @desc 获取 spriteFrame
     * @param spriteName 目标资源名
     */
    public async getUISpriteFrame(spriteName:string, delegate:ViewController | BaseUI){
        // let ret1 = new RegExp("(^[^.]*)").exec(spriteName)
        // spriteName = ret1 ? ret1[1] : spriteName

        // // cc.log(" spriteName________ ", spriteName)

        // if (!this._indexJson) {
        //     this.initIndex()
        // }
        
        // // cache
        // let path = this._spriteFrameCache[spriteName]
        // if (path) {
        //     let spriteAtlas = <cc.SpriteAtlas> await delegate.getRes(path, cc.SpriteAtlas)
        //     if (this.isViewDestroy(delegate)) {
        //         return 
        //     }
        //     return spriteAtlas.getSpriteFrame(spriteName);
        // }

        // // find atlasName 
        // let atlasName:string = null
        // let paths = this._indexJson["paths"] || {}
        // for (const key in paths) {
        //     const data = paths[key];
        //     let items = data["items"] || []
        //     let index = items.indexOf(`${spriteName}.png`)
        //     if (index != -1) {
        //         atlasName = key
        //         break
        //     }
        // }

        // let ret = new RegExp("(^[^.]*)").exec(atlasName)
        // atlasName = ret ? ret[1] : atlasName

        // if (!atlasName || 'null' == atlasName) {
        //     console.error(TAG, "can't find atlas, spriteName: ", spriteName);
        //     return null;
        // }

        // // cc.log(`图集资源查找 : spriteName=${spriteName}, atlasName=${atlasName}`)
        
        // path = `${this._spriteFramePath}${atlasName}`
        // let spriteAtlas = <cc.SpriteAtlas> await delegate.getRes(path, cc.SpriteAtlas)
        // if (this.isViewDestroy(delegate)) {
        //     return 
        // }
        // this._spriteFrameCache[spriteName] = path
        // return spriteAtlas.getSpriteFrame(spriteName);
    }

    public getSpriteAtlasPath(spriteName:string){
        return this._spriteFrameCache[spriteName]
    }

    /**
     * @desc view 是否被销毁
     * @param delegate 
     * @returns 
     */
    isViewDestroy(delegate:ViewController | BaseUI):boolean{
        if ((delegate instanceof ViewController && delegate.isViewDestory()) || 
            (delegate instanceof BaseUI && !isValid(delegate.node, true))) {
            return true
        }
        return false
    }
}

export default new UIAtlasManager();


