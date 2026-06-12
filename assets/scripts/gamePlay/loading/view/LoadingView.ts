import { _decorator, Component, Label, Node, ProgressBar } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import { LoadingViewController, LoadState } from '../controller/LoadingViewController';
import { preloadFolder, preloadPrefab } from '../../../frameWork/utils/CommonUtils';
const { ccclass, property } = _decorator;

@ccclass('LoadingView')
export class LoadingView extends UIView {
    static className: string = "LoadingView"
    delegate: LoadingViewController
    protected static prefabUrl: string = "ui/loading/Loading"

    private _title: Node = null
    private _pro: Node = null
    private _proLab: Node = null

    onLoad() {
        this._title = this.node.getChildByName("title");
        this._pro = this.node.getChildByName("pro");
        this._proLab = this._pro.getChildByName("proLab")
    }

    showView() {
        let loadData = this.delegate.viewData;
        switch (loadData.loadType) {
            case LoadState.Dic:
                if (loadData.title) {
                    this._title.getComponent(Label).string = loadData.title
                }
                preloadFolder(loadData.path, (finished, total) => {
                    const progress = total > 0 ? Math.floor((finished / total) * 100) : 0;
                    this._pro.getComponent(ProgressBar).progress = finished / total
                    this._proLab.getComponent(Label).string = `${progress}%`
                }, () => {
                    this.delegate.loadingEndHandler()
                })
                break;
            case LoadState.Prefab:
                if (loadData.title) {
                    this._title.getComponent(Label).string = loadData.title
                }
                preloadPrefab(loadData.path, (finished, total) => {
                    const progress = total > 0 ? Math.floor((finished / total) * 100) : 0;
                    this._pro.getComponent(ProgressBar).progress = finished / total
                    this._proLab.getComponent(Label).string = `${progress}%`
                }, () => {
                    this.delegate.loadingEndHandler()
                })
            default:
                break;
        }
    }

}


