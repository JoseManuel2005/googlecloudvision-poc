import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

export async function POST(req: Request) {
  try {
    const client = new vision.ImageAnnotatorClient();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Llamada a la API de Google Cloud Vision para localizar objetos
    if (!client.objectLocalization) {
      throw new Error("objectLocalization method is not available");
    }
    const [result] = await client.objectLocalization({
      image: { content: buffer },
    });

    // Extraemos los datos relevantes de cada objeto detectado
    const objects = result.localizedObjectAnnotations?.map((obj) => ({
      name: obj.name, // Nombre del objeto (ej: Person, Dog, Car)
      score: obj.score, // Nivel de confianza (0–1)
      vertices: obj.boundingPoly?.normalizedVertices || [], // Coordenadas normalizadas (x, y)
    }));

    return NextResponse.json({ objects });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error Object Localization:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}