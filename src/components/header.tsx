import { Plus, Search as SearchIcon } from "react-feather";
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
  Icon,
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
const MobileSearchModal = dynamic(() =>
  import("@/src/modals/mobile-search-modal").then((c) => c.MobileSearchModal)
);

export const Header = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Box bg="blackAlpha.700" px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <HStack w="6xl" spacing={8} alignItems={"center"}>
            <Box>
              <NextLink href="/">👩‍⚖️</NextLink>
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

            <Box display={{ md: "none" }}>
              <IconButton
                icon={<Icon as={SearchIcon} />}
                aria-label="Search icon"
                onClick={onOpen}
              />

              <MobileSearchModal isOpen={isOpen} onClose={onClose} />
            </Box>
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
              variant="solid"
              colorScheme="teal"
              size="sm"
              mr={4}
              leftIcon={<Plus size={15} />}
              onClick={() => router.push("/new")}
            >
              project
            </Button>
          )}

          {router.pathname !== "/inspiration/new" && (
            <Button
              variant="outline"
              colorScheme="teal"
              size="sm"
              mr={4}
              leftIcon={<Plus size={15} />}
              onClick={() => router.push("/inspiration/new")}
            >
              inspiration
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
