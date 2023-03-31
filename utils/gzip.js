const zlib = require('zlib');
const fs = require('fs');
const path = require('path')
if(!fs.existsSync(path.resolve(__dirname,  'public', 'repeat.txt'))) {
    const data = new Array(10000).fill('repeat').join(' ')
    fs.writeFileSync(path.resolve(__dirname,  'public', 'repeat.txt'), data)
}
let content = fs.readFileSync(path.resolve(__dirname, 'public', 'repeat.txt'))
// gzip 不适合重复率低的内容 ，gzip核心就是相同替换的方案
zlib.gzip(content,function (err,data) {
    fs.writeFileSync(path.resolve(__dirname,  'public', 'gzip-repeat.txt'), data)
})
const originalSize = fs.statSync(path.resolve(__dirname, 'public', 'repeat.txt')).size
const gzippedSize = fs.statSync(path.resolve(__dirname, 'public', 'gzip-repeat.txt')).size
console.log('原repeat.txt大小:',originalSize);
console.log('gzip压缩后repeat.txt大小:',gzippedSize);
