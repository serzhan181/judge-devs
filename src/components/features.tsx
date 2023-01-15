import {
  Badge,
  Button,
  Card,
  Text,
  CardBody,
  Divider,
  Flex,
  Heading,
  useDisclosure,
  Spinner,
  IconButton,
  Container,
  Box,
  chakra,
  shouldForwardProp,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import type { FC } from "react";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { AnimatePresence, isValidMotionProp, motion } from "framer-motion";
import { ArrowLeft } from "react-feather";
import { MetaData } from "../molecules/meta-data";

const SuggestFeatureModal = dynamic(() =>
  import("@/src/modals/suggest-feature-modal").then(
    (c) => c.SuggestFeatureModal
  )
);

type FeaturesProps = {
  inspirationId: string;
};

export const Features: FC<FeaturesProps> = ({ inspirationId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [moreAbtFeatureId, setMoreAbtFeatureId] = useState<
    string | undefined
  >();

  const { data, isLoading } = trpc.feature.getAll.useQuery({ inspirationId });

  return (
    <>
      <Flex
        h="full"
        w="full"
        border="1px solid"
        borderColor="chakra-border-color"
        borderRadius="md"
        overflow="scroll"
        flexDir="column"
        p="2"
        gap="2"
        position="relative"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="sm">Community features</Heading>
          <Button colorScheme="teal" onClick={onOpen}>
            Suggest feature
          </Button>
        </Flex>
        <Divider />

        {/* FULL PAGE */}
        <AnimatePresence mode="wait">
          {moreAbtFeatureId && (
            <BoxCustom
              position="absolute"
              inset="0"
              key="is"
              h="full"
              w="full"
              bgColor="Background"
              initial={{ x: "100%" }}
              animate={{ x: "0" }}
              exit={{ x: "-100%", opacity: 0 }}
              p="2"
            >
              <MoreInfo
                featureId={moreAbtFeatureId}
                goBack={() => setMoreAbtFeatureId(undefined)}
              />
            </BoxCustom>
          )}
        </AnimatePresence>
        {/* FULL PAGE */}

        <Flex h="fit-content" flexDir="column" w="full" gap="2">
          {data && (
            <>
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    {!moreAbtFeatureId && (
                      <Flex
                        as={motion.div}
                        initial={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        gap="2"
                        flexDir="column"
                      >
                        {data.map((f) => (
                          <Feature
                            key={f.id}
                            body={f.name}
                            onClick={() => setMoreAbtFeatureId(f.id)}
                          />
                        ))}
                      </Flex>
                    )}
                  </AnimatePresence>
                </>
              )}
            </>
          )}
        </Flex>
      </Flex>

      <SuggestFeatureModal
        isOpen={isOpen}
        onClose={onClose}
        inspirationId={inspirationId}
      />
    </>
  );
};

type FeatureProps = {
  body: string;
  onClick: () => void;
};

const Feature: FC<FeatureProps> = ({ body, onClick }) => {
  return (
    <Card
      onClick={onClick}
      w="full"
      size="sm"
      bgColor="blackAlpha.300"
      cursor="pointer"
    >
      <CardBody>
        <Flex h="min-content" alignItems="center" gap="2">
          <Badge colorScheme="green">Feature</Badge>{" "}
          <Text lineHeight="4" alignSelf="flex-start">
            {body}
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );
};

type MoreInfoProps = {
  goBack: () => void;
  featureId: string;
};

const MoreInfo: FC<MoreInfoProps> = ({ goBack, featureId }) => {
  const { data, isLoading } = trpc.feature.getById.useQuery(
    { id: featureId },
    {
      enabled: Boolean(featureId),
    }
  );
  return (
    <Flex flexDir="column" w="full">
      <div>
        <IconButton
          aria-label="go back"
          icon={<ArrowLeft />}
          onClick={goBack}
        />
      </div>
      {data && isLoading ? (
        <>
          {
            <Flex justifyContent="center">
              <Spinner />
            </Flex>
          }
        </>
      ) : (
        data && (
          <Container display="flex" flexDir="column" gap="2">
            <Box>
              <MetaData
                creatorImage={data?.user.image}
                creatorName={data.user.name}
              />
            </Box>

            <Box>
              <Heading size="sm">{data.name}</Heading>
            </Box>

            <Box>
              <Text>{data.shortDescription}</Text>
            </Box>
          </Container>
        )
      )}
    </Flex>
  );
};

const BoxCustom = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});
