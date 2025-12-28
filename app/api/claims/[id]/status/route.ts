import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ClaimStatus } from "@prisma/client";

const updateStatusSchema = z.object({
  status: z.nativeEnum(ClaimStatus),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { status } = validation.data;

    const claim = await prisma.claim.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!claim) {
      return new NextResponse("Claim not found", { status: 404 });
    }

    const updatedClaim = await prisma.claim.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    });

    await prisma.claimStatusHistory.create({
      data: {
        claimId: params.id,
        from: claim.status,
        to: status,
      },
    });

    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error("[CLAIM_STATUS_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
