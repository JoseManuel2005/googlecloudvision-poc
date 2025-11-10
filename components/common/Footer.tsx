"use client";

export default function Footer({ colorOrder = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"] }: { colorOrder?: string[] }) {
  return (
    <footer className="mt-16 text-center">
      <div className="inline-flex flex-col items-center gap-3 px-8 py-5 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="flex items-center gap-2">
          {colorOrder.map((color, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          © {new Date().getFullYear()} PoC Vision AI - Universidad del Valle
        </span>
      </div>
    </footer>
  );
}
