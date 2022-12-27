import type { FC } from "react";
import { useIntersection } from "@/src/hooks/use-intersection";
import { trpc } from "../utils/trpc";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { RoundedImage } from "./rounded-image";
import { StyledNextLink } from "./styled-next-link";
import { fromNow } from "../utils/fromNow";

type CommentsProps = { projectId: string };

export const Comments: FC<CommentsProps> = ({ projectId }) => {
  const { ref, isVisible } = useIntersection();

  const comments = trpc.comment.ofProject.useQuery(
    { projectId },
    {
      enabled: isVisible,
    }
  );

  const regularComments = comments.data?.comments || [];
  const usersComments = comments.data?.usersComments || [];

  const thereAreComments =
    Boolean(regularComments.length) || Boolean(usersComments.length);

  return (
    <Flex ref={ref} flexDir="column" gap={5}>
      {comments.isLoading ? (
        <Flex w="full" justifyContent="center">
          <Spinner />
        </Flex>
      ) : (
        thereAreComments && (
          <>
            {usersComments.map((c) => (
              <Comment
                key={c.id}
                userImage={c.user.image ?? "/demo/user-placeholder.png"}
                username={c.user.name || "Unknown"}
                body={c.body}
                createdAt={c.createdAt}
              />
            ))}

            {regularComments.map((c) => (
              <Comment
                key={c.id}
                userImage={c.user.image ?? "/demo/user-placeholder.png"}
                username={c.user.name || "Unknown"}
                body={c.body}
                createdAt={c.createdAt}
              />
            ))}
          </>
        )
      )}
    </Flex>
  );
};

type CommentProps = {
  userImage: string;
  username: string;
  body: string;

  createdAt: Date;
};

const Comment: FC<CommentProps> = ({
  userImage,
  username,
  body,
  createdAt,
}) => {
  return (
    <Flex gap={3}>
      <Box>
        <RoundedImage src={userImage} alt="commentator" />
      </Box>
      <Flex flexDir="column" gap={1.5}>
        <Flex gap={1} alignItems="center">
          <StyledNextLink href="user/42">u/{username}</StyledNextLink>

          <Text color="gray" as="span">
            &#8226;
          </Text>

          <Text fontSize="xs" color="gray">
            {fromNow(createdAt)}
          </Text>
        </Flex>

        <Box>
          <Text fontSize="sm">{body}</Text>
        </Box>
      </Flex>
    </Flex>
  );
};
