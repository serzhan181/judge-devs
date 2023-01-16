import { Flex, Spinner, Text } from "@chakra-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { FC } from "react";
import { Fragment, useEffect } from "react";
import type { SortByOptions } from "../components/sort-all-projects-tabs";
import { SortAllProjectsTabs } from "../components/sort-all-projects-tabs";
import { useIntersection } from "../hooks/use-intersection";
import { useLocalStorage } from "../hooks/use-local-storage";
import type { Action } from "../molecules/card";
import { Card } from "../molecules/card";
import { trpc } from "../utils/trpc";

export const ProjectsSection = () => {
  const session = useSession();
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

  // Infinite scroll (well, untill there are projects to load)
  const { ref, isVisible } = useIntersection();

  useEffect(() => {
    if (isVisible && hasNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, fetchNextPage]);

  return (
    <Flex gap="2.5" flexDir="column">
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
        data.pages.flatMap(({ projects, nextCursor }, i) => (
          <Fragment key={nextCursor || i}>
            {projects?.length && !isLoading ? (
              <>
                {Boolean(search.length) && (
                  <SearchStatus
                    label="Projects with: "
                    searchText={search as string}
                  />
                )}
                {projects.map((p) => {
                  const isOwner = p.user.id === session.data?.user?.id;

                  const actions: Action[] = isOwner
                    ? [
                        {
                          label: "Edit",
                          onClick: (id) => router.push(`/new?edit=${id}`),
                        },
                      ]
                    : [];

                  return (
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
                      actions={actions}
                      userId={p.user.id}
                      id={p.id}
                    />
                  );
                })}
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
    </Flex>
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
