const fs = require('fs');
const path = './assets/scripts/proto/proto_bundle.js';

if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');

    // 1. 将开头的 require 语句替换掉，直接从全局获取 protobuf
    // 假设你已经在项目中正确安装了 protobufjs
    content = 'import protobuf from "protobufjs/minimal.js";\n' + content;
    content = content.replace(/var \$protobuf = require\("protobufjs\/minimal"\);/, 'var $protobuf = protobuf;');

    // 2. 修复导出（根据你的 proto package 结构，在末尾强制导出）
    // 假设你的 proto 里 package 叫 tutorial 或没写 package (则是 $root)
    content += '\nexport { $root as default };';

    fs.writeFileSync(path, content);
    console.log('Successfully fixed proto_bundle.js for Cocos 3.8');
}