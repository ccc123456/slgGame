export default class Strings {
    public static curentShowRule(current: number, judgeNum?: number): string {
        let _judgeNum = judgeNum ? judgeNum : 1000000
        if (current < _judgeNum) {
            return current.toString();
        } else {
            let value = (current / 10000);
            return `${Math.floor(value * 10) / 10}万`
        }
    }
}