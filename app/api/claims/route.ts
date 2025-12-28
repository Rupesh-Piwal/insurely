import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createClaimSchema = z.object({
  clientName: z.string(),
  vehicleReg: z.string(),
  lenderName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validation = createClaimSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { clientName, vehicleReg, lenderName } = validation.data;

    const claim = await prisma.claim.create({
      data: {
        userId,
        clientName,
        vehicleReg,
        lenderName,
      },
    });

    return NextResponse.json(claim);
  } catch (error) {
    console.error("[CLAIMS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

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
    });

    return NextResponse.json(claims);
  } catch (error) {
    console.error("[CLAIMS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
