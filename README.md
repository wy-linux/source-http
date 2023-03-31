### 以Node服务为基础，提升对http协议及其相关字段的理解
```shell
//node-wangyu-multiparty 见：https://github.com/wy-linux/node-wangyu-multiparty
1. npm install  下载相关依赖
2. node server.js 运行相关服务
```
###### 文件结构
- public目录：存放index.html及其相关 缓存文件
- server.js：开启node服务，可“同源”获取相应的index.html
- client.html：客户端页面，可通过live-server启动
- utils目录：node服务中的一些工具方法