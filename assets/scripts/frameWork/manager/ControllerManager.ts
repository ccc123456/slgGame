/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: ControllerManager.ts
 description:视图控制器管理器
 author: cuicongcong
 date: Wed May 27 2026 15:50:29 GMT+0800 (中国标准时间) 
 **********************************************/

import { Asset, director, instantiate, isValid, Node, resources, tween, UIOpacity, UITransform, Vec3, Widget } from "cc";
import Adapter, { AdjustTpye } from "../../common/Adapter";
import ViewController, { viewMode } from "../controller/ViewController";
import UIView from "../ui/UIView";
import { loadResByTypeMap } from "../utils/CommonUtils";


export default class ControllerManager {
    private static _manager = null;
    private _stageLayer: Node = null
    private _alertLayer: Node = null
    private _blockLayer: Node = null
    private _controllers: ViewController[] = []
    private _alertControllers: ViewController[] = []
    private _viewMap: { [key: string]: ViewController } = {}
    private segZIndex = 10000


    static getInstance() {
        if (!this._manager) {
            this._manager = new ControllerManager().init();
        }
        return this._manager;
    }

    // clearManager() {
    //     this._manager = null
    //     this._controllers = []
    //     this._alertControllers = []
    //     this._viewMap = {}
    // }

    private init() {
        let curScene = director.getScene()
        let canvas = curScene.getChildByName('Canvas')
        let carme = canvas.getChildByName('Camera');
        let rootNode = carme.getChildByName("rootNode")
        this._stageLayer = new Node()
        rootNode.addChild(this._stageLayer)
        // Adapter.adjustForType(this._stageLayer, AdjustTpye.ALL)
        this._alertLayer = new Node()
        rootNode.addChild(this._alertLayer)
        // Adapter.adjustForType(this._stageLayer, AdjustTpye.ALL)
        this._blockLayer = new Node()
        rootNode.addChild(this._blockLayer)
        // Adapter.adjustForType(this._blockLayer, AdjustTpye.ALL)
        this._blockLayer.active = false
        return this
    }


    public getAlertLayer() {
        return this._alertLayer;
    }

    public blockTouch() {
        this._blockLayer.active = true
    }

    public unBlockTouch() {
        this._blockLayer.active = false
    }


    /**
     * 通过名字获取对应的controller
     * @param name view或者controller的名字
     */
    public getControByName(name: string): ViewController {
        return this._viewMap[name]
    }

