"use client";

import { useState, useRef, useEffect } from "react";
import { Boxes, ImagePlus, Loader2, Sparkles, ChartBar } from "lucide-react";
import Footer from "@/components/common/Footer";

export default function ObjectsPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [objects, setObjects] = useState<
    { name: string; score: number; vertices: { x: number; y: number }[] }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [pinnedLabels, setPinnedLabels] = useState<Set<number>>(new Set());
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imgSize, setImgSize] = useState({
    w: 1,
    h: 1,
    naturalW: 1,
    naturalH: 1,
    offsetX: 0,
    offsetY: 0,
  });

  // --- Actualiza dimensiones reales renderizadas de la imagen ---
  useEffect(() => {
    if (!imgRef.current || !containerRef.current) return;
    const updateSize = () => {
      const img = imgRef.current!;
      const container = containerRef.current!;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = container.clientWidth / container.clientHeight;

      let renderedWidth, renderedHeight, offsetX = 0, offsetY = 0;

      if (imgAspect > containerAspect) {
        renderedWidth = container.clientWidth;
        renderedHeight = container.clientWidth / imgAspect;
        offsetY = (container.clientHeight - renderedHeight) / 2;
      } else {
        renderedHeight = container.clientHeight;
        renderedWidth = container.clientHeight * imgAspect;
        offsetX = (container.clientWidth - renderedWidth) / 2;
      }

      setImgSize({
        w: renderedWidth,
        h: renderedHeight,
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
        offsetX,
        offsetY,
      });
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [preview]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setObjects([]);
    } else {
      setImage(null);
      setPreview(null);
      setObjects([]);
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
    setObjects([]);
    setPinnedLabels(new Set());
    setImgSize({ w: 1, h: 1, naturalW: 1, naturalH: 1, offsetX: 0, offsetY: 0 });
  };

  const togglePinLabel = (index: number) => {
    setPinnedLabels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("/api/vision/objects", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setObjects(data.objects || []);
      setPinnedLabels(new Set());
    } catch (err) {
      console.error(err);
      setObjects([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Función para obtener color del recuadro según score ---
  const getBoxColor = (score: number) => {
    if (score >= 0.85) return "border-green-500";
    if (score >= 0.6) return "border-yellow-400";
    if (score >= 0.3) return "border-orange-400";
    return "border-red-500";
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center p-6 relative overflow-hidden">
      {/* Fondos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-linear-to-br from-[#4285F4]/20 to-[#1967D2]/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-32 left-20 w-80 h-80 bg-linear-to-br from-[#EA4335]/20 to-[#C5221F]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Encabezado */}
        <div className="text-center mb-14 space-y-5">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
            <Boxes className="w-4 h-4 text-[#EA4335]" />
            <span className="text-sm font-semibold bg-red-500 bg-clip-text text-transparent">
              Detección de Objetos
            </span>
            <Sparkles className="w-4 h-4 text-red-500" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Localización de{" "}
            <span className="block bg-red-500 bg-clip-text text-transparent">
              objetos en imágenes
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Sube una imagen y deja que la IA de Google detecte los objetos
            presentes junto con su ubicación y nivel de confianza.
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(234,67,53,0.2)]"
        >
          <label
            htmlFor="fileInput"
            className="border-2 border-dashed border-gray-400 dark:border-gray-700 rounded-2xl p-10 w-full text-center cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:border-[#EA4335] hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center space-y-3">
              <ImagePlus className="w-10 h-10 text-[#EA4335]" />
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

          {/* Vista previa con recuadros precisos */}
          {preview && (
            <div ref={containerRef} className="relative mt-4 w-full h-80">
              <img
                ref={imgRef}
                src={preview}
                alt="Vista previa"
                className="absolute inset-0 w-full h-full object-contain rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const container = containerRef.current!;
                  const imgAspect = img.naturalWidth / img.naturalHeight;
                  const containerAspect =
                    container.clientWidth / container.clientHeight;

                  let renderedWidth,
                    renderedHeight,
                    offsetX = 0,
                    offsetY = 0;

                  if (imgAspect > containerAspect) {
                    renderedWidth = container.clientWidth;
                    renderedHeight = container.clientWidth / imgAspect;
                    offsetY = (container.clientHeight - renderedHeight) / 2;
                  } else {
                    renderedHeight = container.clientHeight;
                    renderedWidth = container.clientHeight * imgAspect;
                    offsetX = (container.clientWidth - renderedWidth) / 2;
                  }

                  setImgSize({
                    w: renderedWidth,
                    h: renderedHeight,
                    naturalW: img.naturalWidth,
                    naturalH: img.naturalHeight,
                    offsetX,
                    offsetY,
                  });
                }}
              />

              {objects.map((obj, i) => {
                if (!obj.vertices || obj.vertices.length < 4) return null;

                // Las coordenadas vienen normalizadas (0-1), las convertimos a píxeles de la imagen renderizada
                const x = (obj.vertices[0].x || 0) * imgSize.w + imgSize.offsetX;
                const y = (obj.vertices[0].y || 0) * imgSize.h + imgSize.offsetY;
                const w = ((obj.vertices[1]?.x || 0) - (obj.vertices[0]?.x || 0)) * imgSize.w;
                const h = ((obj.vertices[2]?.y || 0) - (obj.vertices[0]?.y || 0)) * imgSize.h;

                return (
                  <div
                    key={i}
                    className={`absolute ${getBoxColor(
                      obj.score
                    )} border-2 rounded-md cursor-pointer transition-all duration-200 hover:border-4 group`}
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      width: `${w}px`,
                      height: `${h}px`,
                    }}
                    onClick={() => togglePinLabel(i)}
                  >
                    <span 
                      className={`absolute -top-6 left-0 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow transition-opacity duration-200 ${
                        pinnedLabels.has(i) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {obj.name} ({(obj.score * 100).toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
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
        {objects.length > 0 && (
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl transition-all duration-500 hover:shadow-[0_0_30px_-10px_rgba(234,67,53,0.3)]">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              <ChartBar className="w-8 h-8 inline-block mr-2 mb-1" /> Objetos
              Detectados
            </h2>

            <div className="space-y-4">
              {objects.map((obj, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {obj.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {(obj.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[#EA4335]"
                      style={{ width: `${obj.score * 100}%` }}
                    ></div>
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
