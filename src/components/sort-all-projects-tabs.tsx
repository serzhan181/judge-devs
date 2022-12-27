import { Flex, Select, Text } from "@chakra-ui/react";
import type { FC } from "react";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Most rated", value: "rating" },
  { label: "Discussed", value: "discussed" },
];

export type SortByOptions = "rating" | "newest" | "discussed";

type SortAllProjectsSelectProps = {
  defaultSortBy: SortByOptions;
  onSortByChange: (sortBy: SortByOptions) => void;
};

export const SortAllProjectsTabs: FC<SortAllProjectsSelectProps> = ({
  defaultSortBy,
  onSortByChange,
}) => {
  return (
    <Flex
      p={1}
      px={2}
      gap={2}
      alignItems="center"
      justifyContent="space-between"
      w="full"
    >
      <Text>Sort by: </Text>
      <Flex flexGrow={1}>
        <Select
          bgColor="teal.700"
          defaultValue={defaultSortBy}
          onChange={(e) => {
            e.preventDefault();

            onSortByChange(e.target.value as SortByOptions);
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Flex>
    </Flex>
  );
};
