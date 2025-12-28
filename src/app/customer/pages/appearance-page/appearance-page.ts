import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AppearanceService } from '../../services/appearance.service';

interface ThemeOption {
  id: string;
  label: string;
  description: string;
}

interface AccentOption {
  id: string;
  label: string;
}

const ACCENT_SWATCHES: Record<string, string> = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-400',
  rose: 'bg-rose-500',
};

@Component({
  selector: 'customer-appearance-page',
  templateUrl: './appearance-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppearancePage {
  readonly appearanceService = inject(AppearanceService);
  private readonly document = inject(DOCUMENT);

  readonly themeOptions: ThemeOption[] = [
    {
      id: 'corporate',
      label: 'Corporativo',
      description: 'Equilibrio limpio y profesional para el dia a dia.',
    },
    {
      id: 'business',
      label: 'Negocios',
      description: 'Estilo oscuro y elegante perfecto para entornos profesionales.',
    },
    {
      id: 'retro',
      label: 'Retro',
      description: 'Toques clásicos y cálidos con personalidad única.',
    },
  ];

  readonly accentOptions: AccentOption[] = [
    { id: 'emerald', label: 'Emerald' },
    { id: 'sky', label: 'Sky' },
    { id: 'violet', label: 'Violet' },
    { id: 'amber', label: 'Amber' },
    { id: 'rose', label: 'Rose' },
  ];

  readonly selectedTheme = computed(() => this.appearanceService.theme());
  readonly selectedAccent = computed(() => this.appearanceService.accent());

  readonly roundedCorners = this.appearanceService.rounded;
  readonly compactLayout = this.appearanceService.compact;
  readonly subtleAnimations = signal(true);

  readonly previewCardClasses = computed(() => {
    const accent = this.appearanceService.accent();
    const radius = this.appearanceService.rounded() ? 'rounded-2xl' : 'rounded-none';
    const border = accent ? 'border-primary/30' : 'border-base-300';
    return `border bg-base-200/70 ${radius} ${border}`;
  });

  readonly previewContentClasses = computed(() => {
    const compact = this.appearanceService.compact();
    const density = compact ? 'gap-2 p-3' : 'gap-4 p-5';
    const motion = this.subtleAnimations() ? 'transition-all duration-200' : 'transition-none';
    return `flex flex-col ${density} ${motion}`;
  });

  readonly previewStackClasses = computed(() => {
    const compact = this.appearanceService.compact();
    return compact ? 'space-y-2' : 'space-y-3';
  });

  readonly previewButtonClasses = computed(() => {
    const radius = this.appearanceService.rounded() ? 'rounded-xl' : 'rounded-none';
    const motion = this.subtleAnimations() ? 'transition-all duration-200' : 'transition-none';
    return `btn btn-primary ${radius} ${motion}`;
  });

  readonly previewGhostButtonClasses = computed(() => {
    const radius = this.appearanceService.rounded() ? 'rounded-xl' : 'rounded-none';
    const motion = this.subtleAnimations() ? 'transition-all duration-200' : 'transition-none';
    return `btn btn-ghost btn-xs ${radius} ${motion}`;
  });

  readonly saveNotice = signal(false);

  private saveTimeoutId: number | null = null;

  selectTheme(id: string): void {
    this.appearanceService.theme.set(id);
  }

  selectAccent(id: string): void {
    this.appearanceService.accent.set(id);
  }

  onRoundedChange(event: Event): void {
    this.roundedCorners.set(this.readCheckbox(event));
  }

  onCompactChange(event: Event): void {
    this.compactLayout.set(this.readCheckbox(event));
  }

  onSubtleAnimationsChange(event: Event): void {
    this.subtleAnimations.set(this.readCheckbox(event));
  }

  themeCardClasses(id: string): string {
    const base =
      'card border cursor-pointer transition-all text-left hover:border-primary hover:bg-base-200/60';
    return this.selectedTheme() === id ? `${base} border-primary/70 ring-2 ring-primary/40` : base;
  }

  accentButtonClasses(id: string): string {
    const base =
      'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs hover:bg-base-200/70 transition-all';
    return this.selectedAccent() === id
      ? `${base} border-primary ring-1 ring-primary/50 bg-base-200/80`
      : `${base} border-base-300`;
  }

  accentSwatchClasses(id: string): string {
    const swatch = ACCENT_SWATCHES[id] ?? 'bg-slate-300';
    return `inline-block w-4 h-4 rounded-full ${swatch}`;
  }

  saveAppearance(): void {
    this.saveNotice.set(true);

    const view = this.document.defaultView;
    if (!view) return;

    if (this.saveTimeoutId !== null) {
      view.clearTimeout(this.saveTimeoutId);
    }

    this.saveTimeoutId = view.setTimeout(() => {
      this.saveNotice.set(false);
      this.saveTimeoutId = null;
    }, 1600);
  }

  resetAppearance(): void {
    this.appearanceService.reset();
  }

  private readCheckbox(event: Event): boolean {
    const target = event.target as HTMLInputElement | null;
    return target?.checked ?? false;
  }
}
