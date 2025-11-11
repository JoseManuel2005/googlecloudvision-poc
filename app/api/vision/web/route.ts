// Detecta información web relacionada con la imagen:
// imágenes similares, páginas que contienen la imagen, y entidades relacionadas.

import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

export async function POST(req: Request) {
  try {
    const client = new vision.ImageAnnotatorClient();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Llamada a la API de Google Cloud Vision para detección web
    const [result] = await client.webDetection({
      image: { content: buffer },
    });

    const webDetection = result.webDetection;

    // Extraemos los datos relevantes
    const data = {
      // Entidades web detectadas (ej: "Golden Gate Bridge")
      webEntities: webDetection?.webEntities?.map((entity) => ({
        description: entity.description || "Sin descripción",
        score: entity.score || 0,
      })) || [],

      // Imágenes completas que coinciden
      fullMatchingImages: webDetection?.fullMatchingImages?.map((img) => ({
        url: img.url || "",
      })) || [],

      // Imágenes parcialmente coincidentes
      partialMatchingImages: webDetection?.partialMatchingImages?.map((img) => ({
        url: img.url || "",
      })) || [],

      // Páginas web que contienen la imagen
      pagesWithMatchingImages: webDetection?.pagesWithMatchingImages?.map((page) => ({
        url: page.url || "",
        pageTitle: page.pageTitle || "Sin título",
      })) || [],

      // Imágenes visualmente similares
      visuallySimilarImages: webDetection?.visuallySimilarImages?.map((img) => ({
        url: img.url || "",
      })) || [],

      // Mejor suposición de etiqueta
      bestGuessLabels: webDetection?.bestGuessLabels?.map((label) => ({
        label: label.label || "",
      })) || [],
    };

    return NextResponse.json(data);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error Web Detection:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
