#!/usr/bin/env node --experimental-modules
import inquirer from 'inquirer' // 命令行交互
import program from 'commander' // 用来处理命令行
import chalk from 'chalk' // 高亮
import home from 'user-home' // 获取用户的根目录
import download from '../lib/download.mjs' // 下载仓库
import generator from '../lib/generator.mjs' // 渲染模板
import fs from 'fs'
import path from 'path'

const start = async () => {
  let
    projectName, // 项目名称
    projectPath, // 项目路径
    rootPath, // 根目录
    rootName, // 根目录名称
    template, // 模板名称
    templatePath, //模板路径
    repo // 仓库地址

  program
    .usage('[项目名称]')
    .on('--help', () => {
      console.log('  Examples:')
      console.log()
      console.log(chalk.gray('    # 初始化你的项目'))
      console.log('    $ babytree init my-project')
      console.log()
    })
    .parse(process.argv)
  
  projectName = program.args[0] // 项目名称
  if (Object.is(projectName, undefined)) {
    program.help()
    return
  } 
  rootPath = path.resolve(process.cwd()) // 根目录
  rootName = path.basename(rootPath) // 根目录名称

  // 获取根目录下的所有文件
  const allFiles = fs.readdirSync(rootPath)
  if (Object.is(allFiles.length, 0)) {
    // 当前目录为空
    if (Object.is(rootName, projectName)) {
      const create = await inquirer.prompt([{
        name: 'inPlace',
        message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
        type: 'confirm',
        default: true
      }]).then(answer => answer.inPlace)
      if (create) {
        projectPath = rootPath
      } else {
        return
      }
    } else {
      projectPath = path.resolve(rootPath, projectName)
    }
  } else {
    // 当前目录不为空，查找是否有同名文件
    const exist = allFiles.some(name => {
      const fileName = path.resolve(rootPath, name)
      const isDir = fs.statSync(fileName).isDirectory()
      return isDir && Object.is(name, projectName)
    })  
    if (exist) {
      console.log(chalk.red(`项目${ projectName }已存在`))
      return
    } else {
      projectPath = path.resolve(rootPath, projectName)
    }
  }

  const choices = ['wepy', 'vue', 'react', '原生小程序', '普通H5', '自定义模板']
  let message = '你想创建什么类型的项目'
  let selectIndex = 0
  template = choices[selectIndex]
  let support = false
  // 选择模板
  while (!support) {
    await inquirer.prompt([{
      name: 'template',
      message,
      type: 'list',
      choices,
      default: selectIndex
    }]).then(answer => {
      template = answer.template
      selectIndex = choices.indexOf(template)
      if (Object.is(selectIndex, 0)) {
        support = true
      } else if (Object.is(selectIndex, 1)) {
        message = '该模板还在开发中，请重新选择'
        support = false
      } else if (Object.is(selectIndex, 2)) {
        message = '该模板还在开发中，请重新选择'
        support = false
      } else if (Object.is(selectIndex, 3)) {
        message = '该模板还在开发中，请重新选择'
        support = false
      } else if (Object.is(selectIndex, 4)) {
        message = '该模板还在开发中，请重新选择'
        support = false
      } else if (Object.is(selectIndex, 5)) {
        message = '该模板还在开发中，请重新选择'
        support = false
      } else {
        message = '该模板还在开发中，请重新选择'
        support = false
      }
      return 
    })
  }

  //如果是自定义模板，需要提供自定义模板路径
  if (Object.is(selectIndex, 5)) {
    // template = 'custome/repositry'
    // repo = template
    // templatePath = path.resolve(home, '.custome-templates/', template)
  } else {
    repo = `liuyuanquan/babytree-${ template }-template`
    templatePath = path.resolve(home, '.babytree-templates/', template)
  }
  // 下载模板
  download(repo, templatePath).then((status) => {
    if (status) {
      // 渲染模板
      generator(projectName, templatePath, projectPath, () => {
        console.log('项目创建成功')
      })
    } else {
      console.log('模板下载失败')
    }
  })
}

start()
