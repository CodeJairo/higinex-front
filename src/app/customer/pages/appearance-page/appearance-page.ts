import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ThemeId = 'light' | 'dark' | 'system';
type AccentId = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose';

interface ThemeOption {
  id: ThemeId;
  label: string;
  description: string;
}

interface AccentOption {
  id: AccentId;
  label: string;
}

@Component({
  selector: 'customer-appearance-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appearance-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppearancePage {
  // Opciones mock
  readonly themeOptions: ThemeOption[] = [
    {
      id: 'light',
      label: 'Claro',
      description: 'Fondo claro, ideal para ambientes bien iluminados.',
    },
    {
      id: 'dark',
      label: 'Oscuro',
      description: 'Fondo oscuro, cuida tus ojos en ambientes con poca luz.',
    },
    {
      id: 'system',
      label: 'Según el sistema',
      description: 'Usa automáticamente el tema configurado en tu dispositivo.',
    },
  ];

  readonly accentOptions: AccentOption[] = [
    { id: 'emerald', label: 'Esmeralda' },
    { id: 'sky', label: 'Cian' },
    { id: 'violet', label: 'Violeta' },
    { id: 'amber', label: 'Ámbar' },
    { id: 'rose', label: 'Rosa' },
  ];

  // Estado mock (luego lo podrás leer/escribir desde un servicio / backend)
  selectedTheme = signal<ThemeId>('light');
  selectedAccent = signal<AccentId>('emerald');
  roundedCorners = signal(true);
  compactLayout = signal(false);
  subtleAnimations = signal(true);

  // Helpers para la vista previa (solo estilos, sin persistir nada real)
  readonly previewAccentClasses = computed(() => {
    const accent = this.selectedAccent();
    switch (accent) {
      case 'emerald':
        return 'border-emerald-200 bg-emerald-500/10 text-emerald-700';
      case 'sky':
        return 'border-sky-200 bg-sky-500/10 text-sky-700';
      case 'violet':
        return 'border-violet-200 bg-violet-500/10 text-violet-700';
      case 'amber':
        return 'border-amber-200 bg-amber-500/10 text-amber-700';
      case 'rose':
        return 'border-rose-200 bg-rose-500/10 text-rose-700';
      default:
        return 'border-primary/20 bg-primary/10 text-primary';
    }
  });

  readonly previewButtonClasses = computed(() => {
    const accent = this.selectedAccent();
    switch (accent) {
      case 'emerald':
        return 'btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-none';
      case 'sky':
        return 'btn-sm bg-sky-500 hover:bg-sky-600 text-white border-none';
      case 'violet':
        return 'btn-sm bg-violet-500 hover:bg-violet-600 text-white border-none';
      case 'amber':
        return 'btn-sm bg-amber-500 hover:bg-amber-600 text-white border-none';
      case 'rose':
        return 'btn-sm bg-rose-500 hover:bg-rose-600 text-white border-none';
      default:
        return 'btn-sm btn-primary';
    }
  });

  readonly previewRadiusClasses = computed(() =>
    this.roundedCorners() ? 'rounded-2xl' : 'rounded-md'
  );

  readonly previewDensityClasses = computed(() =>
    this.compactLayout() ? 'p-3 space-y-2 text-sm' : 'p-4 space-y-3'
  );

  // Acciones UI (mock)
  selectTheme(theme: ThemeId) {
    this.selectedTheme.set(theme);
    // Aquí luego llamarías al servicio que setea el theme global
  }

  selectAccent(accent: AccentId) {
    this.selectedAccent.set(accent);
  }

  saveAppearance() {
    // Aquí luego se hará la llamada real al backend / servicio de preferencias
    console.log('Guardar apariencia (mock)', {
      theme: this.selectedTheme(),
      accent: this.selectedAccent(),
      roundedCorners: this.roundedCorners(),
      compactLayout: this.compactLayout(),
      subtleAnimations: this.subtleAnimations(),
    });
  }

  resetAppearance() {
    this.selectedTheme.set('light');
    this.selectedAccent.set('emerald');
    this.roundedCorners.set(true);
    this.compactLayout.set(false);
    this.subtleAnimations.set(true);
  }
}
