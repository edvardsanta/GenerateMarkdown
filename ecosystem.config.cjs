module.exports = {
    apps: [
      {
        name: 'GenerateMarkdown',
        port: '3000',
        exec_mode: 'cluster',
        instances: 2,
        script: './.output/server/index.mjs'
      },
      {
        name: 'GenerateMarkdown-Workers',
        script: './server/workers/teste.ts',
        exec_mode: 'fork',  // Fork mode remains suitable for workers
        instances: 1,
        interpreter: 'bun', 
        env: {
          NODE_ENV: 'production',
          QUEUE_NAME: 'markdown_tasks'
        },
      }
    ]
}
  