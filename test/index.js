const jsonTls = require("../dist/json-tls.cjs");


let gby = {
    name:"郭斌勇",
    contactWay:{
        email:"guobinyong@qq.com",
        weixin:"keyanzhe"
    },
    map:new Map([["a","aa"],["b","bb"]])
};

console.log(jsonTls.customJSONStringify(gby));
console.log(jsonTls.deepCopyByJSON(gby));

