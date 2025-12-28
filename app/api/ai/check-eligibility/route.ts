import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/ai/gemini";
import { Eligibility } from "@prisma/client";

const checkEligibilitySchema = z.object({
  claimId: z.string(),
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validation = checkEligibilitySchema.safeParse(body);

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

    // Basic rule-based checks
    if (claim.documents.length === 0) {
      await prisma.claim.update({
        where: { id: claimId },
        data: { eligibility: Eligibility.NEEDS_REVIEW },
      });
      return NextResponse.json({
        eligibility: Eligibility.NEEDS_REVIEW,
        reason: "No documents uploaded.",
      });
    }

    const prompt = `
      Based on the following claim information, assess the likely eligibility and provide a brief explanation.
      The eligibility should be one of: LIKELY_VALID, NEEDS_REVIEW, LIKELY_INVALID.
      Return the eligibility and a brief reason as a JSON object with keys "eligibility" and "reason".

      Claim Details:
      - Client Name: ${claim.clientName}
      - Vehicle Registration: ${claim.vehicleReg}
      - Lender Name: ${claim.lenderName}
      - AI Extracted Data: ${JSON.stringify(claim.aiExtractedData)}
    `;

    const result = await gemini.generateContent(prompt);
    const { eligibility, reason } = JSON.parse(result.response.text());

    await prisma.claim.update({
      where: { id: claimId },
      data: { eligibility },
    });

    return NextResponse.json({ eligibility, reason });
  } catch (error) {
    console.error("[CHECK_ELIGIBILITY_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
