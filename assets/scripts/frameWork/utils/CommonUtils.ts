/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: CommonUtils.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Wed May 27 2026 16:32:28 GMT+0800 (中国标准时间) 
 **********************************************/

import { assert, Asset, assetManager, AssetManager, cclegacy, Color, director, Graphics, native, Node, RenderTexture, resources, Sprite, SpriteFrame, Texture2D, tween, Tween, UITransform } from "cc"
const { fileUtils } = native;
//获取某个节点的UITransform组件，如果没有则添加一个
export function getNodeUITransform(node: Node) {
    let uiTrans = node.getComponent(UITransform)
    if (!uiTrans) {
        uiTrans = node.addComponent(UITransform)
    }
    return uiTrans
}

let resourceCount = 0
export function loadResByPromise(url: string | string[], type: typeof Asset = Asset, bundle: AssetManager.Bundle = resources) {
    resourceCount += 1
    let ret = new Promise((resolve, reject) => {
        let callBack = (error, res) => {
            if (url instanceof Array && !(res instanceof Array)) {
                res = [res]
            }
            resolve(res)

            resourceCount -= 1
            // EventManager.emit(EVT_LOADING_LOADRES_PROGRESS, { count: resourceCount, url: url })

            assert(!error, `load ${url} error: ${error}`);
        }
        if (url instanceof Array) {
            bundle.load(url, type, callBack);
        } else {
            bundle.load(url, type, callBack);
        }
    })
    return ret
}


//创建倒计时 适用每次减少的一样的情况
//twernNode 绑定的node
//tweeTime 时间
//timeCallBack 回调
//allCount 一共多少
//reduceCount 每次减多少
//endCallBack 结束回调
export function nodeCreateTween(twernNode: Node, tweeTime: number, timeCallBack: Function,
    allCount: number, reduceCount: number, endCallBack?: Function) {
    Tween.stopAllByTarget(twernNode)
    timeCallBack(allCount)
    tween(twernNode) // 绑定在节点上，节点销毁时 tween 自动停止
        .delay(tweeTime)   // 等待 1 秒
        .call(() => {
            allCount = allCount - reduceCount
            allCount = allCount < 0 ? 0 : allCount
            timeCallBack(allCount)
            if (allCount <= 0) {
                Tween.stopAllByTarget(twernNode)
                endCallBack && endCallBack()
            }
        })
        .union()      // 将前面的 action 封装成一个整体
        .repeatForever()
        .start();     // 启动
}


export function getResPathAfterBuild(path: string, isJson: boolean, extStr?: string, bundle: AssetManager.Bundle = resources) {
    let info = bundle.getInfoWithPath(path, Asset)
    // assert(info, `资源 ${path} 缺失`)
    let nativePath = assetManager.utils.getUrlWithUuid(info.uuid, { isNative: !isJson, nativeExt: extStr })
    return nativePath

}

//表中的字符串转数组通过 _
export function ExcelStrToArr(str: string) {
    let strArr = str.split("_")
    return strArr
}

export function getDataByBuildResPath(path: string, isJson: boolean, extStr?: string) {
    return native.fileUtils.getStringFromFile(getResPathAfterBuild(path, isJson, extStr))
}

export async function loadResByTypeMap(typeMap: any) {
    let assetRet = []
    for (const key in typeMap) {
        const urlArray = typeMap[key];
        for (let index = 0; index < urlArray.length; index++) {
            const url = urlArray[index];
            let type: typeof Asset = cclegacy[key] //globalThis["cc"][key]
            type = type || globalThis["sp"][key]
            // assert(type, "在已知命名空间内未找到资源类型:" + key)
            let res = await loadResByPromise(url, type)
            if (!(res instanceof Array)) {
                res = [res]
            }
            if (res instanceof Array) {
                res.forEach((element: Asset) => {
                    element.addRef()
                });
            } else {
                res["addRef"]()
            }

            assetRet.push.apply(assetRet, res)
        }
    }
    //autoRlease
    setTimeout(() => {
        assetRet.forEach((element: Asset) => {
            element.decRef()
        });
    }, 0);
    return assetRet
}


