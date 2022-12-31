import { Divider, Box, Flex, IconButton, Text } from "@chakra-ui/react";
import type { FC } from "react";
import { useState } from "react";
import { Minimize2, Maximize2 } from "react-feather";
import { RenderMarkdown } from "./render-markdown";

type DescriptionProps = {
  description: string;
};

export const Description: FC<DescriptionProps> = ({ description }) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <Box
      position="relative"
      border="2px solid"
      borderColor="blackAlpha.500"
      p={3}
      borderRadius="md"
      bgColor="whiteAlpha.100"
      maxH={expanded ? "100%" : "328px"}
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
