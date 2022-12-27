import type { FC, ReactNode } from "react";
import { Header } from "@/src/components/header";
import { Box, Container, Flex, Spinner } from "@chakra-ui/react";

export interface IDefaultLayout {
  children: ReactNode;
  isLoading?: boolean;
}

export const DefaultLayout: FC<IDefaultLayout> = ({ children, isLoading }) => {
  return (
    <>
      <Header />

      <Container maxW="container.xl">
        {isLoading ? (
          <Flex h="30vh" justifyContent="center" alignItems="center">
            <Spinner />
          </Flex>
        ) : (
          <Box pt="2">{children}</Box>
        )}
      </Container>
    </>
  );
};
