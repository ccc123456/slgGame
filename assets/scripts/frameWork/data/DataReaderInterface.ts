/*
 * @Descripttion: 
 * @Author: wenzhong
 * @Date: 2020-07-20 10:07:14
 */ 

export interface DataReaderInterface {
    getDataTable: (tableName:string) => any;           // 获得整张表
    getRecordById: (tableName:string, id:string) => any;      // 获取指定表格中指定id所对应的一条记录,记录可以为空
    requireRecordById: (tableName:string, id:string) => any;    //记录为空将会报错
    getDataByNameIdAndKey: (tableName:string, id:string,key:string) => any;    //获取某个表中某个记录的某个字段
    requireDataByNameIdAndKey: (tableName:string, id:string,key:string) => any;    //字段不存在将会报错
    getCountOfRecordByTableName: (tableName:string) => any;//获取某个表的条目数
    getKeysOfTable:(tableName:string) => any;   //获取配置表所有key
    loadAllTableForBrowser(); //加载所有表格
}