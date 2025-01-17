"use client";

import { useQuery } from "@tanstack/react-query";
import ky, { HTTPError } from "ky";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Card, CardContent, CardHeader } from "../ui/card";
import { OAuthResponse, ErrorResponse } from "@/lib/utils";
import { useEffect, useState } from "react";

const useAuthorization = (code: string) => {
  return useQuery<OAuthResponse, HTTPError>({
    queryKey: ["authorization", code],
    queryFn: ({ signal }) =>
      ky
        .post<OAuthResponse>("/api/oauth/callback", {
          json: { code },
          signal,
        })
        .json(),
    staleTime: 0,
    gcTime: 0,
    retry: 0,
  });
};

const Authorization = ({ code }: { code: string }) => {
  const [requestError, setRequestError] = useState<ErrorResponse | null>(null);
  const { isError, error, isLoading, data } = useAuthorization(code);

  useEffect(() => {
    if (error) {
      try {
        if (error instanceof HTTPError) {
          error.response.json<ErrorResponse>().then((data) => {
            setRequestError(data);
          });
          return;
        }
        setRequestError(null);
      } catch (e) {
        setRequestError(null);
      }
    }
  }, [error]);

  return (
    <Card>
      <CardHeader>OAuth Response</CardHeader>
      <CardContent>
        {isLoading && (
          <Alert>
            <AlertTitle>Loading...</AlertTitle>
            <AlertDescription>Fetching OAuth response...</AlertDescription>
          </Alert>
        )}
        {isError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <code>{JSON.stringify(requestError, null, 2)}</code>
            </AlertDescription>
          </Alert>
        )}
        {data && (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              <code>{JSON.stringify(data, null, 2)}</code>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default Authorization;
