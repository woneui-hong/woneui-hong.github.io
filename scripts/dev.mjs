const { spawn } = require('child_process')
const path = require('path')

const root = path.join(__dirname, '..')
const adminPort = process.env.ADMIN_API_PORT || '3008'

const adminServer = spawn('node', ['scripts/admin-server.js'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, ADMIN_API_PORT: adminPort },
})

const nextDev = spawn('npx', ['next', 'dev', '-p', '3007'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, ADMIN_API_PORT: adminPort },
})

function shutdown() {
  adminServer.kill()
  nextDev.kill()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

adminServer.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Admin server exited with code ${code}`)
    nextDev.kill()
    process.exit(code)
  }
})

nextDev.on('exit', (code) => {
  adminServer.kill()
  process.exit(code ?? 0)
})
