import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    YULON_SSO_CLIENT_ID: z.string().min(1),
    YULON_SSO_CLIENT_SECRET: z.string().min(1),
    YULON_CLIENT_REDIRECT_URL: z.string().url(),
    YULON_SSO_API_URL: z.string().url(),
  },
  runtimeEnv: {
    YULON_SSO_CLIENT_ID: process.env.YULON_SSO_CLIENT_ID,
    YULON_SSO_CLIENT_SECRET: process.env.YULON_SSO_CLIENT_SECRET,
    YULON_CLIENT_REDIRECT_URL: process.env.YULON_CLIENT_REDIRECT_URL,
    YULON_SSO_API_URL: process.env.YULON_SSO_API_URL,
  },
});
