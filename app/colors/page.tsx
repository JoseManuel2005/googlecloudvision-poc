"use client";

import { useState } from "react";
// @ts-ignore
import namer from "color-namer";

export default function ColorsPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [colors, setColors] = useState<
    { rgb: { r: number; g: number; b: number }; score: number }[]
  >([]);
  const [loading, setLoading] = useState(false);

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
      const res = await fetch("/api/vision/colors", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setColors(data.colors || []);
    } catch (err) {
      console.error(err);
      setColors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        🎨 Análisis de Colores Dominantes
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
      {colors.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-md w-full max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Colores detectados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colors.map((c, i) => {
              const { r, g, b } = c.rgb;
              const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)
                .toUpperCase()}`;

              // Obtener el nombre del color con color-namer
              const colorName = namer(hex).pantone[0].name;
              const percentage = (c.score * 100).toFixed(1);

              return (
                <div
                  key={i}
                  className="flex items-center space-x-4 border rounded-xl p-3 shadow-sm hover:shadow-md transition"
                >
                  <div
                    className="w-10 h-10 rounded-full border"
                    style={{ backgroundColor: `rgb(${r},${g},${b})` }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-700">{colorName}</p>
                    <p className="text-sm text-gray-500">
                      {hex} — {percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
