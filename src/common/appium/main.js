var wd = require("wd");
var driver = wd.promiseChainRemote("0.0.0.0", 4723);

var desired = {
  platformName: "Android",
  deviceName: "GU6D656999999999",
  app: "tests/ApiDemos-debug.apk"
};
async function main(){
 const aa= await driver.init(desired).source();
 console.log(aa)
}
 const bb= main()
console.log(bb)