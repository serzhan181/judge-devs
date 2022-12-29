import type { BadgeProps } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import type { FC } from "react";

export const Hashtag: FC<{ text: string } & BadgeProps> = ({
  text,
  ...rest
}) => {
  return (
    <Badge variant="solid" {...rest}>
      #{text}
    </Badge>
  );
};
