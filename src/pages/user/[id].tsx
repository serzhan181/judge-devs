import { DefaultLayout } from "@/src/layouts/default";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import { prisma } from "@/src/server/db/client";
import { Container, Flex, Box, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import { RoundedImage } from "@/src/atoms/rounded-image";
import { fromNow } from "@/src/utils/fromNow";
import { Card } from "@/src/molecules/card";

const UserPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { user, projects, id } = props;

  return (
    <>
      <Head>
        <title>{user.name}</title>
      </Head>

      <DefaultLayout>
        <Flex flexDir="column" gap={5}>
          <Flex alignItems="center" flexDir="column" gap={3}>
            {user.image && (
              <Flex>
                <Image
                  src={user.image}
                  alt={user.name || ""}
                  width={250}
                  height={300}
                />
              </Flex>
            )}

            <Box textAlign="center">
              <Text fontSize="xs">{user.email}</Text>
              <Heading>{user.name}</Heading>
              <Text color="gray">Joined {fromNow(user.createdAt)}</Text>
            </Box>
          </Flex>

          <Box>
            <Box mb="3">
              <Text fontSize="lg" color="gray">
                Projects by {user.name}
              </Text>
            </Box>

            <Flex flexDir="column" gap={2}>
              {projects.map((p) => (
                <Card
                  key={p.id}
                  hashtags={p.hashtags}
                  id={p.id}
                  imageSrc={p.image || "/static/images/website-placeholder.jpg"}
                  userId={id || ""}
                  name={p.name}
                  username={user.name || ""}
                />
              ))}
            </Flex>
          </Box>
        </Flex>
      </DefaultLayout>
    </>
  );
};

export const getStaticProps = async (
  ctx: GetStaticPropsContext<{ id: string }>
) => {
  const user = await prisma?.user.findUnique({
    where: { id: ctx.params?.id },
    select: { image: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const projects = await prisma.project.findMany({
    where: { user: { id: ctx.params?.id } },
    select: {
      name: true,
      hashtags: true,
      image: true,
      id: true,
    },
  });

  console.log("PROJECTS", projects);

  return {
    props: { user, id: ctx.params?.id, projects, revalidate: 5 },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const users = await prisma?.user.findMany({ select: { id: true } });

  return {
    paths: users?.map((u) => ({ params: { id: u.id } })) || [],
    fallback: "blocking",
  };
};

export default UserPage;
