module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify({}),
    }),
  ],
};
