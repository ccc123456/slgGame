import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass
export class TimeFactory {
    public readonly DAY = 24 * 60 * 60 * 1000;
    public readonly HOUR = 60 * 60 * 1000;
    public readonly MINUTE = 60 * 1000;
    public readonly SECOND = 1000;

    //获取时间的分 秒
    public getTimeMinute(second: number) {
        return Math.floor(second / 60)
    }

}

export default new TimeFactory();