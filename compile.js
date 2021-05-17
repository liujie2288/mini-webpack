const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
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
  const res = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  // fs.createWriteStream("./babel-result.js").write(res.code);

  return { file, deps, code: res.code };
}

/**
 * 获取依赖
 * @param {*} temp
 * @param {*} param1
 */
function getDeps(result, deps) {
  if (!deps) return;
  Object.keys(deps).forEach((depKey) => {
    const { code, deps: curMoudleDeps } = getModuleInfo(deps[depKey]);
    result[depKey] = code;
    getDeps(result, curMoudleDeps);
  });
}

// 模块解析
function parseModules(file) {
  const entry = getModuleInfo(file);
  const result = {
    "index.js": entry.code,
  };
  getDeps(result, entry.deps);
  return result;
}

// 生成文件
function build(entryfile) {
  const result = parseModules(entryfile);
  fse.outputFile(
    "./build/bundle.js",
    `(function (list) {
    function require(file) {
      var exports = {};
      (function (exports, code) {
        eval(code);
      })(exports, list[file]);
      return exports;
    }
    require("index.js");
  })(${JSON.stringify(result, null, 2)});`,
    function (error) {
      if (error) throw error;
      console.log("构建成功");
    }
  );
}
build("./src/index.js");
