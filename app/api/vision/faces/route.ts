// /app/api/vision/faces/route.ts
import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";
import type { protos } from "@google-cloud/vision";

export async function POST(req: Request) {
  try {
    let client: InstanceType<typeof vision.ImageAnnotatorClient>;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      client = new vision.ImageAnnotatorClient({ credentials });
    } else {
      client = new vision.ImageAnnotatorClient();
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const [result] = await client.faceDetection({ image: { content: buffer } });

    const faces = result.faceAnnotations?.map((face, index) => ({
      faceId: index + 1,
      joy: face.joyLikelihood,
      sorrow: face.sorrowLikelihood,
      anger: face.angerLikelihood,
      surprise: face.surpriseLikelihood,
      detectionConfidence: face.detectionConfidence,
      boundingPoly: face.boundingPoly?.vertices || [],
    }));

    return NextResponse.json({ faces });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error Faces:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
