// const AWS = require('aws-sdk')
// const ext = require('ext-name')
const CONFIG = require('./aws-config')
const FormData = require('form-data')
const got = require('got')

// AWS.config.loadFromPath('/app/config.json')

// const s3 = new AWS.S3({
//   region: CONFIG.S3_REGION
// })

// module.exports = function saveToS3 (name, file) {
//   let fileType = ext(name)[0] || {}
//   if ((fileType.mime || '').indexOf('text') !== -1) {
//     fileType.mime += ';charset=utf-8'
//   }
//   return new Promise((resolve, reject) => {
//     s3.upload({
//       Bucket: CONFIG.S3_BUCKET_NAME,
//       Key: name,
//       Body: file,
//       ContentType: fileType.mime
//     }, (err, data) => {
//       if (err) reject(err)
//       else resolve(data)
//     })
//   })
// }

const api = 'https://api.imgur.com/3/image'

module.exports = async function saveToImagur (name, file) {
  const data = new FormData()
  data.append('image', file)
  let { body } = await got(api, {
    method: 'POST',
    body: data,
    headers: {
      Authorization: `Client-ID ${CONFIG.IMAGUR_CLIENT_ID}`
    }
  })
  body = JSON.parse(body)
  return body.data.link
}
