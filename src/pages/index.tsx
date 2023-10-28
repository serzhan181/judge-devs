import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { type NextPage } from "next";
import Head from "next/head";
import { appRouter } from "../server/trpc/router/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { DefaultLayout } from "@/src/layouts/default";
import {
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { ProjectsSection } from "../sections/projects";
import { createContextInner } from "../server/trpc/context";
import dynamic from "next/dynamic";

const InspirationSection = dynamic(() =>
  import("../sections/inspirations").then((c) => c.InspirationSection)
);

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = () => {
  return (
    <>
      <Head>
        <title>Judge devs</title>
        <meta
          name="description"
          content="place where developers share their projects... soul"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <DefaultLayout>
        <Flex flexDir="column" minH="100vh" gap={2}>
          <Tabs
            defaultIndex={0}
            isManual // Prevent fetching data
            isLazy
            isFitted
            variant="enclosed-colored"
            colorScheme="teal"
          >
            <TabList>
              <Tab>Projects</Tab>
              <Tab>Insirations</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {/* PROJECTS */}
                <ProjectsSection />
              </TabPanel>

              <TabPanel>
                <InspirationSection />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </DefaultLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });

  await ssg.project.getAll.prefetchInfinite({
    sort: { by: "newest", order: "desc" },
  });
  await ssg.inspiration.getAll.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 10,
  };
};

export default Home;
