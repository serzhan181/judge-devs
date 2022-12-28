import { Flex, Select, Text } from "@chakra-ui/react";
import type { FC } from "react";

interface SortOption {
  label: string;
  value: SortByOptions;
  order: "desc" | "asc";
}

const SORT_OPTIONS: SortOption[] = [
  { label: "Newest", value: "newest", order: "desc" },
  { label: "High rating", value: "rating", order: "asc" },
  { label: "Discussed", value: "discussed", order: "desc" },
];

export type SortByOptions = "rating" | "newest" | "discussed";

type SortAllProjectsSelectProps = {
  defaultSortBy: SortByOptions;
  onSortByChange: (sortBy: SortByOptions, sortOrder: "desc" | "asc") => void;
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

            const sortBy = e.target.value as SortByOptions;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const selected = SORT_OPTIONS.find((o) => o.value === sortBy)!;

            onSortByChange(sortBy, selected.order);
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
