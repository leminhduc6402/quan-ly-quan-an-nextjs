"use client";

import {
  checkAndRefreshToken,
  getRefreshTokenFromLocalStorage,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const RefreshTokenPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshTokenFromUrl = searchParams.get("rT");
  const redirectPathname = searchParams.get("redirect");
  useEffect(() => {
    if (
      refreshTokenFromUrl &&
      refreshTokenFromUrl === getRefreshTokenFromLocalStorage()
    ) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || "/");
        },
      });
    }
  }, [router, refreshTokenFromUrl]);

  return <div>Loading...</div>;
};

export default RefreshTokenPage;
