module = {
  apps: [
    {
      name: 'storyforge-api',
      script: './backend/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'storyforge-workers',
      script: './backend/dist/index.js',
      instances: 3,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        IS_WORKER_NODE: 'true',
      },
    },
  ],
};
