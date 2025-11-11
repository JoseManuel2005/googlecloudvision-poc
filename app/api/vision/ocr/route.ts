//Recibe una imagen → la convierte en buffer → llama a textDetection() → devuelve el texto encontrado.

import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

export async function POST(req: Request) {
  try {
    const client = new vision.ImageAnnotatorClient();
    const formData = await req.formData();
    console.log("Campos recibidos:", Array.from(formData.keys())); // 👈
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se envió ninguna imagen" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const [result] = await client.textDetection({ image: { content: buffer } });
    const detections = result.textAnnotations;

    return NextResponse.json({
      text: detections?.[0]?.description || "No se detectó texto",
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error OCR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
