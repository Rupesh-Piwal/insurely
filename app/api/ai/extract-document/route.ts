import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/ai/gemini";
import { getTextFromS3Pdf } from "@/lib/s3";

const extractDocumentSchema = z.object({
  documentId: z.string(),
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validation = extractDocumentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { documentId } = validation.data;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    const text = await getTextFromS3Pdf(document.s3Key);

    const prompt = `
      Extract the following information from the document text:
      - agreementNumber
      - lenderName
      - contractDate
      - potentialIssues (array of strings)

      Return the extracted data as a JSON object.

      Text:
      ${text}
    `;

    const result = await gemini.generateContent(prompt);
    const extractedData = JSON.parse(result.response.text());

    await prisma.document.update({
      where: { id: documentId },
      data: { extractedData },
    });

    await prisma.claim.update({
      where: { id: document.claimId },
      data: { aiExtractedData: extractedData },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EXTRACT_DOCUMENT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
