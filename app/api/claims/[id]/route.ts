import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const claim = await prisma.claim.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!claim) {
      return new NextResponse("Claim not found", { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (error) {
    console.error("[CLAIM_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
