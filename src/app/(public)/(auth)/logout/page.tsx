"use client";

import { useAppContext } from "@/components/app-provider";
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
} from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const LogoutPage = () => {
  const { setIsAuth } = useAppContext();
  const { mutateAsync } = useLogoutMutation();
  const router = useRouter();
  const ref = useRef<typeof mutateAsync | null>(null);
  const searchParams = useSearchParams();
  const refreshTokenFromUrl = searchParams.get("rT");
  const accessTokenFromUrl = searchParams.get("accessToken");

  useEffect(() => {
    const isRefreshTokenChanged =
      refreshTokenFromUrl &&
      refreshTokenFromUrl === getRefreshTokenFromLocalStorage();

    const isAccessTokenChanged =
      accessTokenFromUrl &&
      accessTokenFromUrl === getAccessTokenFromLocalStorage();

    if (!ref.current && (isRefreshTokenChanged || isAccessTokenChanged)) {
      ref.current = mutateAsync;

      mutateAsync().then((res) => {
        setTimeout(() => {
          ref.current = null;
        }, 1000);
        setIsAuth(false);
        router.push("/login");
      });
    } else {
      router.push("/");
    }
  }, [router, mutateAsync, refreshTokenFromUrl, accessTokenFromUrl]);

  return <div>Logout...</div>;
};

export default LogoutPage;
