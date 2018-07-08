#!/usr/bin/env node --experimental-modules
import program from 'commander'
import config from '../package.json'

program
  .version(config.version)
  .usage('<command> [options]')
  .command('init', '使用一个模板初始化你的项目')

program.parse(process.argv)