    /**
     * 
     * @param controllerClass 控制器类
     * @param arg 初始化参数 isReplace:是否进行界面替换
     * isReuse:是否直接复用已存在的视图,默认重新创建，如果arg为空则默认复用已存在的,复用的话如需根据新arg刷新界面需要重写refrshForReuse方法
     * // PANEL、ALERT ：不填 bgStyle 则全部默认显示
        1、bgStyle = null // 屏蔽背景样式
        2、bgStyle = {
            useSpriteBg: 是否使用纯色背景图,false:使用截屏背景;
            blackOpacity : 120, // 截屏压黑透明度
            ignoreControHide：true // 是否忽略二级弹窗的隐藏
            // 方便扩展
        }
     * @param callback 打开回调
     */
    public async pushViewByController(controllerClass: typeof ViewController, arg?: { [key: string]: any, isReplace?: boolean, isReuse?: boolean, noBlock?: boolean, bgStyle?: null | { useSpriteBg?: boolean, blackOpacity?: number, ignoreControHide?: boolean }, isGlobal?: boolean }, callback?: Function) {
        let topSceneContro: ViewController = this.getTopSceneContro()
        // assert(controllerClass.className, "没有指定controller.className")
        console.log("--pushViewByController..." + controllerClass.className);
        //如果视图已经存在
        let tryViewContro: ViewController = this._viewMap[controllerClass.className]

        do {
            if (tryViewContro) {
                if (tryViewContro == topSceneContro || tryViewContro == this.getTopViewContro()) {
                    this.viewDidShow(tryViewContro, arg)
                    return tryViewContro
                }

                if (arg && !arg.isReuse) {
                    this.closeView(tryViewContro)
                    console.log("二次调用，销毁堆栈中旧的视图，重新创建新的，如需做复用优化，请传isReuse参数，以及实现refrshForReuse方法进行刷新" + controllerClass.className);
                    break
                }
                arg = arg || {}
                //复用界面隐藏重新刷新数据
                tryViewContro.disable()
                tryViewContro.refrshForReuse(arg)

                let topViewContro: ViewController = null
                let targeControStack = []
                if (viewMode.PANEL == tryViewContro.viewMode) {
                    topViewContro = topSceneContro.subControllers[topSceneContro.subControllers.length - 1]

                    targeControStack = tryViewContro.parentController.subControllers
                    if (tryViewContro.parentController != topSceneContro) {
                        let index = targeControStack.indexOf(tryViewContro)
                        topSceneContro.subControllers.push(targeControStack.splice(index, 1)[0])
                        tryViewContro.parentController = topSceneContro
                        tryViewContro.rootView.parent = topSceneContro.rootView
                        targeControStack = topSceneContro.subControllers
                    }
                } else if (viewMode.SCENE == tryViewContro.viewMode) {
                    targeControStack = this._controllers
                    topViewContro = topSceneContro
                }
                let index = targeControStack.indexOf(tryViewContro)
                index > -1 && targeControStack.push(targeControStack.splice(index, 1)[0])

                this.showView(tryViewContro, () => {
                    if (viewMode.SCENE == tryViewContro.viewMode) {
                        this.viewDidHide(topViewContro)
                    }

                    if (arg.isReplace && topViewContro) {
                        this.closeView(topViewContro)
                    }
                })
                console.log("视图已经存在，将其调入顶层")
                callback && callback(tryViewContro);
                return tryViewContro
            }
        } while (false);

        arg = arg || {}
        let contro = new controllerClass(arg)
        // assert(contro.viewClass.className, "没有指定viewClass.className")

        let topViewContro: ViewController = null
        let targetNode: Node = null
        let targeControStack: ViewController[] = []
        switch (contro.viewMode) {
            case viewMode.SCENE:
                targetNode = this._stageLayer
                targeControStack = this._controllers
                topViewContro = topSceneContro
                break;
            case viewMode.PANEL:
                targetNode = topSceneContro.rootView
                contro.parentController = topSceneContro
                targeControStack = topSceneContro.subControllers
                topViewContro = topSceneContro.subControllers[topSceneContro.subControllers.length - 1]
                break;
            default:
                targetNode = this._alertLayer
                if (!arg.isGlobal) {
                    targeControStack = this._alertControllers
                }
                break;
        }
        targeControStack && targeControStack.push(contro)
        contro.rootView.parent = targetNode
        let rootTransfrorm = contro.rootView.getComponent(UITransform)
        if (!rootTransfrorm) {
            rootTransfrorm = contro.rootView.addComponent(UITransform)
        }
        // rootTransfrorm.priority = this.segZIndex
        // contro.rootView.zIndex = this.segZIndex
        contro.rootView.setSiblingIndex(this.segZIndex)
        contro.rootView.setSiblingIndex(-1)

        //防止调度逻辑出现时序问题，立刻在容器中移除,销毁可以延迟
        if (arg.isReplace && topViewContro) {
            let index = targeControStack.indexOf(topViewContro)
            index > -1 && targeControStack.splice(index, 1)
            this._viewMap[topViewContro.viewClass.className] = null
            this._viewMap[topViewContro.constructor["className"]] = null
        }

        this._viewMap[contro.viewClass.className] = contro
        this._viewMap[controllerClass.className] = contro

        // 模糊背景以及二级弹窗隐藏
        this.showBlackLayer(targeControStack, contro, arg.bgStyle)

        //加载依赖资源
        let assetRes = contro.dependResMap.Asset
        contro.dependResMap.Asset = assetRes || []
        if (typeof contro.dependResMap.Asset == "string") {
            contro.dependResMap.Asset = [contro.viewClass.getUrl(), contro.dependResMap.Asset]
        } else {
            contro.dependResMap.Asset.unshift(contro.viewClass.getUrl())
        }
        let asset: Asset[] = await loadResByTypeMap(contro.dependResMap)

        contro.cacheRes(asset)
        contro.preloadAudio(contro.preloadAudioArray)

        //当异步后发现视图已经被销毁了
        if (!contro.rootView) {
            if (arg.isReplace && topViewContro && topViewContro.rootView) {
                this.closeView(topViewContro)
            }
            return
        }

        let uiNode: Node = <Node><any>instantiate(resources.get(contro.viewClass.getUrl()));
        uiNode.setPosition(0, 0)
        uiNode.parent = contro.rootView
        Adapter.adjustForType(uiNode, AdjustTpye.ALL)
        let ui: UIView = uiNode.getComponent(contro.viewClass);
        if (!ui) {
            ui = <UIView>uiNode.addComponent(contro.viewClass.className)
        }

        // 弹窗缩放动作
        let isShowAction = arg.showAction != null ? arg.showAction : true
        if (isShowAction && (contro.viewMode === viewMode.PANEL || contro.viewMode === viewMode.ALERT)) {
            uiNode.getComponent(Widget).enabled = false
            uiNode.scale = new Vec3(0.8, 0.8, 0.8)
            tween(uiNode).to(0.1, { scale: new Vec3(1, 1, 1) }).call(() => {
                if (!isValid(uiNode)) {
                    return
                }
                uiNode.getComponent(Widget).enabled = true
            }).start()
        }

        ui.delegate = contro
        contro.setViewComponent(ui)
        contro.viewDidLoad()
        this.viewDidShow(contro, arg)

        callback && callback(contro);

        if (arg.isReplace && topViewContro) {
            this.closeView(topViewContro)
            return contro
        }

        if (contro.viewMode == viewMode.SCENE && topViewContro) {
            this.viewDidHide(topViewContro)
        }
        return contro

    }


