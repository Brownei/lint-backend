module.exports = {
  apps: [
    {
      name: 'lint-api',
      script: './dist/main.js',
      cwd: '/path/to/your/nestjs/app',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
