import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { HTTPError } from "ky";
import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import SuperJSON from "superjson";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const errorConfig = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  408: "Request Timeout",
  429: "Too Many Requests",
  500: "Internal Server Error",
  503: "Service Unavailable",
} as const;

export function errorGenerator(statusCode: number, errors?: ErrorResponse["errors"]): ErrorResponse {
  if (!(statusCode in errorConfig)) {
    return {
      code: "Unknown",
      status: statusCode,
      errors,
    };
  }
  return {
    code: errorConfig[statusCode as keyof typeof errorConfig] ?? "Unknown",
    status: statusCode,
    errors,
  };
}

export class ParsedJSONError extends Error {
  constructor(public error: ErrorResponse) {
    super("Parsed JSON error");
  }
}

export const OAuthSchema = z.object({
  code: z.string().min(1),
});

export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export interface ErrorResponse {
  status?: number;
  code: string;
  errors?:
    | {
        field: string;
        message: string;
      }[]
    | null;
}

export const handleKyError = async (error: HTTPError): Promise<ErrorResponse> => {
  switch (error.name) {
    case "HTTPError": {
      const { response } = error;
      if (response?.body) {
        try {
          return (await error.response.clone().json()) as ErrorResponse;
        } catch (err) {
          console.error(err);
          return {
            code: "unknown error",
          };
        }
      }
      return {
        code: "unknown error",
      };
    }
    case "AbortError": {
      return {
        code: "abort error",
      };
    }
    default: {
      return {
        code: "unknown error",
      };
    }
  }
};

export type OAuthResponse = {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
