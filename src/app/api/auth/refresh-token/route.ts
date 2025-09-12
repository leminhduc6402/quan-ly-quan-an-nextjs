import authApiRequests from "@/apiRequests/auth";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshTokenFromCookie = cookieStore.get("refreshToken")
    ?.value as string;
  if (!refreshTokenFromCookie) {
    return Response.json(
      {
        message: "Không tìm thấy RT",
      },
      {
        status: 401,
      }
    );
  }
  try {
    const { payload } = await authApiRequests.sRefreshToken({
      refreshToken: refreshTokenFromCookie,
    });
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
  } catch (error: any) {
    return Response.json(
      {
        message: error.message ?? "Lỗi không xác định",
        error: String(error),
      },
      { status: 401 }
    );
  }
}
