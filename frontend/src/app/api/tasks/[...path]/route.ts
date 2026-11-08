import { NextRequest } from "next/server";
import { forwardTasksRequest } from "../helper";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  const subpath = params.path.join("/");
  return forwardTasksRequest(req, subpath);
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  const subpath = params.path.join("/");
  return forwardTasksRequest(req, subpath);
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  const subpath = params.path.join("/");
  return forwardTasksRequest(req, subpath);
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  const subpath = params.path.join("/");
  return forwardTasksRequest(req, subpath);
}
