const AWS = require('aws-sdk')

// S3对象存储配置
const S3_BUCKET_NAME = 's3-006-shit-ctphg-uat-bjs'
const S3_ACCESS_ID = 'AKIAPH7OLC3PP2YDLR3A'
const S3_ACCESS_SECRET = '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'

AWS.config.update({
  region: 'cn-north-1',
  accessKeyId: S3_ACCESS_ID,
  secretAccessKey: S3_ACCESS_SECRET
})

const s3 = new AWS.S3()

module.exports = function saveToS3 (name, file) {
  return new Promise((resolve, reject) => {
    s3.upload({
      Bucket: S3_BUCKET_NAME,
      Key: name,
      Body: file,
      ACL: 'public-read'
    }, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}
