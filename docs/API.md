

# 安全解析safelyParse()
```ts
function safelyParse(text: string, reviver?: (this: any, key: string, value: any) => any): { parsed: boolean, result: string | any }
```
安全地解析字符串，不会抛出错误，返回一个表示解析结果的信息对象

* @param `text : string`   必需， 一个有效的 JSON 字符串。
* @param `reviver ?: function`   可选，一个转换结果的函数， 将为对象的每个成员调用此函数。
* @returns 解析的结果：
   ```
   {
      PARSED: boolean,    //表示是否成功解析
      result: string | JSONObject     //最终解析的结果，如果成功解析，则该值为解析后的JSON对象，如果未成功解析，则该值为原字符串 text
   }   
   ```

 
 # 深度序列化deepStringify()
 ```ts
function deepStringify(target: any, replacer?: ReplacerArr | ReplacerFun  | null , space?: string | number): string

type ReplacerFun = (this: any, key: string, value: any) => any;
type ReplacerArr = (number | string)[];
```


将目标深度序列化成JSON字符串；即将 target 及 target 的中的所有对象属性单独序列化成 JSON 字符串；我称这样的 JSON 字符串为 深度 JSON 字符串，英文为 DeepJSON；
* @param `target : any`    将要序列化成 一个JSON 字符串的值。
* @param `replacer ? : (key,vlaue)=>vlaue | Array`    如果该参数是一个函数，则在序列化过程中，被序列化的值的每个属性都会经过该函数的转换和处理；如果该参数是一个数组，则只有包含在这个数组中的属性名才会被序列化到最终的 JSON 字符串中；如果该参数为null或者未提供，则对象所有的属性都会被序列化；关于该参数更详细的解释和示例，请参考使用原生的 JSON 对象一文。
* @param `space ?: string | number`  指定缩进用的空白字符串，用于美化输出（pretty-print）；如果参数是个数字，它代表有多少的空格；上限为10。该值若小于1，则意味着没有空格；如果该参数为字符串(字符串的前十个字母)，该字符串将被作为空格；如果该参数没有提供（或者为null）将没有空格。
* @returns `string`   一个表示给定值的经过深度序化化后的JSON字符串，即 深度 JSON 字符串。

**注意：**  
深度 JSON 字符串 只能通过 `deepParse()` 才能完全解析，如果用 `JSON.parse()` 来解析，则只能解析出顶层对象，顶层对象的那些值是对象类型的成员还是 深度 JSON 字符串。


# 深度解析deepParse()
```ts
function deepParse(text: string, reviver?: (this: any, key: string, value: any) => any): any
```
深度解析，专门用于解析 深度 JSON 字符串 DeepJSON，即： `deepStringify()` 的逆运算
* @param `text: string`  深度 JSON 字符串
* @param `reviver?: (this: any, key: string, value: any) => any`  同 `JSON.parse()` 的 `reviver`
* @returns `any`  解析后的值



# 判断是否是JSON字符串isJSONString()
```ts
function isJSONString(text: string): boolean
```                
判断 `text` 是否是有效的JSON字符串
* @returns `boolean` 表示是是否是有效的JSON字符串


# 兼容解析correctParse()
```ts
function correctParse(text?: string, reviver?: (this: any, key: string, value: any) => any): any 
```
正确地解析，即：如果 `text` 是有效的 JSON 字符串，则解析它并返回解析后的结果，否则，返回原来的 `text`
* @param `text ?:  string`   被解析的字符串
* @returns `any` 解析后的值