import type { GetServerSidePropsContext, PreviewData } from "next";
import { getSession } from "next-auth/react";
import type { ParsedUrlQuery } from "querystring";

export const protectRouteSSR = async (
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
