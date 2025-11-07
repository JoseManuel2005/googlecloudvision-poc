import vision from "@google-cloud/vision";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./service-account.json"; // 👈 Añade esta línea

async function main() {
  try {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.labelDetection("./test.jpeg");
    console.log("✅ Conexión exitosa. Etiquetas detectadas:");
    console.log(result.labelAnnotations.map(l => l.description));
  } catch (error) {
    console.error("❌ Error al conectar con Vision API:", error.message);
  }
}

main();
