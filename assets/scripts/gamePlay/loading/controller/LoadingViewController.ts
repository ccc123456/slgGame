import { _decorator, Component, Node } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import UIView from '../../../frameWork/ui/UIView';
import { LoadingView } from '../view/LoadingView';
const { ccclass, property } = _decorator;


export interface LoadInterface {
    title?: string,
    endCallBack: Function,
    loadType: LoadState,
    path: string
}

export const enum LoadState {
    Dic = 1,   //文件夹
    Prefab = 2,  //prefab
}

@ccclass('LoadingViewController')
export class LoadingViewController extends ViewController {
    static className: string = "LoadingViewController"
    viewClass: (typeof UIView) = LoadingView
    viewMode = viewMode.ALERT

    viewData: LoadInterface = null

    getMessageListeners() {
        return {
            SHOW_LOADING: (data: LoadInterface) => {
                this.viewData = data
                this.showView()
            }
        }
    }

    showView() {
        this.enable()
        this.viewDoAction("showView")
    }

    viewDidLoad(rag?: any): void {
        this.disable()
    }

    loadingEndHandler() {
        this.viewData && this.viewData.endCallBack && this.viewData.endCallBack()
        this.viewData = null;
        setTimeout(() => {
            this.disable()
        }, 100);
    }
}


