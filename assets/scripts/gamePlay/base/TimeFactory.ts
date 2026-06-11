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

    /**
    * @param {number} leftMillis 剩余毫秒
    * @returns {string} 返回剩余时间【时:分:秒】
    */
    public getLeftTimeStr(leftMillis: number): string {
        let hour = leftMillis / this.HOUR;
        let remainder = leftMillis % this.HOUR;
        let minute = remainder / this.MINUTE;
        remainder = remainder % this.MINUTE;
        let second = remainder / this.SECOND;
        return this.padding(Math.floor(hour)) + ":" + this.padding(Math.floor(minute)) + ":" + this.padding(Math.floor(second));
    }

    //获取秒  leftMillis 剩余毫秒
    public getSecondStr(leftMillis: number) {
        let remainder = leftMillis % this.HOUR;
        remainder = remainder % this.MINUTE;
        let second = remainder / this.SECOND;
        return second
    }


    public getTimeStrSecond(time: number, isShowHour = true) {
        if (time < 0) {
            time = 0
        }
        let hour = Math.floor(time / 3600);
        let hMoudle = (time % 3600);
        let minute = Math.floor(hMoudle / 60);
        let second = hMoudle % 60;
        if (isShowHour) {
            return this.padding(Math.floor(hour)) + ":" + this.padding(Math.floor(minute)) + ":" + this.padding(Math.floor(second));
        } else {
            return this.padding(Math.floor(minute)) + ":" + this.padding(Math.floor(second));
        }

    }

    //补齐，例如3则左边补上0显示成03
    public padding(num: number): string {
        return (num < 10 ? "0" : "") + num;
    }
}

export default new TimeFactory();