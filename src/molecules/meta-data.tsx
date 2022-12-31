import { Flex, Text } from "@chakra-ui/react";
import type { FC } from "react";
import { RoundedImage } from "../atoms/rounded-image";
import { StyledNextLink } from "../atoms/styled-next-link";
import { fromNow } from "../utils/fromNow";

type MetaDataProps = {
  creatorImage: string | null;
  creatorName: string | null;

  createdAt?: Date;
};

export const MetaData: FC<MetaDataProps> = ({
  creatorName,
  creatorImage,
  createdAt,
}) => {
  return (
    <Flex gap={2}>
      <Flex color="gray" gap={2}>
        <RoundedImage
          src={creatorImage || "/static/images/user-placeholder.png"}
          width={25}
          height={25}
          alt={"creator"}
        />
        <StyledNextLink href="/user/42">u/{creatorName}</StyledNextLink>
      </Flex>
      {createdAt && (
        <>
          <Text color="gray" as="span">
            &#8226;
          </Text>

          <Text color="gray">{fromNow(createdAt)}</Text>
        </>
      )}
    </Flex>
  );
};
