/*
 * @Descripttion: 单例工厂
 * @Author: wenzhong
 * @Date: 2020-06-22 11:17:45
 */ 

export class SingletonFactory {

    private static instances: Map<{ new() }, Object> = new Map<{ new() }, Object>();

    public static getInstance<T>(c: { new(): T }): T {
        if (!SingletonFactory.instances.has(c)) {
            let obj = new c();
            SingletonFactory.instances.set(c, obj);
            return obj;
        }
        return <T>SingletonFactory.instances.get(c);
    }
}