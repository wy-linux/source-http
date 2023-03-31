const crypto = require('crypto');
// 1.摘要算法 MD5
let r1 = crypto.createHash('md5').update('abcd').digest('base64')
let r2 = crypto.createHash('md5').update('a').update('b').update('cd').digest('base64')
console.log(r1,r2)//true
// 2. 加盐算法 （盐值，秘钥）
// 可以把秘钥生成一个1k大小的 随机的字符，在用作秘钥  jwt的原理
let r3 = crypto.createHmac('sha256','zf1').update('abcd').digest('base64')
console.log(r3)