import { Plus, X, Menu as MenuIcon } from "react-feather";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { RoundedImage } from "@/src/atoms/rounded-image";
import { Search } from "@/src/components/search";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useSetAtom } from "jotai";
import { authModal } from "../store/modals";
import { useRouter } from "next/router";

const AuthorizeModal = dynamic(() =>
  import("@/src/modals/authorize-modal").then((c) => c.AuthorizeModal)
);

export const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg="blackAlpha.700" px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <X /> : <MenuIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none", sm: "flex" }}
            justifyContent="center"
            alignItems="center"
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack w="6xl" spacing={8} alignItems={"center"}>
            <Box>
              <NextLink href="/">Logo</NextLink>
            </Box>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
              w="xl"
            >
              <Box w="full">
                <Search />
              </Box>
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Actions />
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

const Actions = () => {
  const session = useSession();
  const setAuthModal = useSetAtom(authModal);
  const router = useRouter();

  return (
    <>
      {session.data?.user ? (
        <>
          {router.pathname !== "/new" && (
            <Button
              variant={"solid"}
              colorScheme={"teal"}
              size={"sm"}
              mr={4}
              leftIcon={<Plus size={15} />}
              onClick={() => router.push("/new")}
            >
              project
            </Button>
          )}
          <Menu>
            <MenuButton
              as={Button}
              rounded={"full"}
              variant={"link"}
              cursor={"pointer"}
              minW={0}
            >
              <RoundedImage
                src={
                  session.data.user.image ||
                  "/static/images/user-placeholder.png"
                }
                alt="you"
              />
            </MenuButton>
            <MenuList>
              <MenuItem color="red.500" onClick={() => signOut()}>
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </>
      ) : (
        <>
          <Button onClick={() => setAuthModal(true)}>Authorize</Button>

          <AuthorizeModal />
        </>
      )}
    </>
  );
};
