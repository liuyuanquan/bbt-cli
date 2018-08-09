import fs from 'fs-extra'
import path from 'path'
import colors from 'colors'
import multiline from 'multiline'
import childProcess from 'child_process'
const spawn = childProcess.spawn
// import prompt from 'prompt'
//
async function runCommand(command, args, callback) {
  let ps = spawn(command, args, { cwd: process.cwd() })
  ps.stdout.pipe(process.stdout)

  ps.on('exit', (error) => {
    if(error) return
    callback && callback()
  })
}

// 安装依赖
function installDependences(packageObj) {
  return new Promise((resolve, reject)=> {
    resolve()
    // 如果已经写了babytree-ui的依赖
    if (packageObj['dependencies'] && packageObj['dependencies']['@bbt/babytree-ui']) {
      resolve(true)
    } else { //没写依赖要重新写依赖
      console.log(2);
      packageObj['dependencies']['@bbt/babytree-ui'] = '*'
      fs.writeJson('../package.json', packageObj, function (err) {
        console.log('3');
        console.log(colors.cyan('安装项目依赖...'))
        if (err) {
          console.log('err:', err)
          resolve(false)
        }
        //2: 执行 npm i 安装
        runCommand('npm', ['install'], () => {
          console.log(colors.green('安装依赖完成!'))
          resolve(true)
        })
      })
    }
  })
}

// 复制组件
function copyComponent(componentName, from, to) {
  fs.copySync(from, to)
  //需要把该组件依赖的组件也拷贝过来
  fs.readJson(`${from}/index.json`, (err, packageObj) => {
    for (let i in packageObj['usingComponents']) {
      if(i !== ''){
        fs.copySync(from, `../packages/${i}`)
        let tpl = path.join('../', 'node_modules', '@bbt/babytree-ui', 'packages', `${i}`)
        copyComponent(i, tpl, to)
      }else {
        return
      }
    }
  })
  console.log(colors.green(`安装组件${componentName}成功`))
}

let Install = {
  exec(name = 'toast') {
    // 将组件从node_modules拷贝到packages目录
    let tpl = path.join('../', 'node_modules', '@bbt/babytree-ui', 'packages', `xcx-${name}`)
    if(fs.existsSync(tpl)) { //判断是否安装了babytree-ui
      copyComponent(name, tpl, `../packages/xcx-${name}`)
    } else {
      //如果没安装
      //1: 先安装
      //2: 安装完了判断组件是否存在，存在的话拷贝过来 不存在的话提示组件不存在
      try {  //读写根目录package.json目录
         fs.readJson('../package.json', (err, packageObj) => {
          // let depend = await installDependences(packageObj)
          colors.green(`安装${name}组件...`)
          if (packageObj['dependencies'] && packageObj['dependencies']['@bbt/babytree-ui']) {
            copyComponent(name, tpl, `../packages/xcx-${name}`)
          } else { //没写依赖要重新写依赖
            packageObj['dependencies']['@bbt/babytree-ui'] = '*'
            fs.writeJson('../package.json', packageObj, function (err) {
              console.log(colors.cyan('安装项目依赖...'))
              if (err) {
                console.log('err:', err)
              }
              //2: 执行 npm i 安装
              runCommand('npm', ['install'], () => {
                console.log(colors.green('安装依赖完成!'))
                copyComponent(name, tpl, `../packages/xcx-${name}`)
              })
            })
          }
        })
      } catch (err) {
        console.log(colors.red('不存在此组件！'))
        console.error(err)
      }
    }
  }
}

export default Install
