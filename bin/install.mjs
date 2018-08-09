#!/usr/bin/env node --experimental-modules
import program from 'commander'
import pkg from '../package.json'
import multiline from 'multiline'
import Install from '../lib/install.mjs'
import colors from 'colors'
import config from '../package.json'

const start = async () => {
  program
    .version(config.version)
    .option('-v, --version', 'output the version number', () => {
      console.log(config.version)
    })
    .usage('<command> [options]')
    .command('init', '使用模板初始化项目')

  program
    .command('install [name]')
    // .usage(multiline(function(){
    //
    // }))
    .description('安装组件')
    .action((name, prog) => {
      console.log(colors.cyan(`安装${name || 'toast'}组件...`))
      Install.exec(name)
    })

    program.parse(process.argv)
}



start()
