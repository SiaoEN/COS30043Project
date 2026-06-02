// utils/gridfsUpload.js

import { bucket } from '../config/db.js'
import { Readable } from 'stream'

export const uploadToGridFS = (file) => {
  return new Promise((resolve, reject) => {

    const bucket = getBucket()

    const filename =
      Date.now() + '-' + file.originalname

    const uploadStream =
      bucket.openUploadStream(filename)

    Readable
      .from(file.buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {

        resolve({
          filename,
          id: uploadStream.id
        })

      })
  })
}