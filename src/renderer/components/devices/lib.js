const wd = require("wd");
exports.driver = wd.promiseChainRemote("0.0.0.0", 4723);
