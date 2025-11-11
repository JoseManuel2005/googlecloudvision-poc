"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ImagePlus, Sparkles, Loader2, ScanFace, Info } from "lucide-react";

type Likelihood = "VERY_LIKELY" | "LIKELY" | "POSSIBLE" | "UNLIKELY" | "VERY_UNLIKELY";
type Vertex = { x?: number; y?: number };

type FaceResult = {
  faceId: number;
  joy: Likelihood;
  sorrow: Likelihood;
  anger: Likelihood;
  surprise: Likelihood;
  detectionConfidence: number; // 0..1
  // Puede venir en pixeles (vertices) o normalizado (normalizedVertices 0..1)
  boundingPoly: Vertex[];
  normalizedBoundingPoly?: Vertex[]; // opcional si tu API la manda
};

export default function FacesPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [faces, setFaces] = useState<FaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imgSize, setImgSize] = useState({
    w: 1,
    h: 1,
    naturalW: 1,
    naturalH: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);

  const interpretacion: Record<Likelihood, string> = {
    VERY_LIKELY: "Muy probable",
    LIKELY: "Probable",
    POSSIBLE: "Posible",
    UNLIKELY: "Poco probable",
    VERY_UNLIKELY: "Nada probable",
  };

  const colores: Record<Likelihood, string> = {
    VERY_LIKELY: "bg-green-500",
    LIKELY: "bg-green-400",
    POSSIBLE: "bg-yellow-400",
    UNLIKELY: "bg-orange-400",
    VERY_UNLIKELY: "bg-red-500",
  };

  // === Utils para caja en coordenadas naturales y renderizadas ===
  const getNatBox = useCallback(
    (f: FaceResult) => {
      const hasPix = f.boundingPoly && f.boundingPoly.length >= 4 && (f.boundingPoly[0].x ?? null) !== null;
      const w = imgSize.naturalW;
      const h = imgSize.naturalH;

      if (hasPix) {
        const x0 = f.boundingPoly[0].x || 0;
        const y0 = f.boundingPoly[0].y || 0;
        const x1 = f.boundingPoly[1]?.x || x0;
        const y2 = f.boundingPoly[2]?.y || y0;
        return {
          x: clamp(x0, 0, w),
          y: clamp(y0, 0, h),
          width: clamp(x1 - x0, 1, w),
          height: clamp(y2 - y0, 1, h),
        };
      }
      const nv = (f.normalizedBoundingPoly && f.normalizedBoundingPoly.length >= 4)
        ? f.normalizedBoundingPoly
        : (f.boundingPoly || []);
      const x0n = nv[0]?.x ?? 0;
      const y0n = nv[0]?.y ?? 0;
      const x1n = nv[1]?.x ?? x0n;
      const y2n = nv[2]?.y ?? y0n;
      return {
        x: clamp(x0n * w, 0, w),
        y: clamp(y0n * h, 0, h),
        width: clamp((x1n - x0n) * w, 1, w),
        height: clamp((y2n - y0n) * h, 1, h),
      };
    },
    [imgSize.naturalW, imgSize.naturalH]
  );

  const getRenderBox = useCallback(
    (f: FaceResult) => {
      const nat = getNatBox(f);
      const xScale = imgSize.w / imgSize.naturalW;
      const yScale = imgSize.h / imgSize.naturalH;
      return {
        x: nat.x * xScale + imgSize.offsetX,
        y: nat.y * yScale + imgSize.offsetY,
        width: nat.width * xScale,
        height: nat.height * yScale,
      };
    },
    [getNatBox, imgSize]
  );

  function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }

  // === Resize/medidas de la imagen renderizada ===
  useEffect(() => {
    if (!imgRef.current || !containerRef.current) return;
    const updateSize = () => {
      const img = imgRef.current!;
      const container = containerRef.current!;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = container.clientWidth / container.clientHeight;

      let renderedWidth: number, renderedHeight: number, offsetX = 0, offsetY = 0;

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
    observer.observe(containerRef.current);
    if (imgRef.current.complete) updateSize();
    return () => observer.disconnect();
  }, [preview]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setFaces([]);
      setThumbs([]);
      setActiveIndex(null);
    } else {
      setImage(null);
      setPreview(null);
      setFaces([]);
      setThumbs([]);
      setActiveIndex(null);
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
  const onDragLeave = () => setIsDragging(false);
  const onClickUpload = () => fileInputRef.current?.click();

  const handleClear = () => {
    if (preview) {
      try { URL.revokeObjectURL(preview); } catch {}
    }
    thumbs.forEach((t) => { try { URL.revokeObjectURL(t); } catch {} });
    setImage(null);
    setPreview(null);
    setFaces([]);
    setThumbs([]);
    setActiveIndex(null);
    setImgSize({ w: 1, h: 1, naturalW: 1, naturalH: 1, offsetX: 0, offsetY: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("/api/vision/faces", { method: "POST", body: formData });
      const data = await res.json();
      const arr: FaceResult[] = (data.faces || []).map((f: Partial<FaceResult> & { normalizedVertices?: Vertex[] }, idx: number) => ({
        faceId: f.faceId ?? idx + 1,
        joy: f.joy,
        sorrow: f.sorrow,
        anger: f.anger,
        surprise: f.surprise,
        detectionConfidence: f.detectionConfidence ?? 0,
        boundingPoly: f.boundingPoly ?? [],
        normalizedBoundingPoly: f.normalizedBoundingPoly ?? f.normalizedVertices ?? undefined,
      }));
      setFaces(arr);
    } catch (err) {
      console.error(err);
      setFaces([]);
    } finally {
      setLoading(false);
    }
  };

  // === Generar thumbnails por rostro (a partir de la imagen original en tamaño natural) ===
  useEffect(() => {
    if (!preview || faces.length === 0 || imgSize.naturalW <= 1 || imgSize.naturalH <= 1) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const urls: string[] = [];
      faces.forEach((f) => {
        const { x, y, width, height } = getNatBox(f);
        const c = document.createElement("canvas");
        const size = 128; // cuadrado de preview
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d")!;
        // cubrir: escala manteniendo proporción para llenar el cuadrado (center-crop)
        const scale = Math.max(size / width, size / height);
        const drawW = width * scale;
        const drawH = height * scale;
        const dx = (size - drawW) / 2;
        const dy = (size - drawH) / 2;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, x, y, width, height, dx, dy, drawW, drawH);
        urls.push(c.toDataURL("image/jpeg", 0.9));
      });
      setThumbs((prev) => {
        prev.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
        return urls;
      });
    };
    img.src = preview;
    // cleanup no necesario (dataURL)
  }, [preview, faces, getNatBox, imgSize.naturalW, imgSize.naturalH]);

  // === Mapeo de emociones para visual ===
  const emotions = useMemo(
    () => [
      { key: "joy" as const, label: "Alegría", icon: "😊" },
      { key: "sorrow" as const, label: "Tristeza", icon: "😢" },
      { key: "anger" as const, label: "Ira", icon: "😠" },
      { key: "surprise" as const, label: "Sorpresa", icon: "😲" },
    ],
    []
  );

  // Ordena tarjetas por confianza descendente
  const facesSorted = useMemo(
    () => [...faces].sort((a, b) => (b.detectionConfidence ?? 0) - (a.detectionConfidence ?? 0)),
    [faces]
  );

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center p-6 relative overflow-hidden">
      {/* Fondos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-16 w-96 h-96 bg-linear-to-br from-[#4285F4]/20 to-[#1967D2]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-80 h-80 bg-linear-to-br from-[#EA4335]/20 to-[#C5221F]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Encabezado */}
        <div className="text-center mb-14 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-md">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold bg-yellow-500 bg-clip-text text-transparent">
              Análisis Facial
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Detección de{" "}
            <span className="bg-yellow-500 bg-clip-text text-transparent">
              Rostros y Emociones
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Carga una imagen para identificar rostros y emociones detectadas con{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              Google Cloud Vision
            </span>
            .
          </p>
        </div>

        {/* Formulario */}
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
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                : "border-gray-400 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <ImagePlus className="w-10 h-10 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {isDragging ? "¡Suelta la imagen aquí!" : "Haz clic o arrastra una imagen aquí"}
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

          {/* Vista previa con bounding boxes */}
          {preview && (
            <div ref={containerRef} className="relative mt-6 w-full h-80">
              <img
                ref={imgRef}
                src={preview}
                alt="Vista previa"
                className="absolute inset-0 w-full h-full object-contain rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const container = containerRef.current!;
                  const imgAspect = img.naturalWidth / img.naturalHeight;
                  const containerAspect = container.clientWidth / container.clientHeight;

                  let renderedWidth: number, renderedHeight: number, offsetX = 0, offsetY = 0;
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

              {/* Overlays */}
              {faces.map((face, i) => {
                const box = getRenderBox(face);
                const active = activeIndex === i;
                return (
                  <div
                    key={i}
                    className={`absolute rounded-xl transition-all ${
                      active ? "ring-4 ring-yellow-400" : "ring-4 ring-[#4285F4]/70"
                    }`}
                    style={{
                      left: `${box.x}px`,
                      top: `${box.y}px`,
                      width: `${box.width}px`,
                      height: `${box.height}px`,
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex((prev) => (prev === i ? null : prev))}
                  >
                    <div
                      className={`absolute -top-7 left-0 px-2 py-1 rounded-md shadow text-xs text-white ${
                        active ? "bg-yellow-500" : "bg-blue-600"
                      }`}
                    >
                      Rostro {face.faceId} · {(face.detectionConfidence * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="submit"
            disabled={!image || loading}
            className="w-full flex justify-center items-center gap-2 bg-yellow-600 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 text-white font-medium px-6 py-3 rounded-xl hover:bg-yellow-700 transition-all duration-300 disabled:opacity-50 shadow-lg cursor-pointer"
          >
            {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Analizando...</>) : "Analizar Imagen"}
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

        {/* Resultados mejorados */}
        {faces.length > 0 && (
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl transition-all space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                <ScanFace className="w-8 h-8 inline-block mr-2 mb-1" />
                Rostros Detectados ({faces.length})
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Info className="w-4 h-4" />
                Pasa el mouse por una tarjeta para resaltar su recuadro. Click fija la selección.
              </div>
            </div>

            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {facesSorted.map((face, sortedIdx) => {
                // recuperar índice real en faces para sincronizar highlight
                const i = faces.findIndex((f) => f.faceId === face.faceId);
                const conf = Math.round((face.detectionConfidence ?? 0) * 100);
                const thumb = thumbs[i];

                // emoción más probable (para una etiqueta rápida)
                const likelihoodRank: Record<Likelihood, number> = {
                  VERY_LIKELY: 4,
                  LIKELY: 3,
                  POSSIBLE: 2,
                  UNLIKELY: 1,
                  VERY_UNLIKELY: 0,
                };
                const topEmotion = emotions
                  .map((e) => ({ ...e, rank: likelihoodRank[face[e.key]] }))
                  .sort((a, b) => b.rank - a.rank)[0];

                const cardActive = activeIndex === i;

                return (
                  <button
                    key={sortedIdx}
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex((prev) => (prev === i ? null : prev))}
                    onClick={() => setActiveIndex((prev) => (prev === i ? null : i))}
                    className={`text-left border rounded-2xl p-4 bg-gray-50/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all relative group ${
                      cardActive ? "ring-2 ring-yellow-400" : ""
                    }`}
                  >
                    {/* Cabecera con miniatura + etiqueta rápida */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700">
                        {thumb ? (
                          <img src={thumb} alt={`Rostro ${face.faceId}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full grid place-content-center text-xs text-gray-500">Sin preview</div>
                        )}
                        <div
                          className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full border-2 border-white dark:border-gray-900"
                          style={{
                            background: `conic-gradient(#eab308 ${conf * 3.6}deg, #e5e7eb 0deg)`, // anillo % (amarillo)
                          }}
                          title={`Confianza ${conf}%`}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Rostro #{face.faceId}</div>
                        <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {topEmotion?.icon} {topEmotion?.label}
                          <span className={`ml-2 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full text-white ${colores[face[topEmotion.key]]}`}>
                            {interpretacion[face[topEmotion.key]]}
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-yellow-500"
                            style={{ width: `${conf}%` }}
                            title={`Confianza de detección: ${conf}%`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Likelihoods en filas compactas */}
                    <div className="mt-4 space-y-2">
                      {emotions.map(({ key, label, icon }) => {
                        const val = face[key];
                        return (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <span className="w-5 text-center">{icon}</span>
                              <span>{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{interpretacion[val]}</span>
                              <span className={`w-3 h-3 rounded-full ${colores[val]}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
