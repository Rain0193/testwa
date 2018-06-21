module.exports = {
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [
      {
        include: /assembly/,
        test: /\.ts?$/,
        loader: "./as-loader"
      }
    ]
  }
};
