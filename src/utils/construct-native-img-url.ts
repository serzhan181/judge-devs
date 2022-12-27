import { env } from "../env/server.mjs";

export const constructNativeImgUrl = (fileId: string) => {
  return `${env.BUCKET_DOWNLOAD_URL}/b2_download_file_by_id?fileId=${fileId}`;
};
