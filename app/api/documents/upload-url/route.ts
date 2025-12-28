import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { S3 } from "aws-sdk";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadUrlSchema = z.object({
  claimId: z.string(),
  fileName: z.string(),
  fileType: z.string(),
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validation = uploadUrlSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { claimId, fileName, fileType } = validation.data;
    const ext = fileName.split(".").pop();
    const s3Key = `claims/${claimId}/${uuidv4()}.${ext}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
      Expires: 60,
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    return NextResponse.json({ uploadUrl, s3Key });
  } catch (error) {
    console.error("[UPLOAD_URL_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
