# siwe-quickstart

SIWE Quickstart is an extremely basic Client/Server demo to help developers get their hands on a fully functional and easy to understand demo.

A code-along tutorial can be found at [docs.login.xyz](https://docs.login.xyz).

## run

```bash
# 00
npm install
node .\00_print\src\index.js

# 01
npm install
npm start
```

## EIP-4361

EIP-4361 是 SIWE 的标准，全称可以理解为“ Sign-In with Ethereum 的登录消息格式规范”。

它规定了登录消息应该长什么样，常见字段包括：

```
domain
address
statement
uri
version
chainId
nonce
issuedAt
```
