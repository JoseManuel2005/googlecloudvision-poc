"use client";

import { useState } from "react";
// @ts-ignore
import namer from "color-namer";
import { Palette, ImagePlus, Loader2, Sparkles } from "lucide-react";
import Footer from "@/components/common/Footer";

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

  const handleClear = () => {
    if (preview) {
      try {
        URL.revokeObjectURL(preview);
      } catch (e) {}
    }
    setImage(null);
    setPreview(null);
    setColors([]);
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
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center p-6 relative overflow-hidden">
      {/* Fondos decorativos tipo Google */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-16 w-96 h-96 bg-linear-to-br from-[#4285F4]/20 to-[#1967D2]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-80 h-80 bg-linear-to-br from-[#EA4335]/20 to-[#C5221F]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-linear-to-br from-[#FBBC04]/20 to-[#F9AB00]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Encabezado */}
        <div className="text-center mb-14 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-md hover:scale-105 transition-transform duration-300">
            <Palette className="w-4 h-4 text-[#EA4335]" />
            <span className="text-sm font-semibold bg-red-500 bg-clip-text text-transparent">
              Detección de Colores Dominantes
            </span>
            <Sparkles className="w-4 h-4 text-red-500" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Analiza tu imagen y descubre su{" "}
            <span className="bg-red-500 bg-clip-text text-transparent">
              paleta cromática
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Sube una imagen y deja que la IA de{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              Google Cloud Vision
            </span>{" "}
            detecte los tonos principales, porcentajes y nombres de color.
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-10 shadow-xl backdrop-blur-sm flex flex-col items-center gap-6 transition-all duration-500 hover:shadow-2xl"
        >
          <label
            htmlFor="fileInput"
            className="w-full border-2 border-dashed border-gray-400 dark:border-gray-700 rounded-2xl p-10 text-center cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center space-y-4">
              <ImagePlus className="w-10 h-10 text-red-500" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Haz clic o arrastra una imagen aquí
              </span>
            </div>
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
            className="w-full flex justify-center items-center gap-2 bg-red-600 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-white font-medium px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 disabled:opacity-50 shadow-lg cursor-pointer" >
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
        {colors.length > 0 && (
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-10 rounded-3xl shadow-xl transition-all">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              <Palette className="w-8 h-8 inline-block mr-2 mb-1"/> Colores Detectados
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {colors.map((c, i) => {
                const { r, g, b } = c.rgb;
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
                  .toString(16)
                  .slice(1)
                  .toUpperCase()}`;
                const colorName = namer(hex).pantone[0].name;
                const percentage = (c.score * 100).toFixed(1);

                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div
                      className="w-14 h-14 rounded-xl border border-gray-300 dark:border-gray-600 shadow-inner"
                      style={{ backgroundColor: `rgb(${r},${g},${b})` }}
                    ></div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {colorName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {hex} — {percentage}%
                      </p>
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
