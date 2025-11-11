"use client";
import { FileText, Palette, Smile, Tag, ShieldAlert, Sparkles, ArrowRight, LocateIcon, ScanSearch, Globe, View } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const options = [
    {
      title: "OCR (Texto)",
      description: "Extrae texto de imágenes mediante detección automática.",
      link: "/ocr",
      icon: FileText,
      color: "blue",
      gradient: "from-[#4285F4] to-[#1967D2]",
      bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      hoverShadow: "hover:shadow-blue-200 dark:hover:shadow-blue-900/50",
    },
    {
      title: "Colores Dominantes",
      description: "Analiza los principales colores presentes en la imagen.",
      link: "/colors",
      icon: Palette,
      color: "red",
      gradient: "from-[#EA4335] to-[#C5221F]",
      bgGradient: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      hoverShadow: "hover:shadow-red-200 dark:hover:shadow-red-900/50",
    },
    {
      title: "Rostros y Emociones",
      description: "Detecta rostros y emociones básicas en la imagen.",
      link: "/faces",
      icon: Smile,
      color: "yellow",
      gradient: "from-[#FBBC04] to-[#F9AB00]",
      bgGradient: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      hoverShadow: "hover:shadow-yellow-200 dark:hover:shadow-yellow-900/50",
    },
    {
      title: "Etiquetas y Objetos",
      description: "Identifica objetos o conceptos reconocibles en la imagen.",
      link: "/labels",
      icon: Tag,
      color: "green",
      gradient: "from-[#34A853] to-[#188038]",
      bgGradient: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      hoverShadow: "hover:shadow-green-200 dark:hover:shadow-green-900/50",
    },
    {
      title: "Contenido Inapropiado",
      description: "Evalúa si la imagen contiene contenido sensible o explícito.",
      link: "/safe",
      icon: ShieldAlert,
      color: "red",
      gradient: "from-[#EA4335] to-[#C5221F]",
      bgGradient: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      hoverShadow: "hover:shadow-red-200 dark:hover:shadow-red-900/50",
    },
    {
      title: "Detección de Localizaciones",
      description: "Identifica puntos de referencia y localizaciones famosas en la imagen.",
      link: "/landmarks",
      icon: LocateIcon,
      color: "blue",
      gradient: "from-[#4285F4] to-[#1967D2]",
      bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      hoverShadow: "hover:shadow-blue-200 dark:hover:shadow-blue-900/50",
    },
    {
      title: "Detección de Logotipos",
      description: "Reconoce logotipos de marcas conocidas en la imagen.",
      link: "/logos",
      icon: View,
      color: "blue",
      gradient: "from-[#4285F4] to-[#1967D2]",
      bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      hoverShadow: "hover:shadow-blue-200 dark:hover:shadow-blue-900/50",
    },
    {
      title: "Detección de Objetos",
      description: "Identifica y localiza objetos específicos dentro de la imagen.",
      link: "/objects",
      icon: ScanSearch,
      color: "yellow",
      gradient: "from-[#FBBC04] to-[#F9AB00]",
      bgGradient: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      hoverShadow: "hover:shadow-yellow-200 dark:hover:shadow-yellow-900/50",
    },
    {
      title: "Detección Web",
      description: "Encuentra información relacionada en la web sobre la imagen.",
      link: "/web",
      icon: Globe,
      color: "green",
      gradient: "from-[#34A853] to-[#188038]",
      bgGradient: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      hoverShadow: "hover:shadow-green-200 dark:hover:shadow-green-900/50",
    }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Google-colored background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-linear-to-br from-[#4285F4]/20 to-[#1967D2]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-80 h-80 bg-linear-to-br from-[#EA4335]/20 to-[#C5221F]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-linear-to-br from-[#FBBC04]/20 to-[#F9AB00]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-linear-to-br from-[#34A853]/20 to-[#188038]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 mb-6 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 hover:scale-105 transition-transform duration-300">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[#4285F4] animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-[#EA4335] animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 rounded-full bg-[#FBBC04] animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <div className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" style={{animationDelay: '0.6s'}}></div>
            </div>
            <span className="text-sm font-semibold bg-linear-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent">
              Powered by Google Cloud Vision AI
            </span>
            <Sparkles className="w-4 h-4 text-[#FBBC04]" />
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
            Análisis de Imágenes
            <span className="block mt-3">
              <span className="bg-linear-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent">
                con Inteligencia Artificial
              </span>
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Descubre el poder del análisis visual automático con las herramientas de <span className="font-semibold text-gray-900 dark:text-white">Google Cloud</span>
          </p>

          {/* Google-style decoration */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-16 h-1 rounded-full bg-[#4285F4]"></div>
            <div className="w-16 h-1 rounded-full bg-[#EA4335]"></div>
            <div className="w-16 h-1 rounded-full bg-[#FBBC04]"></div>
            <div className="w-16 h-1 rounded-full bg-[#34A853]"></div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <Link
                key={opt.title}
                href={opt.link}
                className={`group relative bg-white dark:bg-gray-900 rounded-3xl p-8 flex flex-col transition-all duration-500 hover:shadow-2xl ${opt.hoverShadow} hover:-translate-y-3 border-2 ${opt.borderColor} overflow-hidden`}
              >
                {/* Background gradient effect */}
                <div className={`absolute inset-0 ${opt.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Container with Google colors */}
                  <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${opt.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:translate-x-1 transition-transform duration-300">
                    {opt.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {opt.description}
                  </p>

                  {/* Action button */}
                  <div className={`flex items-center gap-2 font-semibold text-sm bg-linear-to-r ${opt.gradient} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                    <span>Explorar ahora</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" style={{color: 'currentColor'}} />
                  </div>
                </div>

                {/* Decorative corner element */}
                <div className={`absolute -top-8 -right-8 w-24 h-24 bg-linear-to-br ${opt.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500`}></div>
              </Link>
            );
          })}
        </div>

        {/* Footer with Google-style branding */}
        <footer className="text-center">
          <div className="inline-flex flex-col items-center gap-3 px-8 py-5 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#EA4335]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#FBBC04]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              © {new Date().getFullYear()} PoC Vision AI - Universidad del Valle
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}