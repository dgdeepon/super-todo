import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      error: false,
      message: "Logged out successfully",
      data: null,
    });

    response.cookies.delete("auth_token");

    return response;
  } catch (error: any) {
    const serverResponse = error?.response?.data;
    return NextResponse.json(
      {
        error: true,
        message: serverResponse?.message || "Something went wrong.",
        data: serverResponse?.data,
      },
      { status: error?.status || 500 },
    );
  }
}
