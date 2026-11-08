import { NextRequest, NextResponse } from "next/server";
import { Method } from "axios";
import axiosInstance from "@/api/axiosInstance";

const BACKEND_URL = process.env.NEXT_BACKEND_API_URL;

export async function forwardTasksRequest(
  req: NextRequest,
  subpathParam?: string,
) {
  try {
    const url = new URL(req.url);

    // Determine subpath, e.g. "", "/by-date", "/count-summary", "/weekly", "/search"
    let subpath = subpathParam ? `/${subpathParam}` : "";

    if (!subpath) {
      // Check query param action, e.g. ?action=by-date
      const action = url.searchParams.get("action");
      if (action) {
        subpath = `/${action}`;
      } else {
        // Check URL pathname segments after /api/tasks
        const pathname = url.pathname;
        const prefix = "/api/tasks";
        if (pathname.startsWith(prefix) && pathname.length > prefix.length) {
          subpath = pathname.substring(prefix.length);
        }
      }
    }

    // Forward search parameters (e.g. ?q=searchQuery)
    const search = url.search;
    const targetUrl = `${BACKEND_URL}/tasks${subpath}${search}`;

    const authHeader = req.headers.get("authorization");
    const method = req.method as Method;
    let data: any = undefined;

    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      data = await req.json().catch(() => ({}));
    }

    const response = await axiosInstance.request({
      method,
      url: targetUrl,
      data,
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || {
      status: false,
      message: error.message || "Failed to process task request",
    };
    return NextResponse.json(errorData, { status });
  }
}
