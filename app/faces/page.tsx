"use client";
import { useState, useRef, useEffect } from "react";
import { ImagePlus, Sparkles, Loader2, ScanFace } from "lucide-react";

export default function FacesPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [faces, setFaces] = useState<
    {
      faceId: number;
      joy: string;
      sorrow: string;
      anger: string;
      surprise: string;
      detectionConfidence: number;
      boundingPoly: { x?: number; y?: number }[];
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
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

  const interpretacion: Record<string, string> = {
    VERY_LIKELY: "Muy probable",
    LIKELY: "Probable",
    POSSIBLE: "Posible",
    UNLIKELY: "Poco probable",
    VERY_UNLIKELY: "Nada probable",
  };

  const colores: Record<string, string> = {
    VERY_LIKELY: "bg-green-500",
    LIKELY: "bg-green-400",
    POSSIBLE: "bg-yellow-400",
    UNLIKELY: "bg-orange-400",
    VERY_UNLIKELY: "bg-red-500",
  };

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
      setFaces([]);
    } else {
      setImage(null);
      setPreview(null);
      setFaces([]);
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
    setFaces([]);
    setImgSize({ w: 1, h: 1, naturalW: 1, naturalH: 1, offsetX: 0, offsetY: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("/api/vision/faces", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setFaces(data.faces || []);
    } catch (err) {
      console.error(err);
      setFaces([]);
    } finally {
      setLoading(false);
    }
  };

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
          <label
            htmlFor="fileInput"
            className="w-full border-2 border-dashed border-gray-400 dark:border-gray-700 rounded-2xl p-10 text-center cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center space-y-4">
              <ImagePlus className="w-10 h-10 text-yellow-500" />
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
                }}
              />
              {faces.map((face, i) => {
                const { boundingPoly } = face;
                if (!boundingPoly || boundingPoly.length < 4) return null;
                const xScale = imgSize.w / imgSize.naturalW;
                const yScale = imgSize.h / imgSize.naturalH;
                const x = (boundingPoly[0].x || 0) * xScale + imgSize.offsetX;
                const y = (boundingPoly[0].y || 0) * yScale + imgSize.offsetY;
                const w =
                  ((boundingPoly[1]?.x || 0) - (boundingPoly[0]?.x || 0)) *
                  xScale;
                const h =
                  ((boundingPoly[2]?.y || 0) - (boundingPoly[0]?.y || 0)) *
                  yScale;
                return (
                  <div
                    key={i}
                    className="absolute border-4 border-[#4285F4]/80 rounded-xl"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      width: `${w}px`,
                      height: `${h}px`,
                    }}
                  >
                    <span className="absolute -top-7 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow">
                      Rostro {face.faceId}
                    </span>
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
        {faces.length > 0 && (
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-10 rounded-3xl shadow-xl transition-all space-y-6">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              <ScanFace className="w-8 h-8 inline-block mr-2 mb-1"/> Rostros Detectados ({faces.length})
            </h2>
            {faces.map((face, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all bg-gray-50 dark:bg-gray-800/50"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Rostro {index + 1}
                </h3>
                {[
                  { icon: "😊", label: "Alegría", val: face.joy },
                  { icon: "😢", label: "Tristeza", val: face.sorrow },
                  { icon: "😠", label: "Ira", val: face.anger },
                  { icon: "😲", label: "Sorpresa", val: face.surprise },
                ].map(({ icon, label, val }, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                    <span>{interpretacion[val]}</span>
                    <span className={`w-4 h-4 rounded-full ${colores[val]}`}></span>
                  </div>
                ))}
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Confianza: {(face.detectionConfidence * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}