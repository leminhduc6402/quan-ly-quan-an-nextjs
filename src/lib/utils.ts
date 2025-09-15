import { clsx, type ClassValue } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { EntityError } from "./http";
import { toast } from "sonner";
import jwt from "jsonwebtoken";
import authApiRequests from "@/apiRequests/auth";
import { on } from "events";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    // Trường hợp lỗi validation từ server
    error.payload.errors.forEach((item: { field: string; message: string }) => {
      setError(item.field, {
        type: "server",
        message: item.message,
      });
    });
  } else {
    // Trường hợp lỗi chung
    toast.error(error?.payload?.message ?? "Lỗi không xác định", {
      duration: duration ?? 5000,
    });
  }
};

const isBrowser = typeof window !== "undefined";
export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("accessToken") : null;

export const setAccessTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("accessToken", value);

export const getRefreshTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("refreshToken") : null;

export const setRefreshTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("refreshToken", value);
export const removeTokensFromLocalStorage = () => {
  isBrowser && localStorage.removeItem("accessToken");
  isBrowser && localStorage.removeItem("refreshToken");
};

export const checkAndRefreshToken = async (param?: {
  onError?: () => void;
  onSuccess?: () => void;
}) => {
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
  const now = new Date().getTime() / 1000 - 1;

  // refresh token expired
  if (decodeRefreshToken.exp <= now) {
    removeTokensFromLocalStorage();
    param?.onError && param.onError();
    return;
  }
  // call api refresh token
  const lifetime = decodeAccessToken.exp - decodeAccessToken.iat;
  const remaining = decodeAccessToken.exp - now;
  if (remaining < lifetime / 3) {
    try {
      const result = await authApiRequests.refreshToken();
      setAccessTokenToLocalStorage(result.payload.data.accessToken);
      setRefreshTokenToLocalStorage(result.payload.data.refreshToken);
      param?.onSuccess && param.onSuccess();
    } catch (error) {
      param?.onError && param.onError();
    }
  }
};