    /**
    * @desc 高斯模糊+压黑
    * @param targeControStack 当前 ViewController 所在的 scene ViewController
    * @param contro 当前 ViewController
    * @param bgStyle useSpriteBg:是否使用纯色背景图,false:使用截屏背景; blackOpacity：截屏透明度；ignoreControHide：是否忽略二级弹窗的隐藏
    * @returns 
    */
    public showBlackLayer(targeControStack, contro, bgStyle?: { useSpriteBg?: boolean, blackOpacity?: number, ignoreControHide?: boolean }) {
        // SCENE 类型必须配置 bgStyle 才可生效
        if (!bgStyle && contro.viewMode === viewMode.SCENE) {
            return
        }

        // PANEL、ALERET 的 bgStyle 为null，表示不需要截屏背景等效果
        if (bgStyle === null) {
            return
        }

        bgStyle = bgStyle || {}
        let opacity = typeof bgStyle.blackOpacity === "number" ? bgStyle.blackOpacity : 120
        // 二级弹窗隐藏前置弹窗的模糊背景
        if (contro.viewMode !== viewMode.SCENE) {
            let length = targeControStack.length
            for (let i = 0; i < length - 1; i++) {
                const contro = targeControStack[i];
                let targetNode = contro.rootView
                let blurBg = targetNode.getChildByName("BlurBg")
                if (blurBg) {
                    blurBg.active = false
                }

                if (!bgStyle.ignoreControHide) {
                    contro.rootView.opacity = 0
                }
            }
        }

        // 模糊背景
        let targetNode = contro.rootView
        // let blurBg = targetNode.getChildByName("BlurBg")
        // if (!blurBg) {
        //     blurBg = new Node()
        //     blurBg.zIndex = -1
        //     blurBg.parent = targetNode
        //     blurBg.name = "BlurBg"
        //     blurBg.destroyAllChildren()
        //     let sprite = null;
        //     if (!!bgStyle.useSpriteBg) {
        //         sprite = createSingleColorScreenNode();
        //     } else {
        //         sprite = captureScreen()
        //         convertToBlurSpriteBySrcSprite(sprite)
        //     }
        //     sprite.parent = blurBg
        // }
        // blurBg.opacity = opacity
    }


