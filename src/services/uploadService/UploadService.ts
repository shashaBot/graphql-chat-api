import { S3 } from 'aws-sdk'

const client = new S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  params: { Bucket: process.env.S3_BUCKET},
})
export const uploadToS3 = async file => {
  const { stream, filename, mimetype, encoding } = file

  const response = await client
    .upload({
      Key: filename,
      ACL: 'public-read',
      Body: file.stream,
      Bucket: process.env.S3_BUCKET
    })
    .promise()

  return {
    name: filename,
    url: response.Location
  }
}