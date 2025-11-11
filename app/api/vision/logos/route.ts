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
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const [result] = await client.logoDetection({ image: { content: buffer } });

    const logos =
      result.logoAnnotations?.map((logo) => ({
        description: logo.description ?? "",
        score: logo.score ?? 0,
        boundingPoly: {
          vertices:
            logo.boundingPoly?.vertices?.map((v) => ({
              x: typeof v.x === "number" ? v.x : 0,
              y: typeof v.y === "number" ? v.y : 0,
            })) ?? [],
          normalizedVertices:
            logo.boundingPoly?.normalizedVertices?.map((v) => ({
              x: typeof v.x === "number" ? v.x : 0,
              y: typeof v.y === "number" ? v.y : 0,
            })) ?? [],
        },
      })) ?? [];

    return NextResponse.json({ logos });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error Logos:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
