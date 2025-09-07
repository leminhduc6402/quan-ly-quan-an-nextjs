import authApiRequests from "@/apiRequests/auth";
import { HttpError } from "@/lib/http";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType;
  const cookieStore = await cookies();
  try {
    const { payload } = await authApiRequests.sLogin(body);
    const { accessToken, refreshToken } = payload.data;
    const decodeAccessToken = jwt.decode(accessToken) as { exp: number };
    const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number };

    cookieStore.set("accessToken", accessToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: decodeAccessToken.exp * 1000,
    });
    cookieStore.set("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: decodeRefreshToken.exp * 1000,
    });

    return Response.json(payload);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status });
    } else {
      return Response.json(
        {
          message: "Lỗi không xác định",
          error: String(error),
        },
        { status: 500 }
      );
    }
  }
}
