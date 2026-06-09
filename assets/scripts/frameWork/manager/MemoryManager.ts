import { Asset, game, sys } from "cc";
import ControllerManager from "./ControllerManager";


export default class MemoryManager {
    private static _manager = null
    private static _clearTimer = null
    private static _clearTime = 1000*60*20
    private  _delayReleaseMap = {}
    private  _cacheIndex = 0;   
    private _isGarbageCollect = false
    

    static getInstance(): MemoryManager {
        if (!this._manager) {
            if (!(sys.isNative&&sys.isMobile)) {
                MemoryManager._clearTime = 1000*60*5
            }
            this._manager = new MemoryManager()
            this._clearTimer = setTimeout(()=>{
                console.log("定时清理内存")
                game.emit("MemoryWarning")
            },this._clearTime)
        }
        return this._manager
    }


    //缓存待释放资源
    public cacheDelayReleaseRes(asset: Asset,useweight = 1) {
        //安卓暂时及时清理内存
        // if (cc.sys.os == cc.sys.OS_ANDROID) {
        //     asset.decRef()
        //     return
        // }
        let assetInfo = this._delayReleaseMap[asset["_uuid"]]
        if (assetInfo) {
            //已经缓存过的，去除本次引用计数，保留使用频率
            assetInfo[1] += useweight
            assetInfo[2] = this._cacheIndex++
            asset.decRef()
        } else {
            this._delayReleaseMap[asset["_uuid"]] = [asset, useweight,this._cacheIndex++]
        }
    }

    private releaseDelayRes(releaseAll){
        if (releaseAll) {
            for (const key in this._delayReleaseMap) {
                const assetInfo = this._delayReleaseMap[key];
                let asset:Asset = assetInfo[0]
                asset.decRef()
            }
            this._delayReleaseMap = {}
            console.log("释放全部缓存资源")
            return
        }

        let resArray = []
        for (const key in this._delayReleaseMap) {
            const assetInfo = this._delayReleaseMap[key];
            resArray.push(assetInfo)
        }
        resArray.sort((assetInfo1,assetInfo2)=>{
            if (assetInfo1[1] != assetInfo2[1]) {
                return assetInfo1[1] - assetInfo2[1]
            }else{
                return assetInfo1[2] - assetInfo2[2]
            }
        })
        let releaseLength = resArray.length
        if (releaseLength > 10) {
            releaseLength = releaseLength/2
        }
        console.log("缓存资源总量:释放资源量",resArray.length,releaseLength)
        for (let index = 0; index < releaseLength; index++) {
            let assetInfo = resArray[index];
            let asset:Asset = assetInfo[0]
            delete this._delayReleaseMap[asset["_uuid"]]
            asset.decRef()
        }
    }

    /**
     * 收到内存警告会对内存进行清理，只保留最上层scene,移除当前无用资源
     */
    public didReceiveMemoryWarning(releaseAll = false) {
        console.log("try release unused")
        ControllerManager.getInstance().destoryUnusedView()
        // _eventManager.emit("removeUnusedRes")
        // this.getTopSceneContro()&&this.getTopSceneContro().removeUnusedRes()
        this.releaseDelayRes(releaseAll)
        this.releaseUnusedAssets()
        if(window["_audioManager"]){
            window["_audioManager"].releaseUnusedAcbs()
        }
        if(MemoryManager._clearTimer){
            clearTimeout(MemoryManager._clearTimer)
            MemoryManager._clearTimer = setTimeout(()=>{
                console.log("定时清理内存")
                game.emit("MemoryWarning")
            },MemoryManager._clearTime)
        }
    }

    public releaseUnusedAssets(){
        if (this._isGarbageCollect) {
            return
        }
        this._isGarbageCollect = true
        console.log("------------try garbageCollect------------")
        sys.garbageCollect()
        setTimeout(() => {
            this._isGarbageCollect = false
        }, 5000);
    }
}