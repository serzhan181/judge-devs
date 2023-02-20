import {
  Card as ChakraCard,
  CardHeader,
  CardBody,
  Divider,
  Stack,
  Text,
  Flex,
  Box,
  Spinner,
  StackDivider,
} from "@chakra-ui/react";
import Image from "next/image";
import type { FC } from "react";
import { StyledNextLink } from "../atoms/styled-next-link";
import type { CardProps } from "./card";

type MiniCardProps = Pick<CardProps, "name" | "imageSrc" | "id"> & {
  averageRating: number | null;
};

type SideCardProps = {
  title: string;
  projects: MiniCardProps[];
  isLoading?: boolean;
};

export const SideCard: FC<SideCardProps> = ({ title, projects, isLoading }) => {
  return (
    <ChakraCard
      height="fit-content"
      variant="outline"
      w="full"
      bgColor={"blackAlpha.500"}
      borderRadius="none"
    >
      <CardHeader>
        <Text fontWeight="semibold" fontSize="xl">
          {title}
        </Text>
      </CardHeader>

      <Divider />

      <CardBody>
        {!isLoading ? (
          <Stack spacing="5" divider={<StackDivider />} align="stretch">
            {projects.map((p) => (
              <Flex
                key={p.id}
                alignItems="center"
                justifyContent="space-between"
                gap="2"
              >
                <Flex gap="2" alignItems="center">
                  <Image src={p.imageSrc} width={55} height={55} alt={p.name} />
                  <StyledNextLink href="/">{p.name}</StyledNextLink>
                </Flex>

                <Box>
                  <Text>{p.averageRating} (avg)</Text>
                </Box>
              </Flex>
            ))}
          </Stack>
        ) : (
          <Flex justifyContent="center">
            <Spinner />
          </Flex>
        )}
      </CardBody>
    </ChakraCard>
  );
};
