import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/ai/gemini";
import { getTextFromS3Pdf } from "@/lib/s3";

const summarizeClaimSchema = z.object({
  claimId: z.string(),
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validation = summarizeClaimSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { claimId } = validation.data;

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { documents: true },
    });

    if (!claim) {
      return new NextResponse("Claim not found", { status: 404 });
    }

    let combinedText = "";
    for (const document of claim.documents) {
      const text = await getTextFromS3Pdf(document.s3Key);
      combinedText += text + "\n\n";
    }

    const prompt = `
      Provide a concise professional summary (3-5 lines) for the following claim information and documents.

      Claim Details:
      - Client Name: ${claim.clientName}
      - Vehicle Registration: ${claim.vehicleReg}
      - Lender Name: ${claim.lenderName}

      Documents Text:
      ${combinedText}
    `;

    const result = await gemini.generateContent(prompt);
    const summary = result.response.text();

    await prisma.claim.update({
      where: { id: claimId },
      data: { aiSummary: summary },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SUMMARIZE_CLAIM_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
