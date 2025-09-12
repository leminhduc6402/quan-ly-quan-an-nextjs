import accountApiRequest from "@/apiRequests/account";
import { cookies } from "next/headers";
import React from "react";

const Dashboard = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value as string;
  let name = "";
  try {
    const result = await accountApiRequest.sMe(accessToken);
    name = result.payload.data.name;
  } catch (error: any) {
    if (error.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
  }
  return <div>Dashboard: {name}</div>;
};

export default Dashboard;
