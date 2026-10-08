# Higinex Frontend

<div align="center">

**Plataforma web B2B moderna para la distribución mayorista de productos de higiene y cuidado personal**

[![Angular](https://img.shields.io/badge/Angular-21.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-5.5-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)](https://daisyui.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.9-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)
[![pnpm](https://img.shields.io/badge/pnpm-10.26-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

</div>

---

## Descripción General

**Higinex Frontend** es una aplicación web empresarial (Single Page Application) diseñada específicamente para la operativa de ventas B2B y distribución al por mayor de insumos de higiene institucional, limpieza y cuidado personal. 

Ofrece una experiencia integral tanto para los clientes comerciales (catálogo, listas de precios, checkout y seguimiento de pedidos) como para los administradores de la distribuidora (control de catálogo, variantes, inventario, precios y despacho).

---

## Características y Arquitectura Técnica

- **Arquitectura Zoneless:** Opera sin `zone.js` mediante `provideZonelessChangeDetection()`, logrando un rendimiento superior y menor sobrecarga en el navegador.
- **Estado Reactivo con Signals:** Manejo de estado síncrono local mediante **Angular Signals** (`signal`, `computed`, `effect`).
- **Server State con TanStack Query:** Caching inteligente, deduplicación de consultas y sincronización en segundo plano con `@tanstack/angular-query-experimental`.
- **Diseño Corporativo & Glassmorphism:** Estilos basados en Tailwind CSS v4 y DaisyUI v5 con soporte nativo para temas claro (`corporate`) y oscuro (`business`).
- **Seguridad y Sesión:** Autenticación JWT con rotación automática mediante `refreshToken` en cookies `httpOnly`, interceptores HTTP y guardas de ruta por rol.

---

## Módulos Principales

| Módulo | Ruta | Descripción |
|---|---|---|
| **Ventas (Sales)** | `/` y `/catalog` | Catálogo mayorista interactivo, filtros facetados (categoría, marca, presentación, stock, descuentos), carrito de compras reactivo y flujo de checkout. |
| **Administración (Admin)** | `/admin/*` | Panel de control integral: gestión de productos, variantes, imágenes, control de inventario, contratos comerciales de precios, clientes y órdenes. |
| **Portal de Cliente (Customer)** | `/customer/*` | Espacio privado para clientes con libreta de direcciones de despacho, perfil corporativo e historial de pedidos. |
| **Autenticación (Auth)** | `/auth/*` | Flujo de inicio de sesión empresarial, recuperación de contraseña y verificación por correo electrónico. |
| **Modo Demo (Demo)** | Integrado | Barra de simulación y sandbox interactivo para probar funcionalidades frontend con datos precargados sin afectar la base de datos real. |

---

## Estructura del Proyecto

```text
src/
├── app/
│   ├── admin/            # Panel administrativo (productos, órdenes, clientes, inventario)
│   ├── auth/             # Login, recuperación de contraseña y guards
│   ├── customer/         # Portal de autogestión de clientes y libretas de direcciones
│   ├── demo/             # Utilidades de simulación para pruebas frontend
│   ├── errors/           # Vistas de error 404 y 500
│   ├── sales/            # Catálogo público, carrito, filtros y checkout
│   ├── shared/           # Componentes UI (iOS cards, badges, modales, iconos)
│   ├── app.config.ts     # Configuración zoneless, providers e interceptores
│   └── app.routes.ts     # Carga perezosa (lazy loading) de módulos
├── environments/         # Variables de entorno (desarrollo y producción)
├── styles.css            # Tailwind CSS v4, DaisyUI v5 y estilos personalizados
└── main.ts               # Punto de entrada de la aplicación
```

---

## Requisitos Previos

- **Node.js:** Versión 20.x LTS o superior
- **pnpm:** Versión 10.26 o superior (`npm install -g pnpm`)

---

## Instalación y Puesta en Marcha

### 1. Clonar el repositorio

```bash
git clone git@github.com:CodeJairo/higinex-front.git
cd higinex-front
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configuración de Entorno

Los endpoints de la API se gestionan en la carpeta `src/environments/`:

- **Desarrollo (`environment.development.ts`):**
  ```typescript
  export const environment = {
    apiUrl: 'http://localhost:3000/api/v1',
  };
  ```

- **Producción (`environment.ts`):**
  ```typescript
  export const environment = {
    apiUrl: 'https://higinex-back-production.up.railway.app/api/v1',
  };
  ```

### 4. Ejecutar en Desarrollo

```bash
pnpm start
# o
pnpm exec ng serve
```

La aplicación estará disponible en `http://localhost:4200/` con recarga automática (*hot reload*).

---

## Scripts Disponibles

| Comando | Acción |
|---|---|
| `pnpm start` | Inicia el servidor de desarrollo en `http://localhost:4200` |
| `pnpm run build` | Compila el bundle optimizado para producción en `dist/` |
| `pnpm run watch` | Compila en modo desarrollo con detección continua de cambios |
| `pnpm exec ng <comando>` | Ejecuta comandos directos de Angular CLI (generadores, análisis) |

---

## Integración con el Backend

- **API Base:** Consume los servicios de la API REST servida en `/api/v1`.
- **Autenticación:** Las solicitudes autenticadas envían el encabezado `Authorization: Bearer <accessToken>` y utilizan cookies seguras con `withCredentials: true` para la rotación de credenciales.
- **Repositorio Backend:** [higinex-back](https://github.com/MotoStock/higinex-back)

---

## Autor

Desarrollado por **Jairo** ([@CodeJairo](https://github.com/CodeJairo)).
