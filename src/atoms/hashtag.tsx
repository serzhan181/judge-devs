import { Badge } from "@chakra-ui/react";
import type { FC } from "react";

export const Hashtag: FC<{ text: string }> = ({ text }) => {
  return <Badge variant="solid">#{text}</Badge>;
};
