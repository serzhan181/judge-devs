/* eslint-disable react/display-name */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Flex,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Hashtag } from "../atoms/hashtag";
import { withInputOptions } from "../hoc/with-input-options";
import { useDebounce } from "@/src/hooks/use-debounce";
import { trpc } from "../utils/trpc";
import { Search as SearchIcon } from "react-feather";
import { StyledNextLink } from "@/src/atoms/styled-next-link";

const InputWithOptions = withInputOptions<{
  name: string;
  live_demo_url?: string | null;
  id: string;

  user: {
    name: string | null;
  };

  hashtags: {
    name: string;
  }[];
}>(Input);

const SearchFormSchema = z.object({
  search: z.string().optional(),
});

type SearchForm = z.infer<typeof SearchFormSchema>;

export const Search = () => {
  const router = useRouter();

  const { handleSubmit, control, setValue } = useForm<SearchForm>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: {
      search: "",
    },
  });

  const searchTerm = useWatch({ control, name: "search" });
  const searchProjectsByTerm = useSearchProjectsByTerm(
    searchTerm?.toLowerCase() || "",
    500
  );

  const onSubmit = (data: SearchForm) => {
    setValue("search", "");

    if (!data.search) return;

    router.push({
      query: {
        search: data.search,
      },
    });
  };

  return (
    <Flex
      css={{ position: "relative" }}
      as="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="search"
        control={control}
        render={({ field }) => (
          <InputGroup>
            <InputWithOptions
              value={field.value}
              onChange={field.onChange}
              aria-label="search"
              placeholder="search"
              // Options
              isLoading={searchProjectsByTerm.isFetching}
              options={searchProjectsByTerm?.data || []}
              renderOption={(o) => (
                <Option
                  key={o.id}
                  hashtags={o.hashtags}
                  name={o.name}
                  username={o.user.name}
                  projectId={o.id}
                />
              )}
            />

            <InputRightElement p={3}>
              <IconButton
                colorScheme="teal"
                type="submit"
                size="sm"
                aria-label={"search"}
              >
                <SearchIcon size={18} />
              </IconButton>
            </InputRightElement>
          </InputGroup>
        )}
      />
    </Flex>
  );
};

type OptionProps = {
  name: string;
  username: string | null;
  projectId: string;
  hashtags: { name: string }[];
};

const Option = ({ name, username, hashtags, projectId }: OptionProps) => {
  return (
    <Flex
      _hover={{ backgroundColor: "gray.800" }}
      p={2}
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex flexDir="column">
        <StyledNextLink href={`/project/${projectId}`} target="_blank">
          {name}
        </StyledNextLink>

        <StyledNextLink href={`/user/42`}>u/{username}</StyledNextLink>
      </Flex>

      <div>
        {hashtags.map((h) => (
          <Hashtag key={h.name} text={h.name} />
        ))}
      </div>
    </Flex>
  );
};

const useSearchProjectsByTerm = (searchTerm: string, delay = 1000) => {
  const trpcContext = trpc.useContext();
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  const topProjectsBySearch = trpc.project.searchOptions.useQuery(
    { take: 5, term: debouncedSearchTerm },
    {
      enabled: Boolean(debouncedSearchTerm.length),
    }
  );

  useEffect(() => {
    if (!Boolean(debouncedSearchTerm) || !Boolean(searchTerm)) {
      trpcContext.project.searchOptions.setData(
        { take: 5, term: debouncedSearchTerm },
        []
      );
    }
  }, [debouncedSearchTerm, searchTerm, trpcContext.project.searchOptions]);

  return topProjectsBySearch;
};
