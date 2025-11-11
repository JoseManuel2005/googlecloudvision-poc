"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapPin, ImagePlus, Loader2, Sparkles, Info } from "lucide-react";
import Footer from "@/components/common/Footer";

type BoxPts = { x: number; y: number };
type Landmark = {
  description: string;
  score: number;
  boundingPoly: { vertices: BoxPts[]; normalizedVertices: BoxPts[] };
  locations: { latitude: number | null; longitude: number | null }[];
};

type Fallback = {
  bestGuessLabel?: string;
  webEntities?: { description: string; score: number }[];
  labels?: { description: string; score: number }[];
};

export default function LandmarksPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [fallback, setFallback] = useState<Fallback | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const [imgRendered, setImgRendered] = useState<{ w: number; h: number } | null>(null);

  const top = useMemo(() => (landmarks.length ? landmarks[0] : null), [landmarks]);

  const coords = useMemo(() => {
    const loc = top?.locations?.find((l) => l.latitude != null && l.longitude != null);
    return loc ? { lat: Number(loc.latitude), lng: Number(loc.longitude) } : null;
  }, [top]);

  const percentage = useMemo(
    () => (top ? (top.score * 100).toFixed(1) : null),
    [top]
  );

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
    setLandmarks([]);
    setFallback(null);
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
      } catch {}
    }
    setImage(null);
    setPreview(null);
    setLandmarks([]);
    setFallback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("/api/vision/landmarks", { method: "POST", body: formData });
      const data = await res.json();
      setLandmarks(data.landmarks || []);
      setFallback(data.fallback || null);
    } catch (err) {
      console.error(err);
      setLandmarks([]);
      setFallback({
        bestGuessLabel: "Error de análisis",
        webEntities: [],
        labels: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const box = useMemo(() => {
    if (!top || !imgNatural || !imgRendered) return null;

    const norm = top.boundingPoly?.normalizedVertices ?? [];
    const px = top.boundingPoly?.vertices ?? [];
    let pts: BoxPts[] = [];

    if (norm.length) {
      pts = norm;
    } else if (px.length) {
      pts = px.map((v) => ({ x: (v.x || 0) / (imgNatural.w || 1), y: (v.y || 0) / (imgNatural.h || 1) }));
    } else return null;

    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const minX = Math.max(0, Math.min(...xs));
    const minY = Math.max(0, Math.min(...ys));
    const maxX = Math.min(1, Math.max(...xs));
    const maxY = Math.min(1, Math.max(...ys));

    return {
      left: minX * imgRendered.w,
      top: minY * imgRendered.h,
      width: (maxX - minX) * imgRendered.w,
      height: (maxY - minY) * imgRendered.h,
    };
  }, [top, imgNatural, imgRendered]);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const update = () => setImgRendered({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [preview]);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center p-6 relative overflow-hidden">
      {/* Fondos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-16 w-96 h-96 bg-linear-to-br from-[#4285F4]/20 to-[#1967D2]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-80 h-80 bg-linear-to-br from-[#34A853]/20 to-[#188038]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-linear-to-br from-[#FBBC04]/20 to-[#F9AB00]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Encabezado */}
        <div className="text-center mb-14 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-md hover:scale-105 transition-transform duration-300">
            <MapPin className="w-4 h-4 text-[#1a73e8]" />
            <span className="text-sm font-semibold bg-blue-600 bg-clip-text text-transparent">
              Detección de Puntos de Referencia
            </span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Identifica{" "}
            <span className="bg-blue-600 bg-clip-text text-transparent">landmarks</span>{" "}
            y su ubicación
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Sube una imagen y deja que <span className="font-semibold text-gray-900 dark:text-white">Google Cloud Vision</span> detecte el lugar, el nivel de confianza y las coordenadas.
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
                ? "border-[#1a73e8] bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-400 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <ImagePlus className="w-10 h-10 text-[#1a73e8]" />
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

          {preview && (
            <div className="mt-6 w-full">
              <img
                ref={imgRef}
                src={preview}
                alt="Vista previa"
                className="w-full h-80 object-contain rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
                  setImgRendered({ w: img.clientWidth, h: img.clientHeight });
                }}
              />
            </div>
          )}

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="submit"
              disabled={!image || loading}
              className="w-full flex justify-center items-center gap-2 bg-[#1a73e8] dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-white font-medium px-6 py-3 rounded-xl hover:bg-[#1558b0] transition-all duration-300 disabled:opacity-50 shadow-lg cursor-pointer"
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
              className="w-full flex justify-center items-center gap-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium px-6 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 shadow-sm cursor-pointer"
            >
              Limpiar
            </button>
          </div>
        </form>

        {/* Resultado SIEMPRE visible tras analizar */}
        {(landmarks.length > 0 || fallback) && (
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-10 rounded-3xl shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Imagen + bbox si hay */}
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 shadow-md">
                {preview ? (
                  <>
                    <img
                      ref={imgRef}
                      src={preview}
                      alt="Resultado"
                      className="w-full h-[520px] object-cover"
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
                        setImgRendered({ w: img.clientWidth, h: img.clientHeight });
                      }}
                    />
                    {box && (
                      <div
                        className="absolute border-[6px] border-blue-500 rounded-xl"
                        style={{
                          left: `${box.left}px`,
                          top: `${box.top}px`,
                          width: `${box.width}px`,
                          height: `${box.height}px`,
                          boxShadow: "0 0 0 2px rgba(16,185,129,0.25) inset",
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="h-[520px] flex items-center justify-center text-gray-500">Sube una imagen</div>
                )}
              </div>

              {/* Tarjeta derecha */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md">
                {top ? (
                  <>
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                      <h2 className="text-xl font-semibold text-[#1a73e8]">{top.description}</h2>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{percentage}%</div>
                    </div>
                    <div className="p-3">
                      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                        {coords ? (
                          <iframe
                            title="map"
                            src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`}
                            className="w-full h-64"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-64 flex items-center justify-center text-gray-500">Sin coordenadas</div>
                        )}
                      </div>
                      {coords && (
                        <div className="mt-3 text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Location:</span> {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Estado SIN landmark: mostramos fallback
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-amber-600">
                      <Info className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">No se encontraron puntos de referencia</h2>
                    </div>
                    {fallback?.bestGuessLabel && (
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        Sugerencia: <span className="font-semibold">{fallback.bestGuessLabel}</span>
                      </p>
                    )}
                    {fallback?.webEntities && fallback.webEntities.length > 0 && (
                      <>
                        <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">Entidades web relacionadas</h3>
                        <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                          {fallback.webEntities.slice(0, 6).map((e, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{e.description}</span>
                              <span className="text-gray-500">{(e.score * 100).toFixed(0)}%</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {fallback?.labels && fallback.labels.length > 0 && (
                      <>
                        <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">Etiquetas</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {fallback.labels.map((l, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              {l.description} · {(l.score * 100).toFixed(0)}%
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    <p className="mt-4 text-xs text-gray-500">
                      Tip: usa fotos frontales del edificio/monumento y evita compresión excesiva. La detección de landmarks solo cubre lugares
                      muy conocidos; si no hay match, mostramos la mejor conjetura.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}