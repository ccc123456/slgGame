/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: LoginViewController.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Fri May 29 2026 15:05:48 GMT+0800 (中国标准时间) 
 **********************************************/


import { _decorator, Node, Sprite } from 'cc';
import ViewController, { viewMode } from '../../../frameWork/controller/ViewController';
import { NetManager } from '../../../frameWork/netwoek/NetManager';
import UIView from '../../../frameWork/ui/UIView';
// import { playerProto } from '../../../proto/proto_bundle';
import LoginModel from '../model/LoginModel';
import LoginView from '../view/LoginView';
import PlayerModel from '../../home/mode/PlayerModel';
import { HomeViewController } from '../../home/controller/HomeViewController';
import { CsPlayerLogin, csPlayerLoginId, ScPlayerLogin } from 'db://assets/resource/proto/MessagePlayer';
import { DebugBoxViewController } from '../../debugBox/controller/DebugBoxViewController';
import IconFactory from '../../base/IconFactory';
const { ccclass, property } = _decorator;

@ccclass('LoginViewController')
export default class LoginViewController extends ViewController {
    static className: string = "LoginViewController"
    viewClass: (typeof UIView) = LoginView
    viewMode = viewMode.SCENE

    loginModel: LoginModel = <LoginModel>LoginModel.getInstance()

    viewDidShow(rag?: any): void {
    }

    loginGame(username: string) {
        //连接服务器
        NetManager.getInstance().connect("ws://192.168.55.21:7890", () => {
            let playerLogin: CsPlayerLogin = {
                username: username,
                toke: username,
                serverId: 1,
                pfStr: ''
            }
            // protobuf

            let test = CsPlayerLogin.create(playerLogin)
            let playerLoginbuffer = CsPlayerLogin.encode(test).finish()

            // let playerLoginbuffer = CsPlayerLogin.encode(playerLogin) //encodeCsPlayerLogin(playerLogin)  //用proto 消息转换成二进制数据 
            this.loginModel.request(playerLoginbuffer, csPlayerLoginId, (msg) => {
                console.log("收到服务器响应", msg)
                let plater: ScPlayerLogin = ScPlayerLogin.decode(msg.payload) //decodeScPlayerLogin(msg.payload)    //用proto 二进制消息转换成对象
                PlayerModel.getInstance().synchronize(plater)   //数据同步
                console.log("解包后的数据", plater)

                // //加载主场景\
                this.pushController(HomeViewController)
                
                this.close()
            })
        })
    }
}


