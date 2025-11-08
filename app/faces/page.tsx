"use client";

import { useState, useRef, useEffect } from "react";

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
  const [imgSize, setImgSize] = useState({ w: 1, h: 1, naturalW: 1, naturalH: 1 });

  // Traducción y colores
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

  // Actualiza tamaño mostrado de la imagen
  useEffect(() => {
    if (!imgRef.current) return;
    const updateSize = () => {
      const img = imgRef.current!;
      setImgSize({
        w: img.clientWidth,
        h: img.clientHeight,
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
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
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        😀 Detección de Rostros y Emociones
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
          <div className="relative mt-2 w-full">
            <img
              ref={imgRef}
              src={preview}
              alt="Vista previa"
              className="w-full h-64 object-contain rounded-lg shadow-sm border"
              onLoad={(e) => {
                const img = e.currentTarget;
                setImgSize({
                  w: img.clientWidth,
                  h: img.clientHeight,
                  naturalW: img.naturalWidth,
                  naturalH: img.naturalHeight,
                });
              }}
            />

            {/* Overlays responsivos */}
            {faces.map((face, i) => {
              const { boundingPoly } = face;
              if (!boundingPoly || boundingPoly.length < 4) return null;

              const xScale = imgSize.w / imgSize.naturalW;
              const yScale = imgSize.h / imgSize.naturalH;

              const x = (boundingPoly[0].x || 0) * xScale;
              const y = (boundingPoly[0].y || 0) * yScale;
              const w =
                ((boundingPoly[1]?.x || 0) - (boundingPoly[0]?.x || 0)) * xScale;
              const h =
                ((boundingPoly[2]?.y || 0) - (boundingPoly[1]?.y || 0)) * yScale;

              return (
                <div
                  key={i}
                  className="absolute border-4 border-blue-500 rounded-lg transition-all"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                  }}
                >
                  <span className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
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
          className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition disabled:opacity-50 w-full"
        >
          {loading ? "Analizando..." : "Analizar Imagen"}
        </button>
      </form>

      {/* Resultados */}
      {faces.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-md w-full max-w-2xl space-y-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Rostros detectados
          </h2>

          {faces.map((face, index) => (
            <div
              key={index}
              className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-700 mb-4">
                🧠 Rostro {index + 1}
              </h3>

              <div className="grid grid-cols-4 items-center text-sm font-medium text-gray-700 mb-2">
                <span>😊</span>
                <span>Alegría</span>
                <span>{interpretacion[face.joy]}</span>
                <span className={`w-4 h-4 rounded-full ${colores[face.joy]}`}></span>
              </div>

              <div className="grid grid-cols-4 items-center text-sm font-medium text-gray-700 mb-2">
                <span>😢</span>
                <span>Tristeza</span>
                <span>{interpretacion[face.sorrow]}</span>
                <span className={`w-4 h-4 rounded-full ${colores[face.sorrow]}`}></span>
              </div>

              <div className="grid grid-cols-4 items-center text-sm font-medium text-gray-700 mb-2">
                <span>😠</span>
                <span>Ira</span>
                <span>{interpretacion[face.anger]}</span>
                <span className={`w-4 h-4 rounded-full ${colores[face.anger]}`}></span>
              </div>

              <div className="grid grid-cols-4 items-center text-sm font-medium text-gray-700">
                <span>😲</span>
                <span>Sorpresa</span>
                <span>{interpretacion[face.surprise]}</span>
                <span
                  className={`w-4 h-4 rounded-full ${colores[face.surprise]}`}
                ></span>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Confianza: {(face.detectionConfidence * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

