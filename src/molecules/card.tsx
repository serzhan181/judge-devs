import {
  Card as ChakraCard,
  CardBody,
  CardFooter,
  Stack,
  Heading,
} from "@chakra-ui/react";
import type { FC } from "react";
import Image from "next/image";
import { Hashtag } from "../atoms/hashtag";
import { StyledNextLink } from "../atoms/styled-next-link";
import { useRouter } from "next/router";

type CardProps = {
  name: string;
  imageSrc: string;
  username: string;
  id: string;
  hashtags: {
    id: string;
    name: string;
  }[];
};

export const Card: FC<CardProps> = ({
  name,
  username,
  imageSrc,
  hashtags,
  id,
}) => {
  const router = useRouter();

  return (
    <ChakraCard
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      backgroundColor="blackAlpha.500"
    >
      <Image src={imageSrc} alt={name} width={200} height={200} />

      <Stack>
        <CardBody>
          <Heading size="md">
            <StyledNextLink href={`/project/${id}`}>{name}</StyledNextLink>
          </Heading>

          <StyledNextLink href="/user/42">u/{username}</StyledNextLink>
        </CardBody>

        <CardFooter gap={1}>
          {hashtags.map((h) => (
            <Hashtag
              key={h.id}
              text={h.name}
              cursor="pointer"
              onClick={() =>
                router.push({
                  query: {
                    search: `#${h.name}`,
                  },
                })
              }
            />
          ))}
        </CardFooter>
      </Stack>
    </ChakraCard>
  );
};
