import { DefaultLayout } from "@/src/layouts/default";
import {
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  Text,
  Link as ChakraLink,
  theme,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Head from "next/head";
import { trpc } from "@/src/utils/trpc";
import { fromNow } from "@/src/utils/fromNow";
import { StyledNextLink } from "@/src/atoms/styled-next-link";
import { RoundedImage } from "@/src/atoms/rounded-image";
import type { FC } from "react";
import { useState } from "react";
import { RenderMarkdown } from "@/src/molecules/render-markdown";
import { Minimize2, Maximize2, ExternalLink, Star } from "react-feather";
import Image from "next/image";
import { SubmitComment } from "@/src/components/submit-comment";
import { useSession } from "next-auth/react";
import { Comments } from "@/src/atoms/comments";

const Project = () => {
  const router = useRouter();
  const projectId = router.query.id as string;
  const session = useSession();

  const { data: project, isLoading } = trpc.project.getProjectById.useQuery({
    id: projectId,
  });

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
                    <Flex gap={1} alignItems="center">
                      <Star
                        color={theme.colors.yellow[500]}
                        fill={theme.colors.yellow[500]}
                        size={30}
                      />
                      <Text fontSize="2xl" as="span">
                        {project.average_rating}
                      </Text>
                    </Flex>
                  )}
                </Flex>

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

type MetaDataProps = {
  creatorImage: string | null;
  creatorName: string | null;
  createdAt: Date;
};

const MetaData: FC<MetaDataProps> = ({
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
      <Text color="gray" as="span">
        &#8226;
      </Text>
      <Text color="gray">{fromNow(createdAt)}</Text>
    </Flex>
  );
};

type DescriptionProps = {
  description: string;
};

const Description: FC<DescriptionProps> = ({ description }) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <Box
      position="relative"
      border="2px solid"
      borderColor="blackAlpha.500"
      p={3}
      borderRadius="md"
      bgColor="whiteAlpha.100"
      maxH={expanded ? "100%" : "180px"}
      overflow={expanded ? "visible" : "hidden"}
      _after={{
        display: expanded ? "none" : "block",

        content: '""',
        position: "absolute",

        right: "0",
        left: "0",
        bottom: "0",
        height: 100,

        background: "linear-gradient(to bottom, transparent, #1f1f1f)",
      }}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontWeight="semibold">ABOUT</Text>
        <IconButton
          size="sm"
          aria-label={"maximize-minimize"}
          icon={expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          onClick={() => {
            setExpanded((prev) => !prev);
          }}
        />
      </Flex>

      <Divider my={2} />

      <Box>
        <RenderMarkdown markdown={description} />
      </Box>
    </Box>
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
