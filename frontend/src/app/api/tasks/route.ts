import { NextRequest } from "next/server";
import { forwardTasksRequest } from "./helper";

export async function GET(req: NextRequest) {
  return forwardTasksRequest(req);
}

export async function POST(req: NextRequest) {
  return forwardTasksRequest(req);
}

export async function PUT(req: NextRequest) {
  return forwardTasksRequest(req);
}

export async function DELETE(req: NextRequest) {
  return forwardTasksRequest(req);
}
