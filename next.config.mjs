// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    swcPlugins: [["next-superjson-plugin", {}]],
    esmExternals: false,
  },
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  images: {
    domains: [
      "f004.backblazeb2.com",
      "avatars.githubusercontent.com",
      "cdn.discordapp.com",
    ],
  },
};

export default config;
