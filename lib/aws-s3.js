const AWS = require('aws-sdk')
const CONFIG = require('./aws-config')

AWS.config.update({
  region: CONFIG.S3_REGION,
  accessKeyId: CONFIG.S3_ACCESS_ID,
  secretAccessKey: CONFIG.S3_ACCESS_SECRET
})

const s3 = new AWS.S3()

module.exports = function saveToS3 (name, file) {
  return new Promise((resolve, reject) => {
    s3.upload({
      Bucket: CONFIG.S3_BUCKET_NAME,
      Key: name,
      Body: file,
      ACL: 'public-read'
    }, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}
