import { Box, Button, Flex, Textarea, useToast } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";
import { useSession } from "next-auth/react";
import type { FC } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RoundedImage } from "../atoms/rounded-image";
import { authModal } from "../store/modals";
import { makeId } from "../utils/makeId";
import { trpc } from "../utils/trpc";

type SubmitCommentProps = {
  userImage: string;
  projectId: string;
};

const FormSchema = z.object({
  comment: z.string().min(2),
});

type CommentForm = z.infer<typeof FormSchema>;

export const SubmitComment: FC<SubmitCommentProps> = ({
  projectId,
  userImage,
}) => {
  const trpcContext = trpc.useContext();
  const toast = useToast();

  const session = useSession();
  const setIsAuthModalOpen = useSetAtom(authModal);

  const [showActions, setShowActions] = useState(false);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isValid },
  } = useForm<CommentForm>({
    resolver: zodResolver(FormSchema),
  });

  const createComment = trpc.comment.onProject.useMutation({
    onMutate({ comment, projectId }) {
      // Optimistic updates
      const previousComments = trpcContext.comment.ofProject.getData({
        projectId,
      });
      trpcContext.comment.ofProject.setData({ projectId }, (old) => {
        const newComment = {
          body: comment,
          createdAt: new Date(),
          id: makeId(5),
          user: {
            image: session.data?.user?.image || null,
            name: session.data?.user?.name || null,
            id: session.data?.user?.id || "",
          },
        };

        return {
          usersComments: [newComment, ...(old?.usersComments || [])],
          comments: old?.comments || [],
          totalCommentsCount: (old?.totalCommentsCount || 0) + 1,
        };
      });

      return previousComments;
    },
  });

  const onSubmit = ({ comment }: CommentForm) => {
    if (!session.data?.user) {
      setIsAuthModalOpen(true);
      setValue("comment", "");
      return;
    }

    createComment.mutate(
      { projectId, comment },
      {
        onSuccess() {
          setValue("comment", "");
        },
        onError(_err, _newComment, ctx) {
          toast({
            title: "Error!",
            description: "Could'nt create comment 😔",
            status: "error",
            isClosable: true,
          });

          trpcContext.comment.ofProject.setData({ projectId }, ctx);
        },

        onSettled() {
          trpcContext.comment.ofProject.invalidate({ projectId });
        },
      }
    );
  };

  return (
    <Flex
      onSubmit={handleSubmit(onSubmit)}
      flexDir="column"
      gap={2}
      w="full"
      as="form"
      borderRadius="sm"
    >
      <Flex gap={2}>
        <Box>
          <RoundedImage
            src={userImage}
            alt="your image"
            width={40}
            height={40}
          />
        </Box>
        <Textarea
          {...register("comment")}
          placeholder="Enter your comment"
          onFocus={() => setShowActions(true)}
        />
      </Flex>

      {showActions && (
        <Flex alignSelf="flex-end" gap={2}>
          <Button
            onClick={() => setShowActions(false)}
            size="sm"
            colorScheme="red"
            variant="ghost"
            type="button"
            disabled={createComment.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            colorScheme="teal"
            disabled={
              Boolean(errors.comment) || !isValid || createComment.isLoading
            }
            isLoading={createComment.isLoading}
          >
            Leave comment
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