    /**
     * 获得顶层场景视图控制器
     */
    public getTopSceneContro() {
        return this._controllers[this._controllers.length - 1]
    }

    /**
        * 获得顶层视图控制器, 包括alert弹窗
        */
    public getTopViewContro2() {
        return this._alertControllers.length > 0 ? this._alertControllers[this._alertControllers.length - 1] : this.getTopViewContro()
    }


    /**
     * 
     * @param contro 控制器
     */
    private viewDidHide(contro: ViewController) {
        //已经关闭过
        if (!contro.rootView) {
            return
        }
        contro.disable()
        contro.viewDidHide()
        contro.subControllers.forEach(subContro => {
            subContro.isEnable && subContro.viewDidHide()
        });
    }

    /**
     * 
     * @param contro 控制器
     * @param arg 参数
     */
    private viewDidShow(contro: ViewController, arg?) {
        contro.viewDidShow(arg)
        contro.subControllers.forEach(subContro => {
            subContro.isEnable && subContro.viewDidShow()
        });
    }

    /**
   * 
   * @param contro 控制器
   * @param callback 打开回调
   */
    private async showView(contro: ViewController, callback: Function) {
        if (!contro) {
            callback()
            return
        }
        let isEnable = contro.isEnable()
        contro.enable()

        // 打开的是二级弹窗，显示当前弹窗的压黑
        if (contro.viewMode === viewMode.PANEL || contro.viewMode === viewMode.ALERT) {
            let targetNode = contro.rootView
            let blurBg = targetNode.getChildByName("BlurBg")
            if (blurBg) {
                blurBg.active = true
            }
            let targetNodeOp = targetNode.getComponent(UIOpacity)
            if (!targetNodeOp) {
                targetNodeOp = targetNode.addComponent(UIOpacity)
            }
            targetNodeOp.opacity = 255
        } else if (contro.viewMode === viewMode.SCENE) {
            // 打开的是scene，显示最上层二级弹窗
            let topPanelContro = contro.subControllers[contro.subControllers.length - 1]
            if (topPanelContro) {
                let targetNodeRootOp = topPanelContro.rootView.getComponent(UIOpacity)
                if (!targetNodeRootOp) {
                    targetNodeRootOp = topPanelContro.rootView.addComponent(UIOpacity)
                }
                targetNodeRootOp.opacity = 255
                let targetNode = topPanelContro.rootView
                let blurBg = targetNode.getChildByName("BlurBg")
                if (blurBg) {
                    blurBg.active = true
                }
            }
        }

        //先调到最高层级进行屏蔽显示，再做后续操作防止出现用户多次点击
        contro.rootView.setSiblingIndex(-1)
        let reloadArray: ViewController[] = []
        if (contro.isViewDestory()) {
            reloadArray.push(contro)
        }

        contro.subControllers.forEach(subContro => {
            if (subContro.isViewDestory() && subContro.isEnable()) {
                reloadArray.push(subContro)
            }
        });

        for (let index = 0; index < reloadArray.length; index++) {
            const reloadContro = reloadArray[index];
            let assetArray: Asset[] = await loadResByTypeMap(reloadContro.dependResMap)
            if (!reloadContro.rootView) {
                continue
            }
            reloadContro.cacheRes(assetArray)
            reloadContro.preloadAudio(reloadContro.preloadAudioArray)
            let uiNode = <Node><any>instantiate(resources.get(reloadContro.viewClass.getUrl()));
            uiNode.setPosition(0, 0)
            console.log("页面重建:", reloadContro.viewClass.className)
            uiNode.parent = reloadContro.rootView
            // Adapter.adjustForType(uiNode, AdjustTpye.ALL)
            let ui: UIView = uiNode.getComponent(reloadContro.viewClass);
            if (!ui) {
                ui = <UIView>uiNode.addComponent(reloadContro.viewClass.className)
            }
            ui.delegate = reloadContro
            reloadContro.setViewComponent(ui)
            reloadContro.viewDidLoad()
        }

        (!isEnable) && this.viewDidShow(contro)

        callback && callback(contro);
    }

