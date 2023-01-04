import type { FC } from "react";
import { useIntersection } from "@/src/hooks/use-intersection";
import { trpc } from "../utils/trpc";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { RoundedImage } from "../atoms/rounded-image";
import { StyledNextLink } from "../atoms/styled-next-link";
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
            <Box>
              <Text color="gray">
                {comments.data?.totalCommentsCount} comments
              </Text>
            </Box>
            {usersComments.map((c) => (
              <Comment
                key={c.id}
                userImage={c.user.image ?? "/demo/user-placeholder.png"}
                username={c.user.name || "Unknown"}
                body={c.body}
                createdAt={c.createdAt}
                userId={c.user.id}
              />
            ))}

            {regularComments.map((c) => (
              <Comment
                key={c.id}
                userImage={c.user.image ?? "/demo/user-placeholder.png"}
                username={c.user.name || "Unknown"}
                body={c.body}
                createdAt={c.createdAt}
                userId={c.user.id}
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
  userId: string;

  createdAt: Date;
};

const Comment: FC<CommentProps> = ({
  userImage,
  username,
  body,
  createdAt,
  userId,
}) => {
  return (
    <Flex gap={3}>
      <Box>
        <RoundedImage src={userImage} alt="commentator" />
      </Box>
      <Flex flexDir="column" gap={1.5}>
        <Flex gap={1} alignItems="center">
          <StyledNextLink href={`user/${userId}`}>u/{username}</StyledNextLink>

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
