const path = require("path");
const fs = require("fs");
const astParser = require("@babel/parser");
const astTraverse = require("@babel/traverse").default;
const babel = require("@babel/core");

// 编译与AST解析
function getModuleInfo(file) {
  const content = fs.readFileSync(file, { encoding: "utf-8" });
  const ast = astParser.parse(content, {
    sourceType: "module",
  });
  // 依赖收集
  const deps = {};
  astTraverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(file);
      const abspath = "./" + path.join(dirname, node.source.value);
      deps[node.source.value] = abspath;
    },
  });
  // console.log(deps)  { './add.js': './src/add.js' }

  // es6转es5
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  const moduleInfo = { file, deps, code };
  return moduleInfo;
}


/**
 * 获取依赖
 * @param {*} temp 
 * @param {*} param1 
 */
 function getDeps(temp, { deps }) {
  Object.keys(deps).forEach((key) => {
    const child = getModuleInfo(deps[key]);
    temp.push(child);
    getDeps(temp, child);
  });
}

// 模块解析
function parseModules(file){
  const entry = getModuleInfo(file);

}

parseModules("./src/index.js");
