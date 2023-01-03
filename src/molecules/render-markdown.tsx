import type { FC } from "react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Flex } from "@chakra-ui/react";

type RenderMarkdownProps = {
  markdown: string;
};

export const RenderMarkdown: FC<RenderMarkdownProps> = ({ markdown }) => {
  return (
    <ReactMarkdown
      components={{ ...ChakraUIRenderer(), div: Flex }}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
    >
      {markdown}
    </ReactMarkdown>
  );
};
