const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
    let { pathname, query } = url.parse(req.url, true);
    let filePath = path.join(__dirname, 'public', pathname);
    // Cache-Control no-cache 每次都像服务器发送请求,会存到浏览器的缓存中
    res.setHeader('Cache-Control', 'no-cache');
    fs.stat(filePath, function(err, statObj) {
        if (err) {
            res.statusCode = 404;
            res.end('NOT FOUND')
        } else {
            if (statObj.isFile()) {
                let content = fs.readFileSync(filePath)
                let etag = crypto.createHash('md5').update(content).digest('base64')
                if(req.headers['if-none-match'] === etag) {
                    res.statusCode = 304;
                    res.end();
                }else{
                    res.setHeader('Etag', etag)
                    res.setHeader('Content-Type', mime.getType(filePath) + ';charset=utf-8')
                    fs.createReadStream(filePath).pipe(res);
                }
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
});

server.listen(3000, () => {
    console.log(`server start 3000`)
})