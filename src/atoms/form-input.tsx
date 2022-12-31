/* eslint-disable react/display-name */
import type { InputProps } from "@chakra-ui/react";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  forwardRef,
} from "@chakra-ui/react";
import type { FC, ReactElement } from "react";

type FormInputProps = {
  label?: string;
  helperText?: string;
  isError?: boolean;
  leftElement?: ReactElement;
} & InputProps;

export const FormInput: FC<FormInputProps> = forwardRef<
  FormInputProps,
  "input"
>(({ label, helperText, isError, isRequired, leftElement, ...rest }, ref) => (
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
));
