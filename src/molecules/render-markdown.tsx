import type { FC } from "react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import remarkGfm from "remark-gfm";

type RenderMarkdownProps = {
  markdown: string;
};

export const RenderMarkdown: FC<RenderMarkdownProps> = ({ markdown }) => {
  return (
    <ReactMarkdown components={ChakraUIRenderer()} remarkPlugins={[remarkGfm]}>
      {markdown}
    </ReactMarkdown>
  );
};
