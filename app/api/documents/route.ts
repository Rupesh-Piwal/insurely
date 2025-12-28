import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createDocumentSchema = z.object({
  claimId: z.string(),
  fileName: z.string(),
  s3Key: z.string(),
  mimeType: z.string(),
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validation = createDocumentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { claimId, fileName, s3Key, mimeType } = validation.data;

    const document = await prisma.document.create({
      data: {
        claimId,
        fileName,
        s3Key,
        mimeType,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENTS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
