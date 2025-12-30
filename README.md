# 🧼 HIGINEX

<div align="center">

**Plataforma B2B moderna para la distribución mayorista de productos de higiene y cuidado personal**

[![Angular](https://img.shields.io/badge/Angular-21.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10.12-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

[Características](#-características-principales) • [Instalación](#-instalación) • [Uso](#-uso)

</div>

---

## 📋 Tabla de Contenido

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura de Directorios](#-estructura-de-directorios)
- [Scripts Disponibles](#-scripts-disponibles)
- [Roadmap](#-roadmap)
- [Autor](#-autor)

---

## 🎯 Descripción General

**HIGINEX** es una aplicación web empresarial B2B (Business-to-Business) diseñada para facilitar la gestión y venta mayorista de productos de higiene y cuidado personal. La plataforma permite a distribuidores autorizados explorar catálogos, realizar pedidos al por mayor, consultar estadísticas de ventas y gestionar su carrito de compras de manera eficiente.

El proyecto fue desarrollado utilizando **Angular 21** con las últimas características del framework, incluyendo signals, standalone components y lazy loading, garantizando una experiencia de usuario rápida y moderna.

### ¿Para quién es este proyecto?

- **Distribuidores mayoristas** que necesitan realizar pedidos grandes de productos de higiene
- **Negocios B2B** que buscan una plataforma moderna para gestionar sus ventas
- **Empresas** que requieren un sistema escalable con autenticación y gestión de inventario

---

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- Login de usuarios con validación de credenciales
- Recuperación de contraseña
- Persistencia de sesión mediante localStorage
- Protección de rutas privadas

### 📊 Dashboard Empresarial
- **Estadísticas en tiempo real**: Visualización de pedidos del mes y ahorro total
- **Pedidos recientes**: Historial de órdenes con estados (Entregado, En camino, Procesando)
- **Productos más vendidos**: Top 3 de productos con mejor desempeño
- **Productos nuevos**: Showcase de últimos productos agregados al catálogo
- **Promociones activas**: Descuentos especiales y combos disponibles
- **Pre-orders**: Productos próximos a estar disponibles

### 🛒 Catálogo de Productos
- **Exploración completa** de productos de higiene mayoristas
- **Sistema de filtros avanzado**:
  - Por categoría (Dental, Jabón, Limpieza, Cuidado Personal, Sanitizador)
  - Por marca
  - Por tipo de presentación (Caja, Paquete, Bulto)
  - Por disponibilidad en stock
  - Por productos con descuento
- **Información detallada** de cada producto:
  - Nombre y descripción
  - Presentación y tamaño por unidad
  - Precio mayorista en COP (Peso Colombiano)
  - Descuentos aplicables
  - Estado de disponibilidad

### 🛍️ Carrito de Compras
- Gestión del carrito con servicio dedicado
- Agregar/remover productos
- Cálculo automático de totales

### 🎨 Interfaz de Usuario
- **Diseño responsive** optimizado para desktop y móvil
- **Tema moderno** con Tailwind CSS 4.1
- **Iconos vectoriales** con Lucide Angular
- **Animaciones suaves** y transiciones
- **Manejo de imágenes** con componente de fallback personalizado

### 🚨 Manejo de Errores
- Página 404 (Not Found)
- Página 500 (Server Error)
- Gestión centralizada de errores

---

## 🛠️ Tecnologías Utilizadas

### Frontend Framework
- **Angular 21.0.0** - Framework principal con arquitectura standalone
- **TypeScript 5.9** - Tipado estático y desarrollo robusto
- **RxJS 7.8** - Programación reactiva y manejo de streams

### Styling
- **Tailwind CSS 4.1** - Framework CSS utility-first
- **PostCSS 8.5** - Procesamiento de CSS
- **@tailwindcss/postcss** - Plugin oficial de Tailwind

### Desarrollo
- **Angular CLI 21.0.2** - Herramientas de desarrollo y build
- **pnpm 10.12** - Gestor de paquetes rápido y eficiente
- **Prettier** - Formateo de código consistente

### Librerías Adicionales
- **Lucide Angular 0.556** - Iconos SVG optimizados

### Arquitectura
- **Standalone Components** - Componentes independientes sin módulos NgModule
- **Lazy Loading** - Carga diferida de rutas para optimización
- **Signals** - Sistema reactivo nativo de Angular
- **Dependency Injection** - Inyección de dependencias con `inject()`

---

## 🏗️ Arquitectura del Proyecto

HIGINEX sigue una arquitectura modular y escalable basada en **feature modules** con standalone components:

```
HIGINEX/
├── 🔐 Auth Module
│   ├── Login
│   ├── Recuperación de contraseña
│   └── Servicio de autenticación
│
├── 💼 Sales Module (Ventas)
│   ├── Dashboard con estadísticas
│   ├── Catálogo de productos
│   ├── Gestión de filtros
│   ├── Carrito de compras
│   └── Layout principal
│
├── ❌ Errors Module
│   ├── Página 404
│   └── Página 500
│
└── 🔧 Shared Module
    └── Componentes reutilizables
```

### Patrones de Diseño Implementados

- **Service Layer Pattern**: Lógica de negocio en servicios inyectables
- **Component-Based Architecture**: Componentes standalone reutilizables
- **Lazy Loading Pattern**: Carga bajo demanda de módulos
- **Reactive Programming**: Uso de signals y computed para estado reactivo
- **Repository Pattern**: Separación de lógica de datos (servicios)

---

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: v18.19.0 o superior (recomendado v20.x LTS)
- **pnpm**: v10.12.1 o superior
- **Git**: Para clonar el repositorio

### Verificar instalación

```bash
node --version  # v20.x.x o superior
pnpm --version  # 10.12.1 o superior
```

### Instalar pnpm (si no lo tienes)

```bash
npm install -g pnpm@10.12.1
```

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/CodeJairo/HIGINEX.git
cd HIGINEX
```

### 2. Instalar dependencias

```bash
pnpm install
```

Este comando instalará todas las dependencias listadas en `package.json` de manera eficiente.

### 3. Verificar la instalación

```bash
pnpm ng version
```

Deberías ver la información de Angular CLI y las versiones instaladas.

---

## 💻 Uso

### Servidor de Desarrollo

Inicia el servidor de desarrollo local:

```bash
pnpm start
```

O alternativamente:

```bash
pnpm ng serve
```

La aplicación estará disponible en **http://localhost:4200/**

El servidor se recargará automáticamente cuando realices cambios en los archivos fuente.

### Build de Producción

Para compilar el proyecto para producción:

```bash
pnpm build
```

Los artefactos de compilación se almacenarán en el directorio `dist/`. La compilación de producción optimiza la aplicación para rendimiento y velocidad.

### Build de Desarrollo con Watch Mode

Para compilar en modo desarrollo con recarga automática:

```bash
pnpm watch
```

### Ejecutar Tests

Para ejecutar los tests unitarios:

```bash
pnpm test
```

---

## 📁 Estructura de Directorios

```
HIGINEX/
├── .vscode/                    # Configuración de VS Code
├── public/                     # Archivos estáticos públicos
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── auth/              # Módulo de autenticación
│   │   │   ├── interfaces/    # Interfaces de usuario
│   │   │   ├── pages/
│   │   │   │   ├── login-page/
│   │   │   │   └── forgot-password-page/
│   │   │   ├── services/      # AuthService
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── sales/             # Módulo de ventas
│   │   │   ├── Layouts/       # Layout principal de ventas
│   │   │   ├── components/    # Componentes del módulo
│   │   │   │   ├── product-card/
│   │   │   │   ├── sidebar/
│   │   │   │   └── mobile-filters/
│   │   │   ├── interface/     # Interfaces de productos
│   │   │   ├── pages/
│   │   │   │   ├── dashboard-page/
│   │   │   │   └── catalog-page/
│   │   │   ├── services/      # FilterService, CartService
│   │   │   └── sales.routes.ts
│   │   │
│   │   ├── errors/            # Módulo de errores
│   │   │   ├── pages/
│   │   │   │   ├── not-found-page/
│   │   │   │   └── server-error-page/
│   │   │   └── errors.routes.ts
│   │   │
│   │   ├── shared/            # Componentes compartidos
│   │   │   └── components/
│   │   │       └── image-with-fallback/
│   │   │
│   │   ├── app.config.ts      # Configuración de la app
│   │   ├── app.routes.ts      # Rutas principales
│   │   ├── app.ts             # Componente raíz
│   │   ├── app.html
│   │   └── app.css
│   │
│   ├── index.html             # HTML principal
│   ├── main.ts                # Punto de entrada
│   └── styles.css             # Estilos globales
│
├── .editorconfig              # Configuración del editor
├── .gitignore
├── angular.json               # Configuración de Angular
├── package.json               # Dependencias del proyecto
├── pnpm-lock.yaml             # Lock file de pnpm
├── tsconfig.json              # Configuración de TypeScript
├── tsconfig.app.json
└── README.md
```

---

## 📜 Scripts Disponibles

En el archivo `package.json` se definen los siguientes scripts:

| Comando | Descripción |
|---------|-------------|
| `pnpm start` | Inicia el servidor de desarrollo |
| `pnpm build` | Compila el proyecto para producción |
| `pnpm watch` | Compila en modo desarrollo con watch |
| `pnpm test` | Ejecuta los tests unitarios |
| `pnpm ng` | Ejecuta comandos de Angular CLI |

### Comandos de Angular CLI

```bash
# Generar un nuevo componente
pnpm ng generate component nombre-componente

# Generar un nuevo servicio
pnpm ng generate service nombre-servicio

# Ver ayuda completa
pnpm ng generate --help
```

---

## 🗺️ Roadmap

### Funcionalidades Actuales ✅
- [x] Sistema de autenticación básico
- [x] Dashboard con estadísticas
- [x] Catálogo de productos con filtros
- [x] Carrito de compras
- [x] Diseño responsive
- [x] Persistencia de sesión

### Próximas Mejoras 🚀

#### Corto Plazo
- [ ] Integración con API backend real
- [ ] Sistema de checkout completo
- [ ] Historial de pedidos detallado
- [ ] Notificaciones push
- [ ] Búsqueda avanzada de productos

#### Mediano Plazo
- [ ] Panel de administración
- [ ] Gestión de inventario en tiempo real
- [ ] Reportes y analytics avanzados
- [ ] Sistema de favoritos
- [ ] Comparador de productos

#### Largo Plazo
- [ ] Aplicación móvil nativa (iOS/Android)
- [ ] Integración con sistemas de pago
- [ ] Facturación electrónica
- [ ] Chat en vivo con soporte
- [ ] Recomendaciones personalizadas con IA

---

## 👨‍💻 Autor

**Jairo** - [@CodeJairo](https://github.com/CodeJairo)

- GitHub: [CodeJairo](https://github.com/CodeJairo)
- Proyecto: [HIGINEX](https://github.com/CodeJairo/HIGINEX)

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y educativo.

</div>
