const AWS = require('aws-sdk')
const ext = require('ext-name')
const { config } = require('./config')

const s3Config = config()

AWS.config.update({
  region: s3Config.S3_REGION,
  accessKeyId: s3Config.S3_ACCESS_ID,
  secretAccessKey: s3Config.S3_ACCESS_SECRET
})

const s3 = new AWS.S3()

module.exports = function saveToS3 (name, file) {
  let fileType = ext(name)[0] || {}
  if ((fileType.mime || '').indexOf('text') !== -1) {
    fileType.mime += ';charset=utf-8'
  }
  return new Promise((resolve, reject) => {
    s3.upload({
      Bucket: s3Config.S3_BUCKET_NAME,
      Key: name,
      Body: file,
      ContentType: fileType.mime
    }, (err, data) => {
      if (err) reject(err)
      else resolve({ link: data.Location })
    })
  })
}
