export interface ShowcaseProduct {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly presentation: string;
  readonly tag: string;
  readonly image: string;
  readonly description: string;
}

export const AUTH_SHOWCASE_PRODUCTS: readonly ShowcaseProduct[] = [
  {
    id: 'prod-1',
    name: 'Jabón Líquido Antibacterial Premium',
    category: 'Higiene Institucional',
    presentation: 'Galón 3.8 Litros',
    tag: 'Alta Rotación',
    image: '/products/jabon-liquido.jpg',
    description: 'Fórmula espumante biodegradable con agentes emolientes para lavado frecuente en plantas y oficinas.',
  },
  {
    id: 'prod-2',
    name: 'Desinfectante Multiusos Hospitalario',
    category: 'Bioseguridad & Asepsia',
    presentation: 'Galón 3.8 Litros',
    tag: 'Grado Quirúrgico',
    image: '/products/desinfectante.jpg',
    description: 'Acción virucida y bactericida certificada para desinfección de superficies críticas e instituciones de salud.',
  },
  {
    id: 'prod-3',
    name: 'Gel Antibacterial 70% Alcohol',
    category: 'Antisepsia Cutánea',
    presentation: 'Envase 1.0 Litro',
    tag: 'Registro INVIMA',
    image: '/products/gel-antibacterial.jpg',
    description: 'Desinfección de manos sin enjuague con microburbujas humectantes que protegen la barrera dérmica.',
  },
];
