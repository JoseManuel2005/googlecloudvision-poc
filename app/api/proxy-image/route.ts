// Proxy para cargar imágenes externas y evitar problemas de CORS

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "URL no proporcionada" }, { status: 400 });
    }

    // Validar que sea una URL válida
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    // Descargar la imagen desde el servidor
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "No se pudo cargar la imagen" }, { status: response.status });
    }

    // Obtener el contenido de la imagen
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Devolver la imagen con los headers correctos
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error en proxy de imagen:", error);
    return NextResponse.json({ error: "Error al procesar la imagen" }, { status: 500 });
  }
}