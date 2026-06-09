/*******************************************************************************
 copyright (c) 2024-present, Cocos, Inc.
 file name: LoginMode.ts
 description:用于详细介绍脚本的功能和用法
 author: cuicongcong
 date: Fri May 29 2026 15:05:57 GMT+0800 (中国标准时间) 
 **********************************************/


import { _decorator } from 'cc';
import Model from '../../../frameWork/data/Model';
const { ccclass, property } = _decorator;

@ccclass('LoginModel')
export default class LoginModel extends Model {
    static modelName: string = "PlayerModel";


    getMessageListeners() {
        return {}
    }
}


