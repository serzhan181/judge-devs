import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import type { FC } from "react";
import { z } from "zod";
import { FormInput } from "../atoms/form-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "../utils/trpc";
import { makeId } from "../utils/makeId";

type SuggestFeatureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  inspirationId: string;
};

const FormSchema = z.object({
  title: z.string().min(5).max(20),
  body: z.string().min(10).max(160),
});

type AddFeatureForm = z.infer<typeof FormSchema>;

export const SuggestFeatureModal: FC<SuggestFeatureModalProps> = ({
  inspirationId,
  isOpen,
  onClose,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<AddFeatureForm>({
    resolver: zodResolver(FormSchema),
  });
  const toast = useToast();
  const trpcContext = trpc.useContext();

  const addFeature = trpc.feature.addTo.useMutation({
    onMutate({ inspirationId, title }) {
      // Optimistic
      const previousFeatures = trpcContext.feature.getAll.getData({
        inspirationId,
      });

      trpcContext.feature.getAll.setData({ inspirationId }, (old) => [
        ...(old || []),
        { id: makeId(5), name: title },
      ]);

      return previousFeatures;
    },
  });

  const onSubmit = ({ body, title }: AddFeatureForm) => {
    const loadingId = toast({
      status: "loading",
      description: "Adding your feature...",
    });

    addFeature.mutate(
      { body, title, inspirationId },
      {
        onSuccess() {
          toast.update(loadingId, {
            status: "success",
            description: "Added!",
          });
        },

        onError(err, _, ctx) {
          toast.update(loadingId, {
            status: "error",
            description: "Couldn't add the feature" + err,
          });

          trpcContext.feature.getAll.setData({ inspirationId }, ctx);
        },

        onSettled() {
          onClose();
          trpcContext.feature.getAll.invalidate({ inspirationId });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Suggest new feature</ModalHeader>

        <ModalCloseButton />

        <ModalBody
          display="flex"
          as="form"
          flexDir="column"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInput
            label="Name"
            {...register("title")}
            isRequired
            isError={Boolean(errors.title)}
            helperText={errors.title?.message}
          />
          <FormInput
            label="Short Description"
            {...register("body")}
            isRequired
            isError={Boolean(errors.body)}
            helperText={errors.body?.message}
          />
          <Button colorScheme="teal" type="submit" mt="2" alignSelf="flex-end">
            suggest
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
