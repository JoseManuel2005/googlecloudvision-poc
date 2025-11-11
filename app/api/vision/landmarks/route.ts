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

    const [landmarkRes] = await client.landmarkDetection({ image: { content: buffer } });

    const landmarks =
      landmarkRes.landmarkAnnotations?.map((lm) => ({
        description: lm.description,
        score: lm.score ?? 0,
        boundingPoly: {
          vertices: lm.boundingPoly?.vertices?.map((v) => ({ x: v.x ?? 0, y: v.y ?? 0 })) ?? [],
          normalizedVertices:
            lm.boundingPoly?.normalizedVertices?.map((v) => ({ x: v.x ?? 0, y: v.y ?? 0 })) ?? [],
        },
        locations:
          lm.locations?.map((loc) => ({
            latitude: loc.latLng?.latitude ?? null,
            longitude: loc.latLng?.longitude ?? null,
          })) ?? [],
      })) ?? [];

    // Fallback si no hubo landmarks
    let fallback: {
      bestGuessLabel?: string;
      webEntities?: { description: string; score: number }[];
      labels?: { description: string; score: number }[];
    } | null = null;

    if (!landmarks.length) {
      const [webRes] = await client.webDetection({ image: { content: buffer } });
      const rawBestGuessLabel = webRes.webDetection?.bestGuessLabels?.[0]?.label;
      const bestGuessLabel = rawBestGuessLabel == null ? undefined : rawBestGuessLabel;
      const webEntities =
        webRes.webDetection?.webEntities
          ?.filter((e) => !!e.description)
          .slice(0, 6)
          .map((e) => ({ description: e.description!, score: e.score ?? 0 })) ?? [];

      const [labelRes] = await client.labelDetection({ image: { content: buffer } });
      const labels =
        labelRes.labelAnnotations
          ?.slice(0, 6)
          .map((l) => ({ description: l.description ?? "", score: l.score ?? 0 })) ?? [];

      fallback = { bestGuessLabel, webEntities, labels };
    }

    return NextResponse.json({ landmarks, fallback });
  } catch (error: unknown) {
    console.error("Error Landmarks:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
