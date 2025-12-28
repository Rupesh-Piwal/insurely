import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ClaimStatus } from "@prisma/client";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const claims = await prisma.claim.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const totalClaims = claims.length;

    const claimsByStatus = claims.reduce(
      (acc: Record<ClaimStatus, number>, claim) => {
        acc[claim.status]++;
        return acc;
      },
      {
        NEW: 0,
        REVIEW: 0,
        SUBMITTED: 0,
        APPROVED: 0,
        REJECTED: 0,
      }
    );

    const recentClaims = claims.slice(0, 5);

    return NextResponse.json({
      totalClaims,
      claimsByStatus,
      recentClaims,
    });
  } catch (error) {
    console.error("[DASHBOARD_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
