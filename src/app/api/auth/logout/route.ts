import authApiRequests from "@/apiRequests/auth";
import { HttpError } from "@/lib/http";
import { LoginBodyType, LogoutBodyType } from "@/schemaValidations/auth.schema";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  if (!accessToken || !refreshToken) {
    return Response.json(
      { message: "Access token or Refresh token Invalid" },
      { status: 200 }
    );
  }
  try {
    const result = await authApiRequests.sLogout({ refreshToken, accessToken });
    return Response.json(result.payload);
  } catch (error) {
    return Response.json({ message: "Logout failed" }, { status: 200 });
  }
}
