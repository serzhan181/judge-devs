import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  useToast,
} from "@chakra-ui/react";
import { Flex, Heading } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import type { FC } from "react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { RoundedImage } from "../atoms/rounded-image";
import { HashtagsSelect } from "../components/hashtags-select";
import { DefaultLayout } from "../layouts/default";
import { InputImage, useInputImg } from "../molecules/input-image";
import { Editor } from "../molecules/editor";
import { trpc } from "../utils/trpc";
import { getBase64 } from "../utils/get-base-64";
import { FormInput } from "@/src/atoms/form-input";
import { StyledNextLink } from "../atoms/styled-next-link";
import { getSession } from "next-auth/react";

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

const NewProject: FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ isEditMode, editProject }) => {
  const router = useRouter();
  const toast = useToast();
  const inspired_by = (router.query.inspired_by as string) || "";
  const {
    data: inspired,
    isError,
    isLoading,
  } = trpc.inspiration.getByIdShort.useQuery(
    { id: inspired_by },
    {
      enabled: Boolean(inspired_by),
    }
  );

  if (isError) {
    toast({
      status: "error",
      title: "Error!",
      description: "Couldn't find inspiration!",
    });
  }

  // Handle Image ***********
  const {
    setFileUrl,
    setFile,
    handlePreviewImg,
    file,
    fileUrl = editProject?.image || "",
  } = useInputImg({
    defaultValues: {
      fileUrl: "",
    },
  });

  const unselectImage = () => {
    setFile(undefined);
    setFileUrl("");
  };
  // Handle Image ***********

  const { control, handleSubmit, setValue, formState } =
    useForm<CreateProjectForm>({
      resolver: zodResolver(FormSchema),

      defaultValues: {
        name: isEditMode ? editProject?.name : "",
        description: (isEditMode && editProject?.description) || "",
        source_code_url: isEditMode ? editProject?.source_code_url : "",
        live_demo_url: "",
      },
    });

  const [fetchingREADME, setFetchingREADME] = useState(false);

  const createProject = trpc.project.createProject.useMutation();
  const updateProject = trpc.project.update.useMutation();

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

    if (isEditMode) {
      updateProject.mutate(
        {
          name: data.name,
          description: data.description,
          projectId: editProject?.id as string,
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
              description: "Updated!",
            });
            router.push("/");
          },
        }
      );
    } else {
      createProject.mutate(
        {
          ...data,
          image: file
            ? {
                base64: (await getBase64(file)) as string,
                ext: file.name.split(".").pop() as string,
              }
            : undefined,

          inspiredById: inspired?.id,
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
    }
  };

  return (
    <>
      <Head>
        <title>Create project</title>
      </Head>

      <DefaultLayout>
        {/* -------- Inspired -------- */}
        {inspired_by && (
          <>
            {isLoading && (
              <Alert status="loading" borderRadius="sm">
                <AlertIcon />
              </Alert>
            )}

            {inspired && (
              <Alert status="success" borderRadius="sm">
                <AlertIcon />

                <Box>
                  <AlertTitle>
                    <StyledNextLink
                      href={`/inspiration/${inspired.id}`}
                      target="_blank"
                    >
                      {inspired.name}
                    </StyledNextLink>
                  </AlertTitle>

                  <AlertDescription>
                    Project will be linked with inspiration!
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </>
        )}
        {/* -------- Inspired -------- */}

        <Heading>Share your project</Heading>

        <Flex
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          mt={4}
          flexDir="column"
          gap={2}
        >
          <Flex flexDir="column" gap={3}>
            {!isEditMode && (
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
            )}

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

            {!isEditMode && (
              <>
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
              </>
            )}
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

          <Flex alignSelf="flex-end" gap="2">
            <Button
              onClick={router.back}
              colorScheme="teal"
              variant="outline"
              type="button"
            >
              Cancel
            </Button>
            <Button colorScheme="teal" type="submit">
              {isEditMode ? "Update" : "Create"}
            </Button>
          </Flex>
        </Flex>
      </DefaultLayout>
    </>
  );
};

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

export const getServerSideProps: GetServerSideProps<{
  isEditMode: boolean;
  editProject:
    | {
        name: string;
        description: string | null;
        image: string | null;
        source_code_url: string;
        id: string;
      }
    | undefined;
}> = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const editProjectId = (context.query?.edit as string) || "";

  if (editProjectId) {
    const editProject = await prisma?.project.findUnique({
      where: { id: editProjectId },
      select: {
        name: true,
        description: true,
        image: true,
        source_code_url: true,
        id: true,
      },
    });

    if (editProject) return { props: { editProject, isEditMode: true } };
    else
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
  }

  return { props: { isEditMode: false, editProject: undefined } };
};

export default NewProject;
