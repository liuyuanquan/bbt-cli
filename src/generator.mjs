import MetalSmith from 'metalsmith' // HTML静态页面生成器
import handleBars from 'handlebars' // 模板引擎
import inquirer from 'inquirer' // 命令行交互
import { runCommand } from './utils.mjs'
import path from 'path'
import fs from 'fs'

// 这里不能用箭头函数
handleBars.registerHelper('if_eq', function (a, b, options) {
  return a === b ? opts.fn(this) : opts.inverse(this)
})

handleBars.registerHelper('unless_eq', function (a, b, options) {
  return a === b ? opts.inverse(this) : opts.fn(this)
})

// 中间件 询问问题
const askQuestions = prompts => {
  return async (files, metalsmith, done) => {
    const metadata = metalsmith.metadata()
    for (let name of Object.keys(prompts)) {
      const question = prompts[name]
      const { message, type, _default, choices } = question
      let option = { name, message, type, default: _default }
      if (Object.is(type, 'list')) {
        option = { ...option, choices }
      }
      await inquirer.prompt([option]).then(answer => {
        metadata[name] = answer[name]
      })
    }
    done()
  }
}

// 中间件 过滤文件
const filterFiles = (filters) => {
  return (files, metalSmith, done) => {
    const metadata = metalSmith.metadata()
    for(let file of Object.keys(filters)) {
      const name = filters[file]
      !metadata[name] && Reflect.deleteProperty(files, file)
    }
    done()
  }
}

// 中间件 渲染文件
const renderFiles = () => {
  return (files, metalSmith, done) => {
    const metadata = metalSmith.metadata()
    for(let fileName of Object.keys(files)) {
      const contentsStr = files[fileName].contents.toString()
      files[fileName].contents = new Buffer(handleBars.compile(contentsStr)(metadata))
    }
    done()
  }
}

export default (projectName, templatePath, projectPath, done) => {
  let options
  // 读取meta.json
  try {
    options = fs.readFileSync(path.resolve(templatePath, 'meta.json'), { encoding: 'utf-8' })
    options = JSON.parse(options)
  } catch(error) {
    console.log('meta.json读取失败')
    return 
  }
  // 初始化metalSmith实例
  const metalSmith = MetalSmith(path.resolve(templatePath, 'template'))

  // 使用中间件
  metalSmith
    .use(askQuestions(options.prompts))
    .use(filterFiles(options.filters))
    .use(renderFiles())

  metalSmith
    .clean(false)
    .source('.')
    .destination(projectPath)
    .build(async (error, files) => {
      if (error) {
        console.log(error)
        return 
      } 
      // 是否自动运行npm install
      const autoInstall = metalSmith.metadata()['autoInstall']
      if (autoInstall) {
        const cwd = projectPath
        console.log('正在安装依赖......')
        await runCommand('npm', ['install'], { cwd })
        done()
      } else {
        done()
      }
    })
}