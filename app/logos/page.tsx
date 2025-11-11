"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Footer from "@/components/common/Footer";
import { BadgePercent, ImagePlus, Loader2, Scan, Sparkles, ChartBar } from "lucide-react";

type Vertex = { x: number; y: number };
type NVertex = { x: number; y: number };
type LogoResult = {
  description: string;
  score: number;
  boundingPoly: {
    vertices: Vertex[];
    normalizedVertices: NVertex[];
  };
};

export default function LogosPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [logos, setLogos] = useState<LogoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setLogos([]);
    } else {
      handleClear();
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
      } catch {}
    }
    setImage(null);
    setPreview(null);
    setLogos([]);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("file", image);

    try {
      const res = await fetch("/api/vision/logos", { method: "POST", body: fd });
      const data = await res.json();
      setLogos(data.logos || []);
    } catch (err) {
      console.error(err);
      setLogos([]);
    } finally {
      setLoading(false);
    }
  };

  const barColor = (score: number) => {
    if (score >= 0.85) return "bg-[#34A853]";
    if (score >= 0.6) return "bg-[#FBBC04]";
    if (score >= 0.3) return "bg-[#EA4335]";
    return "bg-red-500";
  };

  // === FIX: compensar object-contain + centrado + DPR ===
  const drawBoxes = () => {
    const imgEl = imgRef.current;
    const cvs = canvasRef.current;
    if (!imgEl || !cvs) return;

    const rect = imgEl.getBoundingClientRect();
    const cssW = rect.width;
    const cssH = rect.height;

    const dpr = window.devicePixelRatio || 1;
    cvs.style.width = `${cssW}px`;
    cvs.style.height = `${cssH}px`;
    cvs.width = Math.round(cssW * dpr);
    cvs.height = Math.round(cssH * dpr);

    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const natW = imgEl.naturalWidth || cssW;
    const natH = imgEl.naturalHeight || cssH;

    const scale = Math.min(cssW / natW, cssH / natH);
    const renderW = natW * scale;
    const renderH = natH * scale;

    const offsetX = (cssW - renderW) / 2;
    const offsetY = (cssH - renderH) / 2;

    const mapPoint = (x: number, y: number, normalized = false) => {
      if (normalized) {
        return { x: offsetX + x * renderW, y: offsetY + y * renderH };
      }
      return { x: offsetX + x * scale, y: offsetY + y * scale };
    };

    logos.forEach((logo) => {
      let points: { x: number; y: number }[] = [];

      if (logo.boundingPoly?.normalizedVertices?.length) {
        points = logo.boundingPoly.normalizedVertices.map((p) =>
          mapPoint(p.x ?? 0, p.y ?? 0, true)
        );
      } else if (logo.boundingPoly?.vertices?.length) {
        points = logo.boundingPoly.vertices.map((p) =>
          mapPoint(p.x ?? 0, p.y ?? 0, false)
        );
      }

      if (points.length < 3) return;

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(66,133,244,0.95)";
      ctx.fillStyle = "rgba(66,133,244,0.12)";

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();

      const label = `${logo.description || "Logo"} • ${(logo.score * 100).toFixed(1)}%`;
      ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      const paddingX = 6;
      const textW = ctx.measureText(label).width;

      const minX = Math.min(...points.map((p) => p.x));
      const minY = Math.min(...points.map((p) => p.y));
      const boxX = Math.max(0, minX);
      const boxY = Math.max(0, minY - 22);

      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(boxX, boxY, textW + paddingX * 2, 20);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, boxX + paddingX, boxY + 14);
    });
  };

  useEffect(() => {
    drawBoxes();
  }, [logos, preview]);

  const onImgLoad = () => drawBoxes();

  const visibleLogos = useMemo(() => logos.slice(0, 50), [logos]);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center p-6 relative overflow-hidden">
      {/* Fondos decorativos estilo Google */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-16 w-96 h-96 bg-linear-to-br from-[#4285F4]/20 to-[#1967D2]/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-24 left-16 w-80 h-80 bg-linear-to-br from-[#EA4335]/20 to-[#C5221F]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.9s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Encabezado */}
        <div className="text-center mb-14 space-y-5">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
            <BadgePercent className="w-4 h-4 text-[#4285F4]" />
            <span className="text-sm font-semibold bg-blue-500 bg-clip-text text-transparent">
              Detección de Logotipos
            </span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Encuentra <span className="bg-blue-500 bg-clip-text text-transparent">marcas y logotipos</span>{" "}
            en tus imágenes
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Carga una imagen y resaltaremos los logotipos detectados con su nivel de confianza.
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
                ? "border-[#4285F4] bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-400 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-[#4285F4] hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <ImagePlus className="w-10 h-10 text-[#4285F4]" />
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

          {/* Vista previa con overlay */}
          {preview && (
            <div className="relative mt-4 w-full">
              <img
                ref={imgRef}
                src={preview}
                alt="Vista previa"
                onLoad={onImgLoad}
                className="block w-full h-80 object-contain rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900"
              />
              <canvas
                ref={canvasRef}
                className="pointer-events-none absolute inset-0 w-full h-80"
                style={{ mixBlendMode: "normal" }}
              />
              <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-full">
                <Scan className="w-4 h-4" />
                <span>Logos detectados: {logos.length}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!image || loading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 shadow-lg cursor-pointer"
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
        {visibleLogos.length > 0 && (
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl transition-all duration-500 hover:shadow-[0_0_30px_-10px_rgba(66,133,244,0.3)]">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              <ChartBar className="w-8 h-8 inline-block mr-2 mb-1" /> Resultados del Análisis
            </h2>

            <div className="space-y-4">
              {visibleLogos.map((logo, i) => {
                const pct = (logo.score * 100).toFixed(1);
                return (
                  <div
                    key={`${logo.description}-${i}`}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {logo.description || "Logo"}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${barColor(logo.score)}`}
                        style={{ width: `${logo.score * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {logos.length > visibleLogos.length && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Mostrando {visibleLogos.length} de {logos.length} resultados.
              </p>
            )}
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}