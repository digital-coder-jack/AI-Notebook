module.exports = {
  apps: [
    {
      name: 'ai-notebook-web',
      script: 'npm',
      args: 'start',
      cwd: '/home/user/webapp/web',
      env: { NODE_ENV: 'production', PORT: 3000 },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
