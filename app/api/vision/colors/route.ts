//Devuelve los colores dominantes en la imagen, con su proporción relativa.


import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

export async function POST(req: Request) {
  try {
    const client = new vision.ImageAnnotatorClient();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const [result] = await client.imageProperties({ image: { content: buffer } });
    const colors = result.imagePropertiesAnnotation?.dominantColors?.colors?.map(c => ({
      rgb: {
        r: c.color?.red,
        g: c.color?.green,
        b: c.color?.blue,
      },
      score: c.score,
    }));

    return NextResponse.json({ colors });
  } catch (error: any) {
    console.error("Error Colors:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
