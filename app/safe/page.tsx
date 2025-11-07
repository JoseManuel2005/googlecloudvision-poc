"use client";

import { useState } from "react";

export default function SafeSearchPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{
    adult?: string;
    violence?: string;
    racy?: string;
    medical?: string;
    spoof?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Traducción de niveles
  const interpretacion: Record<string, string> = {
    VERY_LIKELY: "Muy probable",
    LIKELY: "Probable",
    POSSIBLE: "Posible",
    UNLIKELY: "Poco probable",
    VERY_UNLIKELY: "Nada probable",
  };

  // Colores por nivel
  const colores: Record<string, string> = {
    VERY_LIKELY: "bg-red-500",
    LIKELY: "bg-orange-400",
    POSSIBLE: "bg-yellow-400",
    UNLIKELY: "bg-green-400",
    VERY_UNLIKELY: "bg-green-500",
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("/api/vision/safe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        🚫 Análisis de Contenido Inapropiado
      </h1>

      {/* Formulario de carga */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center space-y-6 w-full max-w-md"
      >
        <label
          htmlFor="fileInput"
          className="border-2 border-dashed border-gray-400 rounded-lg p-6 w-full text-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
        >
          <span className="text-gray-600 font-medium">
            📁 Haz clic o arrastra una imagen aquí
          </span>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
        </label>

        {preview && (
          <div className="mt-2 w-full">
            <img
              src={preview}
              alt="Vista previa"
              className="w-full h-64 object-contain rounded-lg shadow-sm border"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!image || loading}
          className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition disabled:opacity-50 w-full"
        >
          {loading ? "Analizando..." : "Analizar Imagen"}
        </button>
      </form>

      {/* Resultados */}
      {result && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-md w-full max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Resultados del análisis
          </h2>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-4 items-center">
              <span>🔞</span>
              <span>Adulto</span>
              <span>{interpretacion[result.adult || ""]}</span>
              <span
                className={`w-4 h-4 rounded-full ${
                  colores[result.adult || ""] || "bg-gray-300"
                }`}
              ></span>
            </div>

            <div className="grid grid-cols-4 items-center">
              <span>💥</span>
              <span>Violencia</span>
              <span>{interpretacion[result.violence || ""]}</span>
              <span
                className={`w-4 h-4 rounded-full ${
                  colores[result.violence || ""] || "bg-gray-300"
                }`}
              ></span>
            </div>

            <div className="grid grid-cols-4 items-center">
              <span>💃</span>
              <span>Provocativo</span>
              <span>{interpretacion[result.racy || ""]}</span>
              <span
                className={`w-4 h-4 rounded-full ${
                  colores[result.racy || ""] || "bg-gray-300"
                }`}
              ></span>
            </div>

            <div className="grid grid-cols-4 items-center">
              <span>🏥</span>
              <span>Médico</span>
              <span>{interpretacion[result.medical || ""]}</span>
              <span
                className={`w-4 h-4 rounded-full ${
                  colores[result.medical || ""] || "bg-gray-300"
                }`}
              ></span>
            </div>

            <div className="grid grid-cols-4 items-center">
              <span>🤡</span>
              <span>Manipulado</span>
              <span>{interpretacion[result.spoof || ""]}</span>
              <span
                className={`w-4 h-4 rounded-full ${
                  colores[result.spoof || ""] || "bg-gray-300"
                }`}
              ></span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
