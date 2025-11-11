# Google Cloud Vision API Explorer  
**Proyecto Integrador II – PoC #2 - Universidad del Valle**

Este proyecto demuestra las capacidades de **Google Cloud Vision API** a través de una interfaz web interactiva construida con **Next.js** y **Tailwind CSS**. Fue desarrollado como parte del curso **Proyecto Integrador II** de la Facultad de Ingeniería de la Universidad del Valle en el programa de Ingeniería de Sistemas.

---

## 📌 Descripción

Google Cloud Vision API permite a los desarrolladores integrar inteligencia artificial para analizar imágenes y extraer información valiosa de forma automática. Este proyecto implementa **9 modos de análisis distintos**, cada uno mostrando una funcionalidad específica del servicio:

1. **OCR (Reconocimiento Óptico de Caracteres)**  
   Extrae texto impreso o manuscrito de imágenes en múltiples idiomas.

2. **Detección de Colores Dominantes**  
   Identifica los colores principales en una imagen y sugiere nombres basados en estándares industriales (Pantone).

3. **Detección de Rostros y Emociones**  
   Localiza rostros y evalúa emociones como alegría, tristeza, ira o sorpresa.

4. **Detección de Etiquetas (Labels)**  
   Reconoce objetos, conceptos y actividades presentes en una imagen.

5. **Análisis SafeSearch**  
   Evalúa la presencia de contenido adulto, violento, provocativo o manipulado.

6. **Detección de Puntos de Referencia (Landmarks)**  
   Identifica monumentos o lugares famosos y muestra su ubicación en un mapa interactivo.

7. **Detección de Logotipos**  
   Reconoce marcas comerciales y resalta sus posiciones en la imagen mediante overlay en canvas.

8. **Detección de Objetos**  
   Localiza y etiqueta múltiples objetos dentro de una imagen con bounding boxes interactivos.

9. **Detección Web (Búsqueda Inversa)**  
   Busca imágenes similares en la web, muestra páginas que las contienen y sugiere términos relacionados.

Todas las funcionalidades incluyen:
- ✅ **Arrastrar y soltar (drag & drop)** de imágenes.
- ✅ Vista previa en tiempo real.
- ✅ Resultados visuales y tabulares.
- ✅ Soporte para modo claro/oscuro.
- ✅ Diseño responsive y moderno.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (App Router, `use client`)
- **Estilado**: [Tailwind CSS](https://tailwindcss.com/) con gradientes personalizados y animaciones
- **Iconos**: [Lucide React](https://lucide.dev/)
- **API Backend**: Google Cloud Vision API (consumida a través de rutas API de Next.js)
- **Otros**: `FormData`, `ResizeObserver`, `URL.createObjectURL`, manejo de errores robusto

---

## 🚀 Instrucciones de Uso

### Requisitos previos
- Node.js 18+
- Una cuenta de Google Cloud con la API de **Cloud Vision** habilitada
- Credenciales de autenticación (archivo `service-account.json`)

### Instalación
```bash
git clone https://github.com/JoseManuel2005/googlecloudvision-poc.git
cd googlecloudvision-poc
npm install
npm run dev