    /**
     * 推出一个已显示过的视图，且关闭其顶部的所有视图
     * @param controllerClass 已存在的控制器类
     * @param arg 初始化参数 
     * @param callback 打开回调
     */
    public async popToTargetViewByController(controllerClass: typeof ViewController, arg?: { [key: string]: any }, callback?: Function) {
        // assert(controllerClass.className, "没有指定controller.className")

        //如果视图已经存在
        let tryViewContro: ViewController = this._viewMap[controllerClass.className]

        arg = arg || {}

        if (tryViewContro) {
            if (tryViewContro == this.getTopViewContro()) {
                return tryViewContro
            }

            let targeControStack = []
            if (viewMode.PANEL == tryViewContro.viewMode) {
                targeControStack = tryViewContro.parentController.subControllers
            } else if (viewMode.SCENE == tryViewContro.viewMode) {
                targeControStack = this._controllers
            }
            let index = targeControStack.indexOf(tryViewContro)
            if (index > -1) {
                let removeFromIndex = index + 1
                let deleteCount = targeControStack.length - removeFromIndex
                let removals: ViewController[] = targeControStack.splice(removeFromIndex, deleteCount)

                tryViewContro.rootView.setSiblingIndex(-1)
                this.showView(tryViewContro, () => {
                    removals.forEach((viewController, key) => {
                        this.closeView(viewController)
                    })
                })
                console.log("视图已经存在，将其调入顶层")
                callback && callback(tryViewContro);
                return tryViewContro
            }
        }
        // else {
        //    this.popToRootScene()
        //    arg.isReplace = true
        //    let contro = await this.pushViewByController(controllerClass,arg)
        //    callback && callback(contro);
        //    return contro
        // }
    }

    /**
     * 
     * @param contro 通过控制器关闭界面
     */
    public closeView(contro: ViewController) {
        //已经关闭过
        if (contro && !contro.rootView) {
            return
        }
        let curSence = this.getTopSceneContro()

        let topViewContro: ViewController = this.getTopViewContro()
        //如果未传递则默认最上层界面
        contro = contro || this.getTopViewContro2()

        if (!curSence && viewMode.ALERT != contro.viewMode) {
            return
        }

        let targeControStack: ViewController[] = []
        if (viewMode.PANEL == contro.viewMode) {
            targeControStack = contro.parentController.subControllers
        } else if (viewMode.SCENE == contro.viewMode) {
            targeControStack = this._controllers
            topViewContro = curSence
        } else {
            targeControStack = this._alertControllers
        }

        let index = targeControStack.indexOf(contro)
        index > -1 && targeControStack.splice(index, 1)

        let destroy = () => {
            this._viewMap[contro.viewClass.className] = null
            this._viewMap[contro.constructor["className"]] = null
            contro.subControllers.forEach(subContro => {
                this._viewMap[subContro.viewClass.className] = null
                this._viewMap[subContro.constructor["className"]] = null
                subContro.destructor()
            });
            contro.destructor()
        }

        if (contro.isEnable() && contro == topViewContro) {
            let willShowViw = null
            //被关掉的是panel
            if (viewMode.PANEL == contro.viewMode) {
                willShowViw = contro.parentController.subControllers[contro.parentController.subControllers.length - 1]
            } else if (viewMode.SCENE == contro.viewMode) {
                //被关掉的是scene,必须先显示scene而不能显示顶层视图，防止顶层视图是二级弹窗
                willShowViw = this.getTopSceneContro()
            }
            this.showView(willShowViw, destroy)
        } else {

            destroy()
        }

    }


    /**
     * 获得顶层视图控制器
     */
    public getTopViewContro() {
        let topScene = this.getTopSceneContro()
        return topScene && topScene.subControllers[topScene.subControllers.length - 1] || topScene
    }


    /**
     * 通过名字关闭界面
     * @param name view或者controller的名字
     */
    public closeViewByName(name: string) {
        let contro = this._viewMap[name]
        if (!contro) {
            return
        }
        this.closeView(contro)
    }


}


