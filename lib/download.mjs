import download from 'download-git-repo' // 下载远程仓库
import ora from 'ora' // loading效果
import rimraf from 'rimraf' // 相当于 rm -rf
import fs from 'fs'

Reflect.defineProperty(Promise, 'try', {
  configurable: true,
  enumerable: true,
  writable: true,
  value(fn) {
    return new Promise((resolve, reject) => {
      resolve(fn())
    })
  }
})

export default (repo, dist) => {
  return Promise.try(() => {
    const exist = fs.existsSync(dist)
    exist && rimraf.sync(dist)  
  }).then(() => {
    const spinner = ora(`开始下载模板`)
    spinner.start()
    return new Promise((resolve, reject) => {
      download(repo, dist, { clone: true }, err => {
        spinner.stop()
        if (err) {
          resolve(false) 
        } 
        resolve(true)
      })
    })
  }).catch(error => {
    return false
  })
}




new Promise((resolve, reject) => {  

})