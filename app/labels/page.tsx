"use client";

import { useState } from "react";

export default function LabelsPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [labels, setLabels] = useState<
    { description: string; score: number }[]
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
      const res = await fetch("/api/vision/labels", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setLabels(data.labels || []);
    } catch (err) {
      console.error(err);
      setLabels([]);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 0.85) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-400";
    if (score >= 0.3) return "bg-orange-400";
    return "bg-red-500";
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        🏷️ Detección de Etiquetas y Objetos
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
      {labels.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-md w-full max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Etiquetas detectadas
          </h2>

          <div className="space-y-3">
            {labels.map((label, i) => {
              const percentage = (label.score * 100).toFixed(1);
              const barColor = getBarColor(label.score);
              return (
                <div
                  key={i}
                  className="p-3 border rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">
                      🏷️ {label.description}
                    </span>
                    <span className="text-sm text-gray-600">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className={`h-2 rounded-full ${barColor}`}
                      style={{ width: `${label.score * 100}%` }}
                    ></div>
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
