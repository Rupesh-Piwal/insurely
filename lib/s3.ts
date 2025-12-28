import { S3 } from "aws-sdk";
import pdf from "pdf-parse";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function getTextFromS3Pdf(s3Key: string): Promise<string> {
  const s3Object = await s3
    .getObject({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: s3Key,
    })
    .promise();

  const pdfData = await pdf(s3Object.Body as Buffer);
  return pdfData.text;
}
