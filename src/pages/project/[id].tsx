import { DefaultLayout } from "@/src/layouts/default";
import {
  Divider,
  Flex,
  Heading,
  Text,
  Link as ChakraLink,
  Tag,
  Highlight,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Head from "next/head";
import { trpc } from "@/src/utils/trpc";
import type { FC } from "react";
import { ExternalLink, Star } from "react-feather";
import Image from "next/image";
import { SubmitComment } from "@/src/components/submit-comment";
import { useSession } from "next-auth/react";
import { Comments } from "@/src/components/comments";
import { RateProject, useRateProject } from "@/src/components/rate-project";
import { Description } from "@/src/molecules/description";
import { MetaData } from "@/src/molecules/meta-data";
import Link from "next/link";

const Project = () => {
  const router = useRouter();
  const projectId = router.query.id as string;
  const session = useSession();

  const { data: project, isLoading } = trpc.project.getProjectById.useQuery({
    id: projectId,
  });

  const { rating, onRate } = useRateProject(project?.userRate);

  return (
    <>
      <Head>
        <title>{project?.name}</title>
      </Head>

      <DefaultLayout isLoading={isLoading}>
        {/* Project Data */}
        {project && (
          <Flex gap={2} flexDir="column">
            <MetaData
              creatorName={project.user.name}
              creatorImage={project.user.image}
              createdAt={project.createdAt}
            />

            <Flex gap={3}>
              <Flex
                gap={2}
                flexDir="column"
                flexBasis={project.image ? "60%" : "100%"}
              >
                <Flex gap={5}>
                  <Heading>{project.name}</Heading>

                  {project.average_rating && (
                    <Flex gap={2} alignItems="center">
                      <Divider orientation="vertical" />
                      <Flex gap={1} alignItems="center">
                        <Star color="#ddb231" fill="#ddb231" size={30} />
                        <Text fontSize="2xl" as="span">
                          {project.average_rating}
                        </Text>
                      </Flex>

                      <Divider orientation="vertical" />

                      <Text fontSize="2xl">
                        Rated {project.totalRatingCount} times
                      </Text>

                      <Divider orientation="vertical" />
                    </Flex>
                  )}
                </Flex>

                {project.inspired && (
                  <Flex my="2">
                    <Link href={`/inspiration/${project.inspired.id}`}>
                      <Highlight
                        query={project.inspired.name}
                        styles={{
                          p: "1",
                          rounded: "full",
                          bg: "red.100",
                        }}
                      >
                        {"Inspired by: " + project.inspired.name}
                      </Highlight>
                    </Link>
                  </Flex>
                )}

                {project.description && (
                  <Description description={project.description} />
                )}

                {/* Project Links */}
                <Links
                  liveDemoUrl={project.live_demo_url}
                  sourceCodeUrl={project.source_code_url}
                />
              </Flex>
              {/* Image */}
              {project.image && (
                <Flex position="relative" height="96" flexGrow={1}>
                  <Image
                    alt="project image"
                    src={project.image}
                    style={{ objectFit: "contain" }}
                    fill
                    sizes="(max-width: 768px) 100vw,
                      (max-width: 1200px) 50vw,
                      33vw"
                  />
                </Flex>
              )}
            </Flex>
          </Flex>
        )}

        {/* Suggest User to rate */}
        <Flex alignItems="center" gap={2} flexDir="column">
          <Tag>Rate the project!</Tag>
          <Flex>
            <RateProject
              rating={rating}
              onRate={(rated) => onRate(rated, projectId)}
            />
          </Flex>
        </Flex>

        {/* Project's Comments */}
        <Flex mt={4} gap={8} bgColor="blackAlpha.500" p={2} flexDir="column">
          <SubmitComment
            projectId={projectId}
            userImage={
              session.data?.user?.image || "/static/images/user-placeholder.png"
            }
          />

          <Comments projectId={projectId} />
        </Flex>
      </DefaultLayout>
    </>
  );
};

type LinksProps = {
  sourceCodeUrl: string;
  liveDemoUrl: string | null;
};

const Links: FC<LinksProps> = ({ sourceCodeUrl, liveDemoUrl }) => {
  return (
    <Flex gap={3}>
      <ChakraLink
        href={sourceCodeUrl}
        isExternal
        color="blue.500"
        display="flex"
      >
        source code <ExternalLink size={16} />
      </ChakraLink>
      {liveDemoUrl && (
        <ChakraLink color="red.200" href={liveDemoUrl} display="flex">
          live demo <ExternalLink size={16} />
        </ChakraLink>
      )}
    </Flex>
  );
};

export default Project;
