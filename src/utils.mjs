import child_process from 'child_process'

export function runCommand(command, args = [], options = {}) {
  const defaultOptions = {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: true
  }
  return new Promise((resolve, reject) => {
    const spawn = child_process.spawn(command, args, { ...defaultOptions, ...options })
    spawn.on('exit', (data) => {
      resolve()
    })
  })
}