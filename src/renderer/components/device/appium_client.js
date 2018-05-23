import { remote } from "wd";
const driver = remote("promiseChain");

async function main() {
  console.log(await driver.init().source());
}
main();
