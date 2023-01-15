import { Box, Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";
import type { FC } from "react";
import { Search } from "../components/search";

type MobileSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const MobileSearchModal: FC<MobileSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />

      <ModalContent>
        <Box p={2}>
          <Search />
        </Box>
      </ModalContent>
    </Modal>
  );
};
