module.exports = {
  plugins: [
    {
      name: 'typescript',
      options: {
        forkTsChecker: {
          eslint: true
        }
      }
    }
  ]
};
