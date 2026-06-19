const fs = require('fs')
const path = require('path')
const https = require('https')

const targetDir = path.join(__dirname, 'packages', 'core', 'src', 'modules', 'renderer', 'assets', 'fonts')
fs.mkdirSync(targetDir, { recursive: true })

function download(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, filename).then(resolve, reject)
      }
      const file = fs.createWriteStream(path.join(targetDir, filename))
      res.pipe(file)
      file.on('finish', () => {
        file.close(resolve)
      })
    }).on('error', reject)
  })
}

Promise.all([
  download('https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf', 'Anton-Regular.ttf'),
  download('https://github.com/google/fonts/raw/main/ofl/hankengrotesk/HankenGrotesk%5Bwght%5D.ttf', 'HankenGrotesk-Regular.ttf'),
  download('https://github.com/google/fonts/raw/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf', 'JetBrainsMono-Medium.ttf')
]).then(() => console.log('Fonts downloaded'))
.catch(console.error)
