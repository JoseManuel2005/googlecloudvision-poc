// /app/api/vision/faces/route.ts
import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

export async function POST(req: Request) {
  try {
    const client = new vision.ImageAnnotatorClient();
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
  } catch (error: any) {
    console.error("Error Faces:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
