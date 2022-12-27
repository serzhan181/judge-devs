import type { ImageProps } from "next/image";
import Image from "next/image";
import styled from "@emotion/styled";

const StyledNextImage = styled(Image)`
  border-radius: 50%;
`;

export const RoundedImage = ({
  width = 40,
  height = 40,
  ...props
}: ImageProps) => <StyledNextImage {...props} width={width} height={height} />;
