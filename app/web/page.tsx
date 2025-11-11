"use client";

import { useState } from "react";
import { Globe, ImagePlus, Loader2, Sparkles, Tag, Link2, Image as ImageIcon } from "lucide-react";
import Footer from "@/components/common/Footer";

interface WebEntity {
  description: string;
  score: number;
}

interface ImageUrl {
  url: string;
}

interface PageWithImage {
  url: string;
  pageTitle: string;
}

interface BestGuess {
  label: string;
}

interface WebDetectionData {
  webEntities: WebEntity[];
  fullMatchingImages: ImageUrl[];
  partialMatchingImages: ImageUrl[];
  pagesWithMatchingImages: PageWithImage[];
  visuallySimilarImages: ImageUrl[];
  bestGuessLabels: BestGuess[];
}

export default function WebDetectionPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [data, setData] = useState<WebDetectionData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setData(null);
    } else {
      setImage(null);
      setPreview(null);
      setData(null);
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
    setData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("/api/vision/web", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center p-6 relative overflow-hidden">
      {/* Fondos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-linear-to-br from-[#4285F4]/20 to-[#1967D2]/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-32 left-20 w-80 h-80 bg-linear-to-br from-[#34A853]/20 to-[#0F9D58]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Encabezado */}
        <div className="text-center mb-14 space-y-5">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
            <Globe className="w-4 h-4 text-[#34A853]" />
            <span className="text-sm font-semibold bg-green-500 bg-clip-text text-transparent">
              Detección Web
            </span>
            <Sparkles className="w-4 h-4 text-green-500" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Búsqueda inversa de{" "}
            <span className="block bg-green-500 bg-clip-text text-transparent">
              imágenes en la web
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Descubre imágenes similares, páginas web relacionadas y entidades detectadas
            usando la potencia de Google Cloud Vision.
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(52,168,83,0.2)]"
        >
          <label
            htmlFor="fileInput"
            className="border-2 border-dashed border-gray-400 dark:border-gray-700 rounded-2xl p-10 w-full text-center cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:border-[#34A853] hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center space-y-3">
              <ImagePlus className="w-10 h-10 text-[#34A853]" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
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

          {preview && (
            <div className="mt-4 w-full max-w-md">
              <img
                src={preview}
                alt="Vista previa"
                className="w-full h-auto rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg"
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
                <Loader2 className="w-5 h-5 animate-spin" /> Buscando en la web...
              </>
            ) : (
              "Buscar en la Web"
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
        {data && (
          <div className="mt-14 space-y-8">
            {/* Mejor suposición */}
            {data.bestGuessLabels.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Tag className="w-8 h-8 text-green-500" /> Mejor Coincidencia
                </h2>
                <div className="flex flex-wrap gap-3">
                  {data.bestGuessLabels.map((guess, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full font-semibold text-lg"
                    >
                      {guess.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Entidades web */}
            {data.webEntities.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Tag className="w-8 h-8 text-green-500" /> Entidades Detectadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.webEntities.slice(0, 10).map((entity, i) => (
                    <div
                      key={i}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {entity.description}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {(entity.score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${entity.score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Páginas con imágenes coincidentes */}
            {data.pagesWithMatchingImages.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Link2 className="w-8 h-8 text-green-500" /> Páginas con esta Imagen
                </h2>
                <div className="space-y-3">
                  {data.pagesWithMatchingImages.slice(0, 10).map((page, i) => (
                    <a
                      key={i}
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 transition-all"
                    >
                      <div className="font-semibold text-green-600 dark:text-green-400 mb-1">
                        {page.pageTitle || "Sin título"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {page.url}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Imágenes visualmente similares */}
            {data.visuallySimilarImages.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <ImageIcon className="w-8 h-8 text-green-500" /> Imágenes Similares ({data.visuallySimilarImages.length})
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Haz clic en cada imagen para verla en su sitio original
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.visuallySimilarImages.slice(0, 12).map((img, i) => (
                    <div
                      key={i}
                      className="relative group overflow-hidden rounded-2xl border-2 border-gray-300 dark:border-gray-700 hover:border-green-500 transition-all bg-gray-100 dark:bg-gray-800 hover:shadow-lg"
                    >
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-40 relative"
                      >
                        <img
                          src={`/api/proxy-image?url=${encodeURIComponent(img.url)}`}
                          alt={`Similar ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const container = target.parentElement;
                            if (container) {
                              container.innerHTML = `
                                <div class="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
                                  <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                  </div>
                                  <span class="text-xs text-center text-gray-500 dark:text-gray-400">Clic para ver</span>
                                </div>
                              `;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none flex items-end p-2">
                          <span className="text-xs text-white truncate">
                            {new URL(img.url).hostname}
                          </span>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Imágenes coincidentes completas */}
            {data.fullMatchingImages.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <ImageIcon className="w-8 h-8 text-green-500" /> Coincidencias Exactas ({data.fullMatchingImages.length})
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Haz clic en cada imagen para verla en su sitio original
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.fullMatchingImages.slice(0, 8).map((img, i) => (
                    <div
                      key={i}
                      className="relative group overflow-hidden rounded-2xl border-2 border-green-500 hover:border-green-400 transition-all bg-green-50 dark:bg-green-950/20 hover:shadow-lg"
                    >
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-40 relative"
                      >
                        <img
                          src={`/api/proxy-image?url=${encodeURIComponent(img.url)}`}
                          alt={`Match ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const container = target.parentElement;
                            if (container) {
                              container.innerHTML = `
                                <div class="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
                                  <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                  </div>
                                  <span class="text-xs text-center text-green-700 dark:text-green-400 font-semibold">Clic para ver</span>
                                </div>
                              `;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none flex items-end p-2">
                          <span className="text-xs text-white truncate">
                            {new URL(img.url).hostname}
                          </span>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}