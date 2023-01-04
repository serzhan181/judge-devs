/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Flex, IconButton, Input, Text } from "@chakra-ui/react";
import type { FC } from "react";
import { useRef, useState } from "react";
import { Download, X } from "react-feather";
import Image from "next/image";

type InputImageProps = {
  previewUrl: string;
  onUnselectImage: () => void;
  onFileChange: (file: File | undefined) => void;
};

export const InputImage: FC<InputImageProps> = ({
  onFileChange,
  onUnselectImage,
  previewUrl,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const onClickFile = () => fileRef.current?.click();

  return (
    <Flex
      width="720px"
      height="360px"
      border={`2px ${previewUrl ? "solid" : "dashed"}`}
      borderColor="teal.500"
      borderRadius="md"
      justifyContent="center"
      alignItems="center"
      position="relative"
      overflow="hidden"
    >
      {previewUrl ? (
        <>
          <Flex position="absolute" zIndex="overlay" inset="0">
            <IconButton
              position="absolute"
              colorScheme="teal"
              top="2"
              right="2"
              aria-label="delete image"
              icon={<X />}
              onClick={onUnselectImage}
            />
          </Flex>
          <Image
            src={previewUrl}
            alt="uploaded image"
            fill
            style={{ objectFit: "contain" }}
          />
        </>
      ) : (
        <Flex
          flexDir="column"
          color="teal.300"
          justifyContent="center"
          alignItems="center"
        >
          <>
            <Input
              type="file"
              display="none"
              ref={fileRef}
              onChange={(e) => {
                onFileChange(e.target.files![0]);
              }}
              accept="image/x-png,image/jpg,image/jpeg,image/webp"
            />
            <IconButton
              icon={<Download />}
              aria-label="upload image"
              onClick={onClickFile}
            />
            <Text textAlign="center">Upload an image</Text>
          </>
        </Flex>
      )}
    </Flex>
  );
};

type UseInputImgParams = {
  defaultValues?: {
    fileUrl?: string;
  };
};

export const useInputImg = ({ defaultValues }: UseInputImgParams) => {
  const [file, setFile] = useState<File | undefined>();
  const [fileUrl, setFileUrl] = useState(defaultValues?.fileUrl || "");

  const handlePreviewImg = (file: File | undefined) => {
    if (!file) return "";
    const url = URL.createObjectURL(file);

    return url;
  };

  return { file, setFile, fileUrl, setFileUrl, handlePreviewImg };
};
