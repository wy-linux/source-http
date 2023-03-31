const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime');

const server = http.createServer((req, res) => {
    let { pathname, query } = url.parse(req.url, true);
    if (req.headers.origin) {
        // 表示谁来访问服务器都可以 (token 不是cookie，cookie跨域不能使用 *)
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
        // 服务器告诉浏览器 我能识别你自定的header
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,token')
        // 每隔10s试探一次
        res.setHeader('Access-Control-Max-Age', '10');
        // 我服务可以接受哪些方法的请求
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,POST,OPTIONS')
        // 表示运行携带cookie了
        res.setHeader('Access-Control-Allow-Credentials', true)
        if (req.method === 'OPTIONS') {
            return res.end(); // 表示是一个试探型请求 不要处理就ok
        }
    }
    let filePath = path.join(__dirname, pathname);
    if (pathname === '/login' && req.method == 'POST') {
        const buffer = [];
        req.on('data', function(chunk) {
            buffer.push(chunk);
        });
        req.on('end', function() {
            if (req.headers['content-type'] === 'application/json') {
                let obj = JSON.parse(buffer.toString()); // 回显json
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(obj));
            }
        })
    } else {
        fs.stat(filePath, function(err, statObj) {
            if (err) {
                res.statusCode = 404;
                res.end('NOT FOUND')
            } else {
                if (statObj.isFile()) {
                    res.setHeader('Content-Type', mime.getType(filePath) + ';charset=utf-8')
                    fs.createReadStream(filePath).pipe(res);
                } else {
                    let htmlPath = path.join(filePath, 'index.html');
                    fs.access(htmlPath, function(err) {
                        if (err) {
                            res.statusCode = 404;
                            res.end('NOT FOUND')
                        } else {
                            res.setHeader('Content-Type', 'text/html;charset=utf-8')
                            fs.createReadStream(htmlPath).pipe(res);
                        }
                    })
                }
            }
        })
    }
})

server.listen(5000, () => {
    console.log(`server start 5000`)
})