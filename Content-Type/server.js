const http = require('http')
const url = require('url')
const path = require('path');
const fs = require('fs')
const mime = require('mime')
const querystring = require('querystring')
const MultipartyParse = require('node-wangyu-multiparty')

const server = http.createServer((req, res) => {
    let { pathname, query } = url.parse(req.url, true);
    if (pathname === '/upload' && req.method == 'POST') {
        if (req.headers['content-type']?.includes('multipart/form-data')) {  
            const multiparty = new MultipartyParse(req)
            multiparty.on('fields', (fields, files) => {
                res.end(JSON.stringify(multiparty.files))
            })
        }
        const buffer = [];
        req.on('data', function(chunk) {
            buffer.push(chunk);
        });
        req.on('end', function() {
            let buf = Buffer.concat(buffer); 
            if (req.headers['content-type'] === 'application/json') {
                let obj = JSON.parse(buf.toString())
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(obj));
            } else if (req.headers['content-type'] === 'text/plain') {
                res.setHeader('Content-Type', 'text/plain')
                res.end(buf.toString());
            } else if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                // {username:"123"}  username=123&password=456  a=1; b=2
                let r = querystring.parse(buf.toString(), '&', '='); // 可以将查询字符串 转化成对象
                res.end(JSON.stringify(r));
            }
        })
    } else {
        let filePath = path.join(__dirname, pathname);
        fs.stat(filePath, function(err, statObj) {
            if (err) {
                res.statusCode = 404;
                res.end('NOT FOUND')
            } else {
                if (statObj.isFile()) {
                    res.setHeader('Content-Type', mime.getType(filePath) + ';charset=utf-8')
                    fs.createReadStream(filePath).pipe(res);
                } else {
                    let htmlPath = path.join(filePath, 'client.html');
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