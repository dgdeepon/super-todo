import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import axiosInstance from "@/api/axiosInstance";

const BACKEND_URL = "/auth/";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    let action = searchParams.get("action");
    if (!action) {
      const segments = url.pathname.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      if (lastSegment === "login" || lastSegment === "register") {
        action = lastSegment;
      }
    }
    console.log(action);

    const body = await req.json().catch(() => ({}));

    if (!action && body?.action) {
      action = body.action;
    }

    if (!action) {
      action = "login";
    }

    if (action === "logout") {
      const response = NextResponse.json({
        error: false,
        message: "Logged out successfully",
        data: null,
      });

      response.cookies.delete("auth_token");

      return response;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await axiosInstance.post(BACKEND_URL + action, body, {
      headers,
    });

    const responseData = NextResponse.json(response.data, {
      status: response.status,
    });

    responseData.cookies.set("auth_token", response.data?.data?.token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return responseData;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {
      status: false,
      message: error.message || "Failed to process authentication request",
    };
    return NextResponse.json(data, { status });
  }
}
