let re = new RegExp("^/test(/\\d+)?/?$");

let str = "/test/512345/";
console.log(str.match(re));
