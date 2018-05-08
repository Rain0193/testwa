const { devices, driver } = require('../appium')
const desired = {
  platformName: "Android",
  deviceName: "GU6D656999999999",
  app: "tests/ApiDemos-debug.apk",
  automationName: "UiAutomator2"

};
driver.init(desired);
