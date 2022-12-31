import type { InputProps } from "@chakra-ui/react";
import {
  Box,
  Button,
  forwardRef,
  InputGroup,
  InputLeftAddon,
  useToast,
} from "@chakra-ui/react";
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import type { FC } from "react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { ReactElement } from "react-markdown/lib/react-markdown";
import { z } from "zod";
import { RoundedImage } from "../atoms/rounded-image";
import { HashtagsSelect } from "../components/hashtags-select";
import { DefaultLayout } from "../layouts/default";
import { InputImage, useInputImg } from "../molecules/input-image";
import { Editor } from "../molecules/editor";
import { protectRouteSSR } from "../utils/protectRouteSSR";
import { trpc } from "../utils/trpc";
import { getBase64 } from "../utils/get-base-64";

const FormSchema = z.object({
  name: z.string().min(5),
  description: z.string().optional(),
  source_code_url: z
    .string()
    .url()
    .startsWith(
      "https://github.com/",
      "source code only from github are accepted"
    ),
  live_demo_url: z.string().optional(),

  hashtags: z.array(z.string()).optional(),
});

type CreateProjectForm = z.infer<typeof FormSchema>;

const NewProject = () => {
  const router = useRouter();
  const toast = useToast();

  // Handle Image ***********
  const { setFileUrl, setFile, handlePreviewImg, file, fileUrl } =
    useInputImg();

  const unselectImage = () => {
    setFile(undefined);
    setFileUrl("");
  };
  // Handle Image ***********

  const { control, handleSubmit, setValue } = useForm<CreateProjectForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: undefined,
      source_code_url: "",
      live_demo_url: "",
    },
  });

  const [fetchingREADME, setFetchingREADME] = useState(false);

  const createProject = trpc.project.createProject.useMutation();

  const onSubmit = async (data: CreateProjectForm) => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file as Blob);
    }

    const loadingId = toast({
      status: "loading",
      description: "Creating your post...",
      position: "top-left",
    });

    createProject.mutate(
      {
        ...data,
        image: file
          ? {
              base64: (await getBase64(file)) as string,
              ext: file.name.split(".").pop() as string,
            }
          : undefined,
      },
      {
        onError(err) {
          console.log("something went wrong", err);
          toast.update(loadingId, {
            status: "error",
            description: "Something went wrong :(",
          });
        },

        onSuccess() {
          toast.update(loadingId, {
            status: "success",
            description: "Your post has been created!",
          });
          router.push("/");
        },
      }
    );
  };

  return (
    <>
      <Head>
        <title>Create project</title>
      </Head>

      <DefaultLayout>
        <Heading>Share your project</Heading>

        <Flex
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          mt={4}
          flexDir="column"
          gap={2}
        >
          <Flex flexDir="column" gap={3}>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <FormInput
                  label="Project name"
                  isRequired
                  isError={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  {...field}
                />
              )}
            />

            <Flex justifyContent="center">
              <InputImage
                onFileChange={(file) => {
                  setFile(file);
                  setFileUrl(handlePreviewImg(file));
                }}
                onUnselectImage={unselectImage}
                previewUrl={fileUrl}
              />
            </Flex>

            <Controller
              control={control}
              name="hashtags"
              render={({ field }) => (
                <HashtagsSelect onHashtagsSelect={field.onChange} />
              )}
            />

            <Controller
              control={control}
              name="live_demo_url"
              render={({ field }) => (
                <FormInput
                  label="live demo url"
                  placeholder="https://"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="source_code_url"
              render={({ field, fieldState }) => (
                <>
                  <FormInput
                    leftElement={
                      <RoundedImage
                        src="/static/images/companies/github-mark-white.svg"
                        alt="github"
                        width={25}
                        height={25}
                      />
                    }
                    label="Source code"
                    helperText={
                      fieldState.error?.message
                        ? fieldState.error?.message
                        : "Link to project's repository"
                    }
                    isError={Boolean(fieldState.error)}
                    isRequired
                    type="url"
                    {...field}
                  />

                  <Box mt={2}>
                    <Button
                      color="gray.800"
                      bgGradient="linear(to-r, blue.200, blue.500)"
                      _active={{
                        bgGradient: "linear(to-r, blue.200, blue.300)",
                      }}
                      _hover={{}}
                      disabled={
                        !field.value.startsWith("https://github.com/") ||
                        fetchingREADME
                      }
                      isLoading={fetchingREADME}
                      onClick={async () => {
                        setFetchingREADME(true);

                        const { md, status } = await fetchReadmeFromRepo(
                          field.value || ""
                        );

                        if (status === 404) {
                          toast({
                            status: "error",
                            description:
                              '"README.md is not found or reading it is not allowed."',
                          });
                        } else if (status === 200) {
                          toast({
                            status: "success",
                            description: "Fetched!",
                          });
                        }

                        setFetchingREADME(false);
                        setValue("description", md);
                      }}
                    >
                      Fetch README.md from the repo
                    </Button>
                  </Box>
                </>
              )}
            />
          </Flex>
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

          <Box alignSelf="flex-end">
            <Button colorScheme="teal" type="submit">
              Create
            </Button>
          </Box>
        </Flex>
      </DefaultLayout>
    </>
  );
};

type FormInputProps = {
  label?: string;
  helperText?: string;
  isError?: boolean;
  leftElement?: ReactElement;
} & InputProps;

const FormInput: FC<FormInputProps> = forwardRef<FormInputProps, "input">(
  ({ label, helperText, isError, isRequired, leftElement, ...rest }, ref) => (
    <FormControl isInvalid={isError} isRequired={isRequired}>
      {label && <FormLabel>{label}</FormLabel>}
      <InputGroup>
        {leftElement && <InputLeftAddon>{leftElement}</InputLeftAddon>}

        <Input {...rest} ref={ref} />
      </InputGroup>

      {helperText && isError ? (
        <FormErrorMessage>{helperText}</FormErrorMessage>
      ) : (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  )
);

const fetchReadmeFromRepo = async (
  githubUrl: string,
  retry = true,
  branch = "main"
): Promise<{ status: number; md: string }> => {
  const repoShort = githubUrl.replace(/https:\/\/github.com\//gi, "");

  const res = await fetch(
    `https://raw.githubusercontent.com/${repoShort}/${branch}/README.md`
  );

  if (res.status !== 200) {
    if (!retry) return { status: 404, md: "" };

    // If readme not found in main, search in master;
    return await fetchReadmeFromRepo(githubUrl, false, "master");
  }

  const md = await res.text();

  return { status: 200, md };
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return protectRouteSSR(context);
};

export default NewProject;
