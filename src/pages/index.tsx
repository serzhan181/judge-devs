import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { type NextPage } from "next";
import Head from "next/head";
import { appRouter } from "../server/trpc/router/_app";
import { trpc } from "@/src/utils/trpc";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { prisma } from "@/src/server/db/client";
import superjson from "superjson";
import { useRouter } from "next/router";
import { DefaultLayout } from "@/src/layouts/default";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import { Card } from "../molecules/card";
import { useLocalStorage } from "../hooks/use-local-storage";
import type { SortByOptions } from "../components/sort-all-projects-tabs";
import { SortAllProjectsTabs } from "../components/sort-all-projects-tabs";
import type { FC } from "react";
import { Fragment, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersection } from "../hooks/use-intersection";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = () => {
  const router = useRouter();
  const trpcContext = trpc.useContext();

  // Sorting
  const [sortBy, setSortBy] = useLocalStorage<SortByOptions>(
    "sort-by",
    "newest"
  );
  const [sortOrder, setSortOrder] = useLocalStorage<"desc" | "asc">(
    "sort-order",
    "desc"
  );

  // Search
  const { search = "" } = router.query;

  const queryKey = trpc.project.getAll.getQueryKey({
    sort: { by: sortBy, order: sortOrder },
    searchTerm: search as string,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(
      queryKey,
      async ({ pageParam }) => {
        const res = await trpcContext.project.getAll.fetch({
          sort: { by: sortBy, order: sortOrder },
          searchTerm: search as string,
          cursor: pageParam,
        });

        return res;
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? false,
      }
    );

  const { ref, isVisible } = useIntersection();

  useEffect(() => {
    if (isVisible && hasNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, fetchNextPage]);

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
          <Flex w="xs" bgColor="teal.500" borderRadius="md">
            <SortAllProjectsTabs
              defaultSortBy={sortBy}
              onSortByChange={(sortBy, sortOrder) => {
                setSortBy(sortBy);
                setSortOrder(sortOrder);
              }}
            />
          </Flex>

          {data?.pages &&
            data.pages.flatMap(({ projects, nextCursor }) => (
              <Fragment key={nextCursor}>
                {projects?.length && !isLoading ? (
                  <>
                    {Boolean(search.length) && (
                      <SearchStatus
                        label="Projects with: "
                        searchText={search as string}
                      />
                    )}
                    {projects.map((p) => (
                      <Card
                        key={p.id}
                        imageSrc={
                          p.image
                            ? p.image
                            : "/static/images/website-placeholder.jpg"
                        }
                        name={p.name}
                        username={p.user.name || ""}
                        hashtags={p.hashtags}
                        id={p.id}
                      />
                    ))}
                  </>
                ) : (
                  isLoading && (
                    <Flex justifyContent="center">
                      <Spinner />
                    </Flex>
                  )
                )}

                {/* No projects found */}
                {!projects?.length && !isLoading && search.length && (
                  <SearchStatus
                    label="No projects with: "
                    searchText={search as string}
                  />
                )}
              </Fragment>
            ))}
        </Flex>
        <Flex
          mx="auto"
          mt="3"
          justifyContent="center"
          h="10"
          position="relative"
          bottom="0"
          ref={ref}
        >
          {hasNextPage && isFetchingNextPage && <Spinner zIndex="overlay" />}
        </Flex>
      </DefaultLayout>
    </>
  );
};

type SearchStatusProps = {
  label: string;
  searchText: string;
};

const SearchStatus: FC<SearchStatusProps> = ({ label, searchText }) => {
  return (
    <Flex gap={1}>
      <Text>{label}</Text>{" "}
      <Text textDecor="underline" color="teal">
        {searchText}
      </Text>
    </Flex>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, session: null },
    transformer: superjson,
  });

  await ssg.project.getAll.prefetch({ sort: { by: "newest", order: "desc" } });

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 10,
  };
};

export default Home;
