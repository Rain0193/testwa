"use strict";
const fs = require("fs");
const path = require("path");
const asc = require("assemblyscript/cli/asc");

function mkDirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkDirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}
module.exports = function loader() {
  if (this.cacheable) this.cacheable();
  var buildTempPath = path.join(this._compiler.context, "/dist/assembly/");
  var targetPath = path.join(
    buildTempPath,
    path.parse(this.resourcePath).name + ".wasm"
  );
  mkDirsSync(buildTempPath);
  asc.main(
    [
      path.relative(process.cwd(), this.resourcePath),
      "-b",
      path.relative(process.cwd(), targetPath),
      "-O3z",
      "--validate",
      "--sourceMap",
      "--optimize",
      "--noDebug"
    ],
    err => {
      if (err) return this.async()(err);
      const asm = fs.readFileSync(targetPath);
      this.async()(
        null,
        `const buffer = new ArrayBuffer(${new Buffer(asm).length});
        const uint8 = new Uint8Array(buffer);
        uint8.set([${new Buffer(asm).join(",")}]);
        module.exports = new WebAssembly.Instance(new WebAssembly.Module(uint8), {}).exports;`
      );
    }
  );
};
