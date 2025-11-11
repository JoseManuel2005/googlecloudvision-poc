"use client";

import { useState, useRef, useCallback } from "react";
import { ShieldAlert, ImagePlus, Loader2, Sparkles, Ban } from "lucide-react";
import Footer from "@/components/common/Footer";

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
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const interpretacion: Record<string, string> = {
    VERY_LIKELY: "Muy probable",
    LIKELY: "Probable",
    POSSIBLE: "Posible",
    UNLIKELY: "Poco probable",
    VERY_UNLIKELY: "Nada probable",
  };

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
    setResult(null);
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
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center p-6 relative overflow-hidden">
      {/* Fondos tipo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-16 w-96 h-96 bg-linear-to-br from-[#EA4335]/20 to-[#C5221F]/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-32 left-16 w-80 h-80 bg-linear-to-br from-[#FBBC04]/20 to-[#F9AB00]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.2s" }}
        ></div>
        <div
          className="absolute top-1/3 left-1/3 w-72 h-72 bg-linear-to-br from-[#4285F4]/20 to-[#34A853]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Encabezado */}
        <div className="text-center mb-14 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-md hover:scale-105 transition-transform duration-300">
            <ShieldAlert className="w-4 h-4 text-[#EA4335]" />
            <span className="text-sm font-semibold bg-red-500 bg-clip-text text-transparent">
              Análisis de Contenido Inapropiado
            </span>
            <Sparkles className="w-4 h-4 text-red-500" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Detecta{" "}
            <span className="bg-red-500 bg-clip-text text-transparent">
              contenido sensible
            </span>{" "}
            en tus imágenes
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            La IA evalúa si una imagen contiene material adulto, violento,
            provocativo o manipulado, usando{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              Google Cloud Vision.
            </span>
          </p>
        </div>

        {/* Formulario con área de arrastrar y soltar */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-10 shadow-xl backdrop-blur-sm flex flex-col items-center gap-6 transition-all duration-500 hover:shadow-2xl"
        >
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={onClickUpload}
            className={`w-full border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : "border-gray-400 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <ImagePlus className="w-10 h-10 text-[#EA4335]" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
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
            <div className="mt-6 w-full">
              <img
                src={preview}
                alt="Vista previa"
                className="w-full h-80 object-contain rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!image || loading}
            className="w-full flex justify-center items-center gap-2 bg-red-600 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-white font-medium px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 disabled:opacity-50 shadow-lg cursor-pointer"
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
        {result && (
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-10 rounded-3xl shadow-xl transition-all">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              <Ban className="w-8 h-8 inline-block mr-2 mb-1" /> Resultados del análisis
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Adulto", icon: "🔞", value: result.adult },
                { label: "Violencia", icon: "💥", value: result.violence },
                { label: "Provocativo", icon: "💃", value: result.racy },
                { label: "Médico", icon: "🏥", value: result.medical },
                { label: "Manipulado", icon: "🤡", value: result.spoof },
              ].map(({ label, icon, value }, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {interpretacion[value || ""] || "No detectado"}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full ${
                        colores[value || ""] || "bg-gray-300"
                      }`}
                    ></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}