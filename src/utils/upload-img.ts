import { constructNativeImgUrl } from "./construct-native-img-url";
import { bucket } from "./backblaze";

export const uploadImg = async (file: string, ext: string) => {
  const fileId = await bucket.uploadImage({
    imageBuffer: Buffer.from(file, "base64"),
    fileType: ext,
  });

  return constructNativeImgUrl(fileId);
};
