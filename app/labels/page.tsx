"use client";

import { useState, useRef, useCallback } from "react";
import { Tags, ImagePlus, Loader2, Sparkles, ChartBar } from "lucide-react";
import Footer from "@/components/common/Footer";

export default function LabelsPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [labels, setLabels] = useState<{ description: string; score: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        handleFileChange(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (preview) {
      try {
        URL.revokeObjectURL(preview);
      } catch (e) {}
    }
    setImage(null);
    setPreview(null);
    setLabels([]);
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
    if (score >= 0.85) return "bg-[#34A853]";
    if (score >= 0.6) return "bg-[#FBBC04]";
    if (score >= 0.3) return "bg-[#EA4335]";
    return "bg-red-500";
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center p-6 relative overflow-hidden">
      {/* Fondos decorativos Google style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-linear-to-br from-[#4285F4]/20 to-[#1967D2]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-80 h-80 bg-linear-to-br from-[#34A853]/20 to-[#188038]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Encabezado */}
        <div className="text-center mb-14 space-y-5">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
            <Tags className="w-4 h-4 text-[#34A853]" />
            <span className="text-sm font-semibold bg-green-500 bg-clip-text text-transparent">
              Detección de Etiquetas
            </span>
            <Sparkles className="w-4 h-4 text-green-500" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Etiquetas y Objetos{" "}
            <span className="block bg-green-500 bg-clip-text text-transparent">
              en tus imágenes
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Sube una imagen y deja que la IA de Google detecte los objetos y conceptos más relevantes junto a su nivel de confianza.
          </p>
        </div>

        {/* Formulario con área de arrastrar y soltar */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-6 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(66,133,244,0.2)]"
        >
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={onClickUpload}
            className={`border-2 border-dashed rounded-2xl p-10 w-full text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-[#34A853] bg-green-50 dark:bg-green-900/20"
                : "border-gray-400 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-[#34A853] hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <ImagePlus className="w-10 h-10 text-[#34A853]" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {isDragging
                  ? "¡Suelta la imagen aquí!"
                  : "Haz clic o arrastra una imagen aquí"}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
          </div>

          {/* Vista previa */}
          {preview && (
            <div className="mt-4 w-full">
              <img
                src={preview}
                alt="Vista previa"
                className="w-full h-72 object-contain rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!image || loading}
            className="w-full flex justify-center items-center gap-2 bg-green-600 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-white font-medium px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 disabled:opacity-50 shadow-lg cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analizando...
              </>
            ) : (
              "Analizar Imagen"
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="w-full mt-2 flex justify-center items-center gap-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium px-6 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            Limpiar
          </button>
        </form>

        {/* Resultados */}
        {labels.length > 0 && (
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl transition-all duration-500 hover:shadow-[0_0_30px_-10px_rgba(251,188,4,0.3)]">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              <ChartBar className="w-8 h-8 inline-block mr-2 mb-1" /> Resultados del Análisis
            </h2>

            <div className="space-y-4">
              {labels.map((label, i) => {
                const percentage = (label.score * 100).toFixed(1);
                const barColor = getBarColor(label.score);
                return (
                  <div
                    key={i}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {label.description}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
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

        <Footer />
      </div>
    </main>
  );
}