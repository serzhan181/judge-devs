import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useAtom } from "jotai";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { authModal } from "../store/modals";

export const AuthorizeModal = () => {
  const [isOpen, setIsOpen] = useAtom(authModal);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Sign in</ModalHeader>
        <ModalCloseButton />
        <ModalBody
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDir="column"
          gap={2}
        >
          <Button
            w="64"
            colorScheme="gray"
            rightIcon={
              <Image
                src="/static/images/companies/github-mark-white.svg"
                alt="github"
                width={25}
                height={25}
              />
            }
            onClick={() => signIn("github")}
          >
            Sign in with github
          </Button>
          <Button
            w="64"
            colorScheme="telegram"
            rightIcon={
              <Image
                src="/static/images/companies/discord.svg"
                alt="github"
                width={25}
                height={25}
              />
            }
            onClick={() => signIn("discord")}
          >
            Sign in with discord
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
