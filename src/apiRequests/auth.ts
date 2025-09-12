import http from "@/lib/http";
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from "@/schemaValidations/auth.schema";

const authApiRequests = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: RefreshTokenResType;
  }> | null,
  // Login
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body),
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("api/auth/login", body, {
      baseUrl: "",
    }),

  // Logout
  sLogout: (body: LogoutBodyType & { accessToken: string }) =>
    http.post(
      "/auth/logout",
      { refreshToken: body.refreshToken },
      {
        headers: { Authorization: `Bearer ${body.accessToken}` },
      }
    ),
  logout: () => http.post("/api/auth/logout", null, { baseUrl: "" }),

  // Refresh token
  sRefreshToken: (body: RefreshTokenBodyType) =>
    http.post<RefreshTokenResType>("auth/refresh-token", body),

  async refreshToken() {
    if (this.refreshTokenRequest) {
      return this.refreshTokenRequest;
    }
    this.refreshTokenRequest = http.post<RefreshTokenResType>(
      "api/auth/refresh-token",
      null,
      {
        baseUrl: "",
      }
    );

    const result = await this.refreshTokenRequest;
    this.refreshTokenRequest = null;
    return result;
  },
};
export default authApiRequests;
