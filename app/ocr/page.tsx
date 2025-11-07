"use client";

import { useState } from "react";

export default function OCRPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // genera la vista previa
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
      const res = await fetch("/api/vision/ocr", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data.text || data.error || "Sin resultados");
    } catch (err) {
      console.error(err);
      setResult("Error en la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        OCR - Detección de Texto en Imágenes
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center space-y-6 w-full max-w-md"
      >
        {/* Caja de carga personalizada */}
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

        {/* Vista previa */}
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

      {result && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-md w-full max-w-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Resultado del OCR
          </h2>
          <p className="whitespace-pre-line text-gray-600 text-sm">{result}</p>
        </div>
      )}
    </main>
  );
}
