/* eslint-disable react/display-name */
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import styled from "@emotion/styled";
import type { InputProps } from "@chakra-ui/react";
import { theme } from "@chakra-ui/react";
import { Flex, Spinner } from "@chakra-ui/react";

const Ul = styled.ul`
  background-color: ${theme.colors.blackAlpha[500]};
  width: 100%;
  top: 2.8rem;
  border-radius: 10px;
  overflow: hidden;

  position: absolute;

  z-index: 100;
`;

export function withInputOptions<T>(InputComponent: ComponentType) {
  return ({
    options = [],
    renderOption,
    isLoading,
    ...rest
  }: Partial<InputProps> & {
    renderOption: (o: T) => ReactNode;
    options: T[];
    isLoading?: boolean;
  }) => {
    const [focused, setFocused] = useState(false);

    return (
      <Flex w="full" onFocus={() => setFocused(true)} position="relative">
        <Flex w="full">
          <InputComponent {...rest} />

          {Boolean(options.length) && focused && (
            <Ul>
              {isLoading ? (
                <Flex
                  css={{
                    p: "$2",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Spinner color="currentColor" size="sm" />
                </Flex>
              ) : (
                options.map((o) => renderOption(o))
              )}
            </Ul>
          )}
        </Flex>
      </Flex>
    );
  };
}
