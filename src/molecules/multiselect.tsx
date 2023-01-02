import {
  Box,
  Button,
  chakra,
  Divider,
  Flex,
  Icon,
  IconButton,
  Input,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  shouldForwardProp,
  Text,
} from "@chakra-ui/react";
import type { FC } from "react";
import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "react-feather";
import { AnimatePresence, isValidMotionProp, motion } from "framer-motion";

export type Option = {
  label: string;
  value: string;
};

type MultiselectProps = {
  options: Option[];
  placeholder?: string;

  onMultiSelect: (options: Option[]) => void;

  onNew: (value: string) => void;
};

export const Multiselect: FC<MultiselectProps> = ({
  options,
  onMultiSelect,
  placeholder = "select options",
  onNew,
}) => {
  const [selected, setSelected] = useState<Option[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  const append = (o: Option) => {
    if (selected.includes(o)) {
      remove(o);
      return;
    }

    setSelected((prev: Option[]) => {
      const newOptions = [...prev, o];

      onMultiSelect(newOptions);

      return newOptions;
    });
  };

  const remove = (o: Option) => {
    if (!selected.includes(o)) return;

    setSelected(() => {
      const newOptions = selected.filter((po) => po.value !== o.value);

      onMultiSelect(newOptions);

      return newOptions;
    });
  };

  return (
    <Box position="relative">
      <Flex
        border="1px solid"
        borderColor="chakra-border-color"
        p={1}
        borderRadius="md"
        justifyContent="space-between"
        cursor={showOptions ? "default" : "pointer"}
        onClick={() => setShowOptions(true)}
      >
        <Flex alignItems="center" gap={1}>
          {!Boolean(selected.length) && (
            <Text ml={2} color="chakra-placeholder-color">
              {placeholder}
            </Text>
          )}
          {selected.map((so) => (
            <AnimatePresence key={so.value}>
              <Button
                as={motion.button}
                // Motion
                initial={{ y: "100%", opacity: "0" }}
                animate={{ y: "0", opacity: "1" }}
                exit={{ y: "-100%", opacity: "0" }}
                whileHover={{ y: "-20%" }}
                whileTap={{ scale: 0.85 }}
                // Chakra
                size="sm"
                rightIcon={<Icon as={X} />}
                _hover={{ bgColor: "red.500" }}
                _active={{ bgColor: "red.700" }}
                onClick={() => remove(so)}
              >
                {so.label}
              </Button>
            </AnimatePresence>
          ))}
        </Flex>

        <Box>
          <IconButton
            size="sm"
            aria-label="expand multiselect"
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions((prev) => !prev);
            }}
          >
            {showOptions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </IconButton>
        </Box>
      </Flex>

      {/* Options */}
      <AnimatePresence>
        {showOptions && (
          <>
            <CustomUl
              // Motion props
              initial={{ opacity: 0, y: "-100%" }}
              animate={{ opacity: 1, y: "0" }}
              exit={{ opacity: 0 }}
              // Chakra props
              position="absolute"
              top="12"
              right="0"
              left="0"
              zIndex="dropdown"
              bgColor="blackAlpha.700"
              borderRadius="md"
              overflow="hidden"
            >
              <Box p="2">
                <NewPopover onNew={onNew} />
              </Box>

              <Divider />
              {options.map((o) => (
                <Box
                  key={o.value}
                  p={2}
                  w="full"
                  cursor="pointer"
                  _hover={{ bgColor: "chakra-border-color" }}
                  _active={{ bgColor: "gray.600" }}
                  transition="all"
                  transitionDuration="150ms"
                  onClick={() => append(o)}
                  bgColor={
                    selected.includes(o) ? "blackAlpha.700" : "transparent"
                  }
                >
                  {o.label}
                </Box>
              ))}
            </CustomUl>
          </>
        )}
      </AnimatePresence>
    </Box>
  );
};
const NewPopover = ({ onNew }: { onNew: (value: string) => void }) => {
  const [newValue, setNewValue] = useState("");
  return (
    <Popover placement="top">
      <PopoverTrigger>
        <Button colorScheme="teal">New</Button>
      </PopoverTrigger>

      <Portal>
        <PopoverContent>
          <PopoverHeader>
            <PopoverCloseButton />
          </PopoverHeader>

          <PopoverBody display="flex" gap="2">
            <Input
              placeholder="hashtag"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />

            <Flex>
              <IconButton
                icon={<Plus />}
                aria-label="create hashtag"
                onClick={() => onNew(newValue)}
              />
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

const CustomUl = chakra(motion.ul, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});
