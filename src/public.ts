
// customJSONStringify 专用的 Revr
export type StringifyReviver = (this: any, key: string, value: any, type:string , callCount:number, stringifyOptions:StringifyReviverOptions) => any;

// customJSONParse 专用的 Reviver
export type ParseReviver = (this: any, key: string,value: any,type:string,callCount:number) => any;

// customJSONStringify 和 customJSONParse 都可用的 Reviver
export type SPReviver = (this: any, key: string,value: any,type:string ,callCount:number ,stringifyOptions:StringifyReviverOptions|undefined) => any;




export interface ReviverPair {
    string:StringifyReviver;
    parse:ParseReviver;
}




//ReviverPair 的类型守卫
export function isReviverPair(target:any):target is ReviverPair {
    return target && typeof target.string === "function" && typeof target.parse === "function"
}




export type Reviver = SPReviver | StringifyReviver | ParseReviver | ReviverPair






export interface StringifyReviverOptions {
    skip?:boolean;
    skipMark?:boolean;
    skipRootMark?:boolean;   //是否跳过 顶层的 标记
}






export interface JSONStringifyOptions extends StringifyReviverOptions{
    skipRoot?:boolean;   //是否跳过 顶层的 自定义操作
    space?: string | number;
    mark?:string | null ;   //类型标记
}
