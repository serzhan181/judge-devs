import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Tooltip,
  Text,
} from "@chakra-ui/react";
import type { FC } from "react";
import { StyledNextLink } from "../atoms/styled-next-link";
import { fromNow } from "../utils/fromNow";
import { trpc } from "../utils/trpc";

export const InspirationSection = () => {
  const { data: inspirations, isLoading } = trpc.inspiration.getAll.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Flex>
      {isLoading ? (
        <Flex w="full" justifyContent="center">
          <Spinner />
        </Flex>
      ) : (
        <SimpleGrid w="full" columns={{ base: 1, md: 3 }} spacing={3}>
          {inspirations?.map((insp) => (
            <InspirationCard
              key={insp.id}
              name={insp.name}
              username={insp.user.name || "Unknown"}
              implementedCount={insp.implemented.length}
              createdAt={insp.createdAt}
              id={insp.id}
            />
          ))}
        </SimpleGrid>
      )}
    </Flex>
  );
};

type InspirationCardProps = {
  id: string;
  name: string;
  username: string;
  implementedCount: number;
  createdAt: Date;
};

const InspirationCard: FC<InspirationCardProps> = ({
  name,
  username,
  implementedCount,
  createdAt,
  id,
}) => {
  return (
    <Card w="full" backgroundColor="blackAlpha.500" variant="outline" size="sm">
      <CardHeader display="flex" justifyContent="space-between">
        <StyledNextLink href={`/inspiration/${id}`}>
          <Heading size="md">{name}</Heading>
        </StyledNextLink>

        <Flex alignItems="center">
          <Tooltip hasArrow label="projects, inspired by">
            <Button size="sm">{implementedCount}</Button>
          </Tooltip>
        </Flex>
      </CardHeader>
      <CardBody display="flex" justifyContent="space-between">
        <StyledNextLink href="/user/42">u/{username}</StyledNextLink>

        <Flex alignSelf="flex-end">
          <Text fontSize="sm" color="gray">
            {fromNow(createdAt)}
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );
};
