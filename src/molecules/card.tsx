import {
  Card as ChakraCard,
  CardBody,
  CardFooter,
  Stack,
  Heading,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
} from "@chakra-ui/react";
import type { FC } from "react";
import Image from "next/image";
import { Hashtag } from "../atoms/hashtag";
import { StyledNextLink } from "../atoms/styled-next-link";
import { useRouter } from "next/router";
import { MoreVertical } from "react-feather";

type Action = {
  label: string;
  onClick: () => void;
  type?: "danger" | "default";
};

type CardProps = {
  name: string;
  imageSrc: string;
  username: string;
  id: string;
  hashtags: {
    id: string;
    name: string;
  }[];

  actions?: Action[];
};

export const Card: FC<CardProps> = ({
  name,
  username,
  imageSrc,
  hashtags,
  id,
  actions,
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

      <Stack w="full">
        <CardBody display="flex" justifyContent="space-between">
          <Flex flexDir="column">
            <Heading size="md">
              <StyledNextLink href={`/project/${id}`}>{name}</StyledNextLink>
            </Heading>

            <StyledNextLink href="/user/42">u/{username}</StyledNextLink>
          </Flex>

          {actions?.length && (
            <Flex>
              <Menu isLazy>
                <MenuButton
                  as={IconButton}
                  variant="ghost"
                  aria-label="card actions"
                  icon={<MoreVertical />}
                />

                <MenuList>
                  {actions.map((a) => (
                    <MenuItem key={a.label} onClick={a.onClick}>
                      <Text color={a?.type === "danger" ? "red" : "current"}>
                        {a.label}
                      </Text>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Flex>
          )}
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
