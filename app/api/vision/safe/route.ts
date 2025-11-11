//Evalúa si la imagen tiene contenido adulto, violento, o inapropiado.

import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

export async function POST(req: Request) {
  try {
    const client = new vision.ImageAnnotatorClient();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const [result] = await client.safeSearchDetection({ image: { content: buffer } });
    const safe = result.safeSearchAnnotation;

    return NextResponse.json({
      adult: safe?.adult,
      violence: safe?.violence,
      racy: safe?.racy,
      medical: safe?.medical,
      spoof: safe?.spoof,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error SafeSearch:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
