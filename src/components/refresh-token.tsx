"use client";
import authApiRequests from "@/apiRequests/auth";
import {
    getAccessTokenFromLocalStorage,
    getRefreshTokenFromLocalStorage,
    setAccessTokenToLocalStorage,
    setRefreshTokenToLocalStorage,
} from "@/lib/utils";
import jwt from "jsonwebtoken";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const UNAUTHENTICATED_PATH = ["/login", "/logout", "/refresh-token"];
const RefreshToken = () => {
  const pathname = usePathname();
  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return;
    let interval: any = null;

    const checkAndRefreshToken = async () => {
      const accessToken = getAccessTokenFromLocalStorage();
      const refreshToken = getRefreshTokenFromLocalStorage();
      if (!accessToken || !refreshToken) {
        return;
      }
      const decodeAccessToken = jwt.decode(accessToken) as {
        exp: number;
        iat: number;
      };
      const decodeRefreshToken = jwt.decode(refreshToken) as {
        exp: number;
        iat: number;
      };
      const now = Math.round(new Date().getTime() / 1000);

      // refresh token expired
      if (decodeRefreshToken.exp <= now) return;
      // call api refresh token
      const lifetime = decodeAccessToken.exp - decodeAccessToken.iat;
      const remaining = decodeAccessToken.exp - now;
      if (remaining < lifetime / 3) {
        try {
          const result = await authApiRequests.refreshToken();
          setAccessTokenToLocalStorage(result.payload.data.accessToken);
          setRefreshTokenToLocalStorage(result.payload.data.refreshToken);
        } catch (error) {
          clearInterval(interval);
        }
      }
    };
    // Gọi lần đầu tiên
    checkAndRefreshToken();
    // Timeout  interval phải bé hơn thời gian của access token
    const TIMEOUT = 60 * 1000; // 1 minute
    // const TIMEOUT = 1000;
    interval = setInterval(checkAndRefreshToken, TIMEOUT);
  }, [pathname]);
  return null;
};

export default RefreshToken;
