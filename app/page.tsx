export default function Home() {
  const options = [
    {
      title: "OCR (Texto)",
      description: "Extrae texto de imágenes mediante detección automática.",
      link: "/ocr",
      emoji: "🔤",
    },
    {
      title: "Colores Dominantes",
      description: "Analiza los principales colores presentes en la imagen.",
      link: "/colors",
      emoji: "🎨",
    },
    {
      title: "Rostros y Emociones",
      description: "Detecta rostros y emociones básicas en la imagen.",
      link: "/faces",
      emoji: "😀",
    },
    {
      title: "Etiquetas y Objetos",
      description: "Identifica objetos o conceptos reconocibles en la imagen.",
      link: "/labels",
      emoji: "🏷️",
    },
    {
      title: "Contenido Inapropiado",
      description: "Evalúa si la imagen contiene contenido sensible o explícito.",
      link: "/safe",
      emoji: "🚫",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        Demo: Análisis de Imágenes con Google Cloud Vision
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
        {options.map((opt) => (
          <a
            key={opt.title}
            href={opt.link}
            className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center hover:shadow-lg transition transform hover:-translate-y-1 hover:scale-105"
          >
            <span className="text-5xl mb-4">{opt.emoji}</span>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {opt.title}
            </h2>
            <p className="text-gray-500 text-center text-sm">{opt.description}</p>
          </a>
        ))}
      </div>

      <footer className="mt-10 text-sm text-gray-400">
        © {new Date().getFullYear()} PoC Vision AI - Universidad del Valle
      </footer>
    </main>
  );
}
