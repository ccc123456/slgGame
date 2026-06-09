import { _decorator, Component, Node } from 'cc';
import Model from '../../../frameWork/data/Model';
const { ccclass, property } = _decorator;


export const enum TeamBtnState {
    citySiege = 1,   //城战攻城
}

@ccclass('TeamMode')
export class TeamMode extends Model {
    static modelName: string = "TeamMode";

}


