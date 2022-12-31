import { StyledNextLink } from "@/src/atoms/styled-next-link";
import { Features } from "@/src/components/features";
import { DefaultLayout } from "@/src/layouts/default";
import { Description } from "@/src/molecules/description";
import { MetaData } from "@/src/molecules/meta-data";
import { fromNow } from "@/src/utils/fromNow";
import { trpc } from "@/src/utils/trpc";
import {
  Flex,
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Th,
  Thead,
  Tr,
  Td,
  Tbody,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Text,
  Divider,
} from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { FC } from "react";

const Inspiration = () => {
  const router = useRouter();
  const inspiredById = (router.query.id as string) || "";
  const { data, isLoading } = trpc.inspiration.getById.useQuery(
    { id: inspiredById },
    {
      enabled: Boolean(inspiredById),
    }
  );

  const redirectToImplementation = () => {
    router.push(`/new?inspired_by=${inspiredById}`);
  };

  return (
    <>
      <Head>
        <title>{data?.name}</title>
      </Head>
      <DefaultLayout isLoading={isLoading}>
        {data && (
          <Flex flexDir="column" gap="2">
            <MetaData
              createdAt={data.createdAt}
              creatorImage={data.user.image}
              creatorName={data.user.name}
            />

            <SimpleGrid h="80" columns={2} spacing="3">
              <Flex flexDir="column" gap="2">
                <Flex justifyContent="space-between">
                  <Heading>{data.name}</Heading>

                  <Button colorScheme="teal" onClick={redirectToImplementation}>
                    Implement 🎉
                  </Button>
                </Flex>

                <Description description={data.description} />
              </Flex>

              <Features inspirationId={data.id} />
            </SimpleGrid>

            <Flex flexDir="column" gap="5">
              {data.implemented.length > 0 ? (
                <>
                  <Heading size="lg">Implementations:</Heading>

                  <TableContainer>
                    <Table variant="simple">
                      <TableCaption>Projects that got inspired by</TableCaption>

                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>by</Th>
                          <Th>date</Th>
                        </Tr>
                      </Thead>

                      <Tbody>
                        {/* Tr > Td */}
                        {data.implemented.map((p) => (
                          <Tr key={p.id}>
                            <Td>
                              <StyledNextLink
                                href={`/project/${p.id}`}
                                target="_blank"
                              >
                                {p.name}
                              </StyledNextLink>
                            </Td>
                            <Td>{p.user.name}</Td>
                            <Td>{fromNow(p.createdAt)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Heading size="md" color="gray">
                  Be first to implement it in your project!
                </Heading>
              )}
            </Flex>
          </Flex>
        )}
      </DefaultLayout>
    </>
  );
};

export default Inspiration;
