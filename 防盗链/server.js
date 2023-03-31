const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime')

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
                //防盗链 referer 字段
                const refer = req.headers["referer"] || req.headers["referered"];
                if(!refer) {
                    res.statusCode = 404;
                    return res.end('NOT FOUND')
                }
                const {hostname} = url.parse(refer, true)
                const [currentHost] = req.headers["host"].split(":")
                if (hostname !== currentHost) {
                    res.statusCode = 404;
                    return res.end('NOT FOUND')
                }
                res.setHeader('Content-Type',mime.getType(filePath)+';charset=utf-8')
                fs.createReadStream(filePath).pipe(res);
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