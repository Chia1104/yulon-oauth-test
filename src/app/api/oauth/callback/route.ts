import ky, { HTTPError } from "ky";
import { env } from "@/env";
import { NextResponse, NextRequest } from "next/server";
import { OAuthSchema, errorGenerator, handleKyError, OAuthResponse } from "@/lib/utils";
import { z } from "zod";
import { cookies } from "next/headers";

export const POST = async (req: NextRequest) => {
  try {
    const json = await req.json();
    const parsed = OAuthSchema.parse(json);
    const response = await ky
      .post("v1/oauth/token", {
        json: {
          grant_type: "authorization_code",
          client_id: env.YULON_SSO_CLIENT_ID,
          client_secret: env.YULON_SSO_CLIENT_SECRET,
          redirect_uri: env.YULON_CLIENT_REDIRECT_URL,
          code: parsed.code,
        },
        prefixUrl: env.YULON_SSO_API_URL,
      })
      .json<OAuthResponse>();
    (await cookies()).set("token", response.access_token, {
      path: "/",
      expires: new Date(Date.now() + response.expires_in * 1000),
      sameSite: "strict",
      httpOnly: true,
    });
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        errorGenerator(
          400,
          error.issues.map((issue) => {
            return {
              field: issue.path.join("."),
              message: issue.message,
            };
          })
        ),
        { status: 400 }
      );
    }

    if (error instanceof HTTPError) {
      console.error(await error.response.clone().json());
      return NextResponse.json(handleKyError(error), { status: error.response.status });
    }

    return NextResponse.error();
  }
};
