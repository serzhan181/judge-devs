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
import { motion } from "framer-motion";

export type Action = {
  label: string;
  onClick: (id: string) => void;
  type?: "danger" | "default";
  disabled?: boolean;
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
      as={motion.div}
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      backgroundColor="blackAlpha.500"
      whileHover={{ y: "-2%" }}
      _hover={{ borderColor: "whiteAlpha.500" }}
      h={{ base: "full", md: "40" }}
    >
      <Flex
        justifyContent={{ base: "center", md: "center" }}
        w={{ base: "full", md: "64" }}
      >
        <Image
          style={{ objectFit: "contain", width: "auto", height: "auto" }}
          src={imageSrc}
          alt={name}
          width={245}
          height={250}
          sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
        />
      </Flex>

      <Stack w="full">
        <CardBody display="flex" justifyContent="space-between">
          <Flex flexDir="column">
            <Heading size="md">
              <StyledNextLink href={`/project/${id}`}>{name}</StyledNextLink>
            </Heading>

            <StyledNextLink href="/user/42">u/{username}</StyledNextLink>
          </Flex>

          {Boolean(actions?.length) && (
            <Flex>
              <Menu isLazy>
                <MenuButton
                  as={IconButton}
                  variant="ghost"
                  aria-label="card actions"
                  icon={<MoreVertical />}
                />

                <MenuList>
                  {actions?.map((a) => (
                    <MenuItem
                      key={a.label}
                      onClick={() => a.onClick(id)}
                      disabled={true}
                    >
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
