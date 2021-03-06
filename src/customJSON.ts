import {getExactTypeNameOf,isBaseType} from "type-tls";
import {TypeRevivers, flatParseTypeRevivers, TypeReviverMap, PresetTypeReviverMap, mergeTypeRevivers} from "type-reviver"
import {typeReviverArray} from "./revivers"
import {StringifyReviver,ParseReviver,ReviverPair,Reviver,JSONStringifyOptions} from "./public"








export interface CustomJSONStringify extends PresetTypeReviverMap<Reviver>{
    <Revr extends Reviver>(value: any, typeRevivers?:TypeRevivers<Revr>|null,options?:JSONStringifyOptions):string;
}





/**
 * 默认的 Mark 值
 */
const _defaultMark = "__MarKOfCustomJSON__";


/**
 * 默认 Revier 的 TypeName
 */
export const typeNameOfDefaultRevier = "default";



export function createCustomJSONStringify(presetTypeReviverMap?:TypeReviverMap<Reviver>):CustomJSONStringify {

    /**
     * 自定义JSON序列化；可根据数据类型来自定义序列化方案； 给合  customJSONParse  可实现对任意类型的数据 进行序列化 并完整（无信息丢失）还原；
     * @param value: any   被序列化的对象
     * @param typeRevivers?:TypeRevivers|null    定义 类型 与 其对类的 自定义序列化函数；
     * @param options:JSONStringifyOptions    选项
     */
     function customJSONStringify<Revr extends Reviver>(value: any, typeRevivers?:TypeRevivers<Revr>|null,options:JSONStringifyOptions = {}):string {

        try {
            let presetTRMap = customJSONStringify.presetTypeReviverMap;
            if  (typeRevivers || presetTRMap.size > 0){
                let mergedTRArr = mergeTypeRevivers(presetTRMap,typeRevivers);
                var parseInfo =  flatParseTypeRevivers(mergedTRArr);
                let disDefaultArr = parseInfo.typeFun;

                //禁用toJSON
                if (disDefaultArr.length > 0){
                    var disTypeInfos:{ type:Function, toJSON:Function }[] | undefined  = disDefaultArr.reduce(function (infoArr:{ type:Function, toJSON:Function }[],fun) {
                        let toJSON = fun.prototype.toJSON;

                        if (toJSON){
                            fun.prototype.toJSON = undefined;
                            infoArr.push({
                                type:fun,
                                toJSON:toJSON
                            });
                        }

                        return infoArr;
                    },[]);
                }

                var trObj = parseInfo.trObject;

                if (trObj){

                    let opts = Object.assign({},options);

                    let mark = opts.mark as string;
                    mark = opts.mark = mark == null ? _defaultMark : mark ;
                    let markType = mark + "Type";
                    let markValue = mark + "Value";


                    let callCount = 0;  // stringifyReviver 的调用次数



                    const defaultTypeName = typeNameOfDefaultRevier;
                    const defaultRevier = trObj[defaultTypeName];
                    const defaultRevierFun:StringifyReviver = (defaultRevier && typeof defaultRevier === "object") ? (<ReviverPair>defaultRevier).string : <StringifyReviver>defaultRevier ;

                    let stringifyReviver = function (this: any, key: string, value: any) {
                        ++callCount;

                        //此处的写法没有问题，这样写是为了提高性能
                        switch (key) {
                            case mark:;
                            case markType:;
                            case markValue:return value;
                        }


                        if (opts.skipRoot && callCount === 1){  //需要跳过这次处理
                            return value;
                        }


                        let typeName = getExactTypeNameOf(value);
                        let revier = trObj[typeName];
                        let revierFun:StringifyReviver = (revier && typeof revier === "object") ? (<ReviverPair>revier).string : <StringifyReviver>revier ;

                        if (!revierFun){
                            if (defaultRevierFun){
                                typeName = defaultTypeName;
                                revier = defaultRevier;
                                revierFun = defaultRevierFun ;
                            }else {
                                return value;
                            }
                        }

                        let rerOpts = Object.assign({},opts);
                        let rerRes = revierFun.call(this,key,value,typeName,callCount,rerOpts);


                        if (rerOpts.skip){ //需要放在上一句 `revier.call(this,key,value,typeName,callCount,rerOpts)` 的后面，因为 revier 可修改 rerOpts 的值
                            return value;
                        }


                        /*
                        在以下任一情况下，均不会添加 mark
                        - revier 返回 undefined  :  `rerRes === undefined`
                        - skipMark 为 true : `rerOpts.skipMark`
                        - value 是被 customJSONStringify 最初序列化的目标（即：根） 且  skipRootMark 为 true : `rerOpts.skipRootMark && callCount === 1`
                        */
                        if (rerRes === undefined || rerOpts.skipMark || (rerOpts.skipRootMark && callCount === 1)){
                            return rerRes;
                        }

                        return {
                            [mark]:true,
                            [markType]:typeName,
                            [markValue]:rerRes
                        };
                    };

                    var jsonStr =  JSON.stringify(value,stringifyReviver,opts.space);
                }

            }


            // @ts-ignore
            if (!trObj) {
                jsonStr = JSON.stringify(value,null,options.space);
            }

            // eslint-disable-next-line no-useless-catch
        }catch (e) {
            throw e;
        }finally {
            //取消禁用toJSON
            if (disTypeInfos && disTypeInfos.length > 0){
                disTypeInfos.forEach(function (funInfo) {
                    funInfo.type.prototype.toJSON = funInfo.toJSON;
                });
            }

            // @ts-ignore
            // eslint-disable-next-line no-unsafe-finally
            return jsonStr;
        }
    }







    Object.defineProperty(customJSONStringify,"presetTypeReviverMap",{
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
        customJSONStringify.presetTypeReviverMap = presetTypeReviverMap;
    }

    return customJSONStringify;
}









export interface CustomJSONParse extends PresetTypeReviverMap<Reviver>{
    <Revr extends Reviver>(text: string, typeRevivers?:TypeRevivers<Revr>|null ,options?:JSONParseOptions):any;
}






export enum LostRevier {
    original="original",
    parse = "parse",
    ignore = "ignore"
}



export interface JSONParseOptions {
    mark?:string | null;   //类型标记
    lostRevier?:LostRevier;   //当找不到 Revier 时，如何处理
}





export function createCustomJSONParse(presetTypeReviverMap?:TypeReviverMap<Reviver>):CustomJSONParse {



    /**
     * 自定义JSON解析；可根据类型自定义解析逻辑；
     * @param text
     * @param typeRevivers
     * @param options
     */
    function customJSONParse<Revr extends Reviver>(text: string, typeRevivers?:TypeRevivers<Revr>|null ,options:JSONParseOptions = {}):any {

        let lostRevier = options.lostRevier || LostRevier.parse ;

        let presetTRMap = customJSONParse.presetTypeReviverMap;
        if (typeRevivers || presetTRMap.size > 0) {
            let mergedTRArr = mergeTypeRevivers(presetTRMap,typeRevivers);
            let parseInfo = flatParseTypeRevivers(mergedTRArr);
            var trObj = parseInfo.trObject;
        }


        // @ts-ignore
        if (!trObj && lostRevier === LostRevier.original){
            return JSON.parse(text);
        }

        let mark = options.mark == null ? _defaultMark : options.mark ;
        let markType = mark + "Type";
        let markValue = mark + "Value";

        let callCount = 0;  // parseReviver 的调用次数

        function parseReviver(this: any, key: string, value: any) {
            ++callCount;
            if (isBaseType(value)){
                return value;
            }


            let typeName = value[markType];
            if (!(typeName && value[mark])){
                return value;
            }

            var realValue = value[markValue];



            let revier = trObj[typeName];
            let revierFun:ParseReviver = (revier && typeof revier === "object") ? (<ReviverPair>revier).parse : <ParseReviver>revier ;

            if (!revierFun){
                switch (lostRevier) {
                    case LostRevier.ignore: return undefined;
                    case LostRevier.original:return value;
                    default: return realValue;
                }
            }

            return revierFun.call(this,key,realValue,typeName,callCount);
        }

        return JSON.parse(text,parseReviver);
    }





    Object.defineProperty(customJSONParse,"presetTypeReviverMap",{
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
        customJSONParse.presetTypeReviverMap = presetTypeReviverMap;
    }

    return customJSONParse;
}





export interface CustomJSON {
    stringify:CustomJSONStringify,
    parse:CustomJSONParse
}







export function createCustomJSON(presetTypeReviverMap?:TypeReviverMap<Reviver>):CustomJSON {
    return {
        stringify:createCustomJSONStringify(presetTypeReviverMap),
        parse:createCustomJSONParse(presetTypeReviverMap)
    };
}




/**
 * 默认预置的TypeReviverMap
 */
const defaultPresetTypeReviverMap:TypeReviverMap<Reviver> = new Map(typeReviverArray);




/**
 * 自定义JSON序列化；可根据数据类型来自定义序列化方案； 给合  customJSONParse  可实现对任意类型的数据 进行序列化 并完整（无信息丢失）还原；
 * @param value: any   被序列化的对象
 * @param typeRevivers?:TypeRevivers|null    定义 类型 与 其对类的 自定义序列化函数；
 * @param options:JSONStringifyOptions    选项
 */
export const customJSONStringify:CustomJSONStringify = createCustomJSONStringify(defaultPresetTypeReviverMap);






/**
 * 自定义JSON解析；可根据类型自定义解析逻辑；
 * @param text
 * @param typeRevivers
 * @param options
 */
export const customJSONParse:CustomJSONParse = createCustomJSONParse(defaultPresetTypeReviverMap);

