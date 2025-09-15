"use client";
import { checkAndRefreshToken } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const UNAUTHENTICATED_PATH = ["/login", "/logout", "/refresh-token"];
const RefreshToken = () => {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return;
    let interval: any = null;

    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval);
        router.push("/login");
      },
    });
    // Timeout  interval phải bé hơn thời gian của access token
    // const TIMEOUT = 60 * 1000; // 1 minute
    const TIMEOUT = 1000;

    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onError: () => {
            clearInterval(interval);
            router.push("/login");
          },
        }),
      TIMEOUT
    );

    return () => clearInterval(interval);
  }, [pathname, router]);
  return null;
};

export default RefreshToken;
