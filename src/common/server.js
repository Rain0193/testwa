const { fork } = require("child_process");
const server = fork("src/main/appium-server");
server.on("message", msg => {
  console.log(`[electron renderer] server pid is ${msg}`);
});
