//Devuelve una lista de etiquetas (por ejemplo: “árbol”, “persona”, “naturaleza”) y su nivel de confianza.

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

    const [result] = await client.labelDetection({ image: { content: buffer } });
    const labels = result.labelAnnotations?.map((label: protos.google.cloud.vision.v1.IEntityAnnotation) => ({
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
