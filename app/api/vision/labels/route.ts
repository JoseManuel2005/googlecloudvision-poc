//Devuelve una lista de etiquetas (por ejemplo: “árbol”, “persona”, “naturaleza”) y su nivel de confianza.

import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

export async function POST(req: Request) {
  try {
    const client = new vision.ImageAnnotatorClient();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const [result] = await client.labelDetection({ image: { content: buffer } });
    const labels = result.labelAnnotations?.map(label => ({
      description: label.description,
      score: label.score,
    }));

    return NextResponse.json({ labels });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error Labels:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
