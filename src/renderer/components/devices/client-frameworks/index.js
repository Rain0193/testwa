console.log("脚本代码模块");
import JsWdFramework from "./js-wd";
import JsWdIoFramework from "./js-wdio";
import JavaFramework from "./java";
import PythonFramework from "./python";
import RubyFramework from "./ruby";
const frameworks = {
  jsWd: JsWdFramework,
  jsWdIo: JsWdIoFramework,
  java: JavaFramework,
  python: PythonFramework,
  ruby: RubyFramework,
  json: "Json"
};

export default frameworks;
