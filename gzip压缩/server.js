const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const mime = require('mime');
// 浏览器会给我发一个 accpet-encoding的字段 我要看一下浏览器支持什么压缩
const gzipFile = (req, res) => { 
    let encodings = req.headers['accept-encoding'];
    if (encodings) { // 浏览器支持压缩
        if (encodings.includes('gzip')) {
            res.setHeader('Content-Encoding','gzip'); // 浏览器要知道服务器的压缩类型
            return zlib.createGzip();
        } else if (encodings.includes('deflate')) {
            res.setHeader('Content-Encoding','deflate');
            return zlib.createDeflate();
        }
    }
    return false; // 浏览器不支持压缩
}
const server = http.createServer((req,res)=>{
    let {pathname,query} = url.parse(req.url,true);
    let filePath = path.join(__dirname,'public',pathname); 
    // 缓存类型 disk cache  memory cache 代码无法控制
    // Cache-Control no-cache 每次都像服务器发送请求,会存到浏览器的缓存中
    // Cache-Control no-store 每次都像服务器要，但是不会缓存到浏览器里
    res.setHeader('Cache-Control','max-age=10'); // 设置缓存的时长 相对时间
    res.setHeader('Expires',new Date(Date.now() + 10 * 1000).toGMTString()) // 绝对时间
    fs.stat(filePath,function (err,statObj) {
        if(err){
            res.statusCode = 404;
            res.end('NOT FOUND')
        }else{
            if(statObj.isFile()){
                res.setHeader('Content-Type',mime.getType(filePath)+';charset=utf-8')
                if (createGzip = gzipFile(req, res)) { // 看一下支不支持压缩 如果支持 就返回一个压缩流
                    return fs.createReadStream(filePath).pipe(createGzip).pipe(res); 
                }
            }else{
                // 如果是目录 需要找目录下的index.html
                let htmlPath = path.join( filePath,'index.html');
                fs.access(htmlPath,function (err) {
                    if(err){
                        res.statusCode = 404;
                        res.end('NOT FOUND')
                    }else{
                        res.setHeader('Content-Type','text/html;charset=utf-8')
                        fs.createReadStream(htmlPath).pipe(res);
                    }
                })
            }
        }
    })
})
server.listen(3000,()=>{
    console.log(`server start 3000`)
})