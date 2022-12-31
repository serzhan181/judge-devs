import { FormInput } from "@/src/atoms/form-input";
import { DefaultLayout } from "@/src/layouts/default";
import { Editor } from "@/src/molecules/editor";
import { protectRouteSSR } from "@/src/utils/protectRouteSSR";
import { trpc } from "@/src/utils/trpc";
import { Button, Flex, Text, useToast } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string().min(5),
  description: z
    .string({ required_error: "Description is required!" })
    .min(10, "Description should contain at least 10 charcters"),
});

type CreateInspirationForm = z.infer<typeof FormSchema>;

const InspirationNew = () => {
  const router = useRouter();
  const toast = useToast();

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<CreateInspirationForm>({
    resolver: zodResolver(FormSchema),
  });

  const createInspiration = trpc.inspiration.create.useMutation();

  const onSubmit = ({ description, name }: CreateInspirationForm) => {
    const loadingId = toast({
      status: "loading",
      description: "Creating your inspiration",
    });

    createInspiration.mutate(
      { description, name },
      {
        onSuccess() {
          toast.update(loadingId, {
            status: "success",
            description: "Created!",
          });
        },

        onError(err) {
          console.log(err);

          toast.update(loadingId, {
            status: "error",
            title: "Something went wrong!",
            description: "check console for mroe information.",
          });
        },

        onSettled() {
          router.push("/");
        },
      }
    );
  };

  return (
    <DefaultLayout>
      <Flex
        as="form"
        flexDir="column"
        onSubmit={handleSubmit(onSubmit)}
        gap={2}
      >
        <FormInput
          isRequired
          label="Inspiration name"
          {...register("name")}
          isError={Boolean(errors.name?.message)}
          helperText={errors.name?.message}
        />

        <Flex flexDir="column" gap="2">
          <Text color={Boolean(errors.description) ? "red.300" : "current"}>
            {errors.description ? errors.description.message : "Description"}
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Editor
                placeholder="Enter description"
                value={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />
        </Flex>

        <Button type="submit" mt="2" alignSelf="flex-end" colorScheme="teal">
          create
        </Button>
      </Flex>
    </DefaultLayout>
  );
};

export default InspirationNew;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return protectRouteSSR(context);
};
