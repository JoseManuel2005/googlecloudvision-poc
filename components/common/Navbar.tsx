"use client";
import { Eye, Menu, X, FileText, Palette, Smile, Tag, ShieldAlert, Moon, Sun, LocateIcon, Globe, ScanSearch, View, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const navLinks = [
  { href: "/ocr", label: "OCR", icon: FileText, color: "#4285F4" },
  { href: "/colors", label: "Colores", icon: Palette, color: "#EA4335" },
  { href: "/faces", label: "Rostros", icon: Smile, color: "#FBBC04" },
  { href: "/labels", label: "Etiquetas", icon: Tag, color: "#34A853" },
  { href: "/safe", label: "Contenido", icon: ShieldAlert, color: "#EA4335" },
  { href: "/landmarks", label: "Localizaciones", icon: LocateIcon, color: "#4285F4" },
  { href: "/logos", label: "Logos", icon: View, color: "#4285F4" },
  { href: "/objects", label: "Objetos", icon: ScanSearch, color: "#FBBC04" },
  { href: "/web", label: "Web", icon: Globe, color: "#34A853" }
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => pathname === path;

  // Encuentra el link activo actual
  const activeLink = navLinks.find(link => isActive(link.href));

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-950/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo with Google-inspired design */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative">
              {/* Animated gradient ring */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-[#4285F4] via-[#FBBC04] to-[#34A853] blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon container */}
              <div className="relative w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Eye className="w-6 h-6 text-[#4285F4] group-hover:text-[#EA4335] transition-colors duration-300" strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-2xl text-gray-900 dark:text-white leading-none tracking-tight">
                  POC
                </span>
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-[#4285F4]"></div>
                  <div className="w-1 h-1 rounded-full bg-[#EA4335]"></div>
                  <div className="w-1 h-1 rounded-full bg-[#FBBC04]"></div>
                  <div className="w-1 h-1 rounded-full bg-[#34A853]"></div>
                </div>
              </div>
              <span className="text-xs font-semibold bg-linear-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent">
                Google Cloud Vision
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {/* Dropdown Menu para Modos */}
            <div className="relative">
              <button
                onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
                onBlur={() => setTimeout(() => setDesktopMenuOpen(false), 200)}
                className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 group cursor-pointer"
              >
                {activeLink ? (
                  <>
                    <div 
                      className="p-1.5 rounded-lg scale-110"
                      style={{ backgroundColor: `${activeLink.color}20` }}
                    >
                      {(() => {
                        const Icon = activeLink.icon;
                        return <Icon className="w-4 h-4" style={{ color: activeLink.color }} strokeWidth={2.5} />;
                      })()}
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {activeLink.label}
                    </span>
                    <div 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                      style={{ backgroundColor: activeLink.color }}
                    ></div>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-[#4285F4]" strokeWidth={2.5} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Modos de Visión
                    </span>
                  </>
                )}
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-300 ${desktopMenuOpen ? 'rotate-180' : ''} text-gray-500`} 
                  strokeWidth={2.5} 
                />
              </button>

              {/* Dropdown Content */}
              {desktopMenuOpen && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="p-2">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setDesktopMenuOpen(false)}
                          className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group ${
                            active
                              ? "bg-gray-50 dark:bg-gray-800"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          {/* Active indicator */}
                          {active && (
                            <div 
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                              style={{ backgroundColor: link.color }}
                            ></div>
                          )}
                          
                          <div 
                            className={`p-2 rounded-lg text-gray-900 dark:text-white transition-all duration-300`}
                            style={{ 
                              backgroundColor: active ? `${link.color}20` : 'transparent'
                            }}
                          >
                            <Icon 
                              className="w-4 h-4" 
                              style={{ 
                                color: active ? link.color : 'currentColor'
                              }}
                              strokeWidth={2.5}
                            />
                          </div>
                          
                          <span 
                            className={`text-sm ${
                              active 
                                ? 'text-gray-900 dark:text-white font-semibold' 
                                : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                            }`}
                          >
                            {link.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Theme Toggle Button with Google colors */}
            <button
              onClick={toggleTheme}
              className="ml-3 relative p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group overflow-hidden cursor-pointer"
              aria-label="Toggle theme"
            >
              <div className="absolute inset-0 bg-linear-to-br from-[#4285F4]/0 via-[#FBBC04]/0 to-[#EA4335]/0 group-hover:from-[#4285F4]/10 group-hover:via-[#FBBC04]/10 group-hover:to-[#EA4335]/10 transition-all duration-300"></div>
              <div className="relative">
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                ) : (
                  <Moon className="w-5 h-5 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                )}
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" strokeWidth={2.5} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t-2 border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center gap-4 px-5 py-4 rounded-xl font-semibold transition-all duration-300 ${
                      active
                        ? ""
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                        style={{ backgroundColor: link.color }}
                      ></div>
                    )}
                    
                    <div 
                      className={`p-2 rounded-lg text-gray-900 dark:text-white transition-all duration-300`}
                      style={{ 
                        backgroundColor: active ? `${link.color}20` : 'transparent'
                      }}
                    >
                      <Icon 
                        className="w-5 h-5" 
                        style={{ 
                          color: active ? link.color : 'currentColor'
                        }}
                        strokeWidth={2.5}
                      />
                    </div>
                    
                    <span className={active ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
              
              {/* Theme Toggle Button for Mobile */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-4 px-5 py-4 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-linear-to-br from-[#4285F4]/10 to-[#FBBC04]/10">
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    <Moon className="w-5 h-5" strokeWidth={2.5} />
                  )}
                </div>
                <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Oscuro'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}