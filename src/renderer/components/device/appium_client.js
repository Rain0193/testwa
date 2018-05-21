import { promiseChainRemote } from "wd";
var driver = promiseChainRemote("0.0.0.0", 4723);
var desired = {
  platformName: "Android",
  deviceName: "GU6D656999999999",
  // @ts-ignore
  app: `${__static}/files/ApiDemos-debug.apk`
};
async function main() {
  console.log(await driver.init(desired).source());
}
main();
