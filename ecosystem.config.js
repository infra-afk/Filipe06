module.exports = {
  apps: [
    {
      name: 'chua-api',
      cwd: '/home/srv_app/dashboard/apps/api',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/home/srv_app/dashboard/logs/api-error.log',
      out_file: '/home/srv_app/dashboard/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
