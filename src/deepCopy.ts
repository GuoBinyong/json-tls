import {
    customJSONStringify,
    customJSONParse,
    Reviver,
    PresetTypeReviverMap
} from "./customJSON";

import {TypeReviverMap,toTypeReviverArray,TypeReviverArray,TypeRevivers} from "type-reviver";

import {isBaseType} from "type-tls";

import {typeReviverArray} from "type-reviver-json"











export interface TypeReviversPair {
    string?:TypeRevivers<Reviver>;
    parse?:TypeRevivers<Reviver>;
}



/**
 * StringParseTypeRevivers 的类型守卫
 * @param target
 */
export function isTypeReviversPair(target:any):target is TypeReviversPair  {
    return target && typeof target === "object" && !Array.isArray(target) && (target.string || target.parse)
}



export type TypeReviversOptions = TypeRevivers<Reviver> | TypeReviversPair









export interface DeepCopyByJSON extends PresetTypeReviverMap{
    <T>(value:T,typeReviversOpts?:TypeReviversOptions|null):T;
}



/**
 * 创建带 presetTypeReviverMap 的 deepCopyByJSON 的工厂函数
 * @param presetTypeReviverMap
 */
export function createDeepCopyByJSONWith(presetTypeReviverMap?:TypeReviverMap<Reviver>):DeepCopyByJSON {

    /**
     * 通过 自定义 JSON 序列人的方式 对 value 进行 深拷贝
     * @param value
     * @param dcTypeRevivers
     */
    function deepCopyByJSON<T>(value:T,typeReviversOpts?:TypeReviversOptions|null):T {
        if (isBaseType(value)){
            return value;
        }

        let preTRArr = toTypeReviverArray(deepCopyByJSON.presetTypeReviverMap);
        let strAllTRArr = preTRArr;
        let parseAllTRArr = preTRArr;

        if (typeReviversOpts){
            if (isTypeReviversPair(typeReviversOpts)){
                let strTRs = typeReviversOpts.string;
                if (strTRs){
                    let strTRArr = toTypeReviverArray(strTRs);
                    strAllTRArr = strAllTRArr.concat(strTRArr);
                }

                let parseTRs = typeReviversOpts.parse;
                if (parseTRs){
                    let parseTRArr = toTypeReviverArray(parseTRs);
                    parseAllTRArr  = parseAllTRArr.concat(parseTRArr);
                }

            }else {
                let trArr = toTypeReviverArray(typeReviversOpts);
                strAllTRArr = strAllTRArr.concat(trArr);
                parseAllTRArr = strAllTRArr;
            }

        }

        var str = customJSONStringify(value,strAllTRArr);
        return customJSONParse(str,parseAllTRArr);
    }


    Object.defineProperty(deepCopyByJSON,"presetTypeReviverMap",{
        configurable:true,
        enumerable:true,
        get:function () {
            if (!this._presetTypeReviverMap){
                this._presetTypeReviverMap = new Map();
            }
            return this._presetTypeReviverMap;
        },
        set:function (newValue) {
            if (newValue instanceof Map){
                this._presetTypeReviverMap = newValue;
            }
        }
    });



    if (presetTypeReviverMap){
        deepCopyByJSON.presetTypeReviverMap = presetTypeReviverMap;
    }

    return deepCopyByJSON;
}









const defaultPresetTypeReviverMap:TypeReviverMap<Reviver> = new Map(typeReviverArray);



/**
 * 通过 自定义 JSON 序列人的方式 对 value 进行 深拷贝
 */
export const deepCopyByJSON = createDeepCopyByJSONWith(new Map(typeReviverArray));
