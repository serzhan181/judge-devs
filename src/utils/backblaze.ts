// eslint-disable-next-line @typescript-eslint/no-var-requires
const B2 = require("backblaze-b2");
// import B2 from 'backblaze-b2';
import { env } from "../env/server.mjs";
import { makeId } from "./makeId";

const b2 = new B2({
  applicationKey: env.APP_KEY,
  applicationKeyId: env.APP_KEY_ID,
});

class Bucket {
  async init() {
    try {
      await b2.authorize();
      console.log("succesful authorization to backblaze");
    } catch (e) {
      console.log("Error:", e);
    }
  }

  async uploadImage({
    fileType,
    imageBuffer,
    folderName,
  }: {
    fileType: string;
    imageBuffer: Buffer;
    folderName?: string;
  }) {
    const upload = await b2.getUploadUrl({ bucketId: env.BUCKET_ID });

    const filename = `${makeId(7)}.${fileType}`;
    const uploadUrl = upload.data.uploadUrl;

    const file = await b2.uploadFile({
      data: imageBuffer,
      fileName: folderName ? `${folderName}/${filename}` : filename,
      uploadUrl,
      uploadAuthToken: upload.data.authorizationToken,
    });

    console.log(`
      dev logs:
      file: ${file},
      uploadUrl: ${uploadUrl},
      auth: ${upload.data.authorizationToken},
      bucketId: ${env.BUCKET_ID}
    `);

    console.log("file uploaded");

    return file.data.fileId;
  }

  async getFileNameById(fileId: string) {
    const file = await b2.getFileInfo({ fileId });
    return file.data.fileName;
  }

  async deleteImage(fileId: string) {
    try {
      const file = await b2.getFileInfo({ fileId });

      await b2.deleteFileVersion({
        fileId,
        fileName: file.data.fileName,
      });
    } catch (err) {
      console.log("error", err);
    }
  }
}

export const bucket = new Bucket();
