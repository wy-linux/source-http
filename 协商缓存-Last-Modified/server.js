const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const server = http.createServer((req, res) => {
    let { pathname, query } = url.parse(req.url, true);
    let filePath = path.join(__dirname, 'public', pathname);
    res.setHeader('Cache-Control', 'max-age=10');
    fs.stat(filePath, function(err, statObj) {
        if (err) {
            res.statusCode = 404;
            res.end('NOT FOUND')
        } else {
            if (statObj.isFile()) {
                const ctime = statObj.ctime.toGMTString();
                if (req.headers['if-modified-since'] === ctime) {
                    res.statusCode = 304; // 去浏览器缓存中找吧
                    res.end(); // 表示此时服务器没有响应结果
                } else {
                    res.setHeader('Last-Modified', ctime)
                    res.setHeader('Content-Type', mime.getType(filePath) + ';charset=utf-8')
                    fs.createReadStream(filePath).pipe(res);
                }
            } else {
                // 如果是目录 需要找目录下的index.html
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
})
server.listen(3000, () => {
    console.log(`server start 3000`)
})