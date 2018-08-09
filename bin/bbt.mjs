#!/usr/bin/env node --experimental-modules
import program from 'commander'
import config from '../package.json'

program
  .version(config.version)
  .option('-v, --version', 'output the version number', () => {
    console.log(config.version)
  })
  .usage('<command> [options]')
  .command('init', '使用模板初始化项目')

program.parse(process.argv)