/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: LoginView.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Fri May 29 2026 15:05:26 GMT+0800 (中国标准时间) 
 **********************************************/


import { _decorator, Component, EditBox, Node } from 'cc';
import UIView from '../../../frameWork/ui/UIView';
import LoginViewController from '../controller/LoginViewController';
import EventManager from '../../../frameWork/manager/EventManager';
import { SHOWTIPS } from '../../../GameConfig';
import IconFactory from '../../base/IconFactory';
const { ccclass, property } = _decorator;

@ccclass('LoginView')
export default class LoginView extends UIView {
    static className: string = "LoginView"
    delegate: LoginViewController
    protected static prefabUrl: string = "ui/login/Login"

    @property(Node)
    loginBtn: Node = null

    @property(EditBox)
    userEdit: EditBox = null

    onLoad() {
        super.onLoad()
        this.userEdit.string = "1232"
        this.registbuttonClick(this.loginBtn, () => {
            let userName = this.userEdit.string
            userName = userName ? userName : "123"
            this.delegate.loginGame(userName)
        })

    }
}


