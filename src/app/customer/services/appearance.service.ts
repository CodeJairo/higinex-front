import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';

const STORAGE_KEY = 'higinex.appearance';

const ACCENT_COLORS: Record<string, string> = {
  emerald: '#10b981',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  amber: '#fbbf24',
  rose: '#f43f5e',
};

const DEFAULT_APPEARANCE = {
  theme: 'corporate',
  accent: 'sky',
  rounded: true,
  compact: false,
};

type AppearanceState = typeof DEFAULT_APPEARANCE;

@Injectable({ providedIn: 'root' })
export class AppearanceService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly storage = this.isBrowser
    ? this.document.defaultView?.localStorage ?? null
    : null;

  readonly theme = signal<string>(DEFAULT_APPEARANCE.theme);
  readonly accent = signal<string>(DEFAULT_APPEARANCE.accent);
  readonly rounded = signal<boolean>(DEFAULT_APPEARANCE.rounded);
  readonly compact = signal<boolean>(DEFAULT_APPEARANCE.compact);

  constructor() {
    const saved = this.readStorage();
    if (saved) {
      if (typeof saved.theme === 'string') {
        this.theme.set(saved.theme);
      }
      if (typeof saved.accent === 'string') {
        this.accent.set(this.normalizeAccent(saved.accent));
      }
      if (typeof saved.rounded === 'boolean') {
        this.rounded.set(saved.rounded);
      }
      if (typeof saved.compact === 'boolean') {
        this.compact.set(saved.compact);
      }
    }

    effect(() => {
      if (!this.isBrowser) return;

      const state = this.currentState();
      this.persist(state);
      this.applyToDom(state);
    });
  }

  reset(): void {
    this.theme.set(DEFAULT_APPEARANCE.theme);
    this.accent.set(DEFAULT_APPEARANCE.accent);
    this.rounded.set(DEFAULT_APPEARANCE.rounded);
    this.compact.set(DEFAULT_APPEARANCE.compact);
  }

  private currentState(): AppearanceState {
    return {
      theme: this.theme(),
      accent: this.accent(),
      rounded: this.rounded(),
      compact: this.compact(),
    };
  }

  private persist(state: AppearanceState): void {
    if (!this.storage) return;
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private applyToDom(state: AppearanceState): void {
    const html = this.document.documentElement;
    const body = this.document.body;
    if (!html || !body) return;

    html.setAttribute('data-theme', state.theme);
    html.style.setProperty('--color-primary', this.resolveAccent(state.accent));
    body.classList.toggle('layout-compact', state.compact);
    body.classList.toggle('no-rounded', !state.rounded);
  }

  private resolveAccent(value: string): string {
    const key = value.toLowerCase();
    return ACCENT_COLORS[key] ?? value;
  }

  private normalizeAccent(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return DEFAULT_APPEARANCE.accent;

    const lower = trimmed.toLowerCase();
    if (ACCENT_COLORS[lower]) {
      return lower;
    }

    const match = Object.entries(ACCENT_COLORS).find(([, hex]) => hex.toLowerCase() === lower);
    if (match) {
      return match[0];
    }

    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
      return trimmed;
    }

    return DEFAULT_APPEARANCE.accent;
  }

  private readStorage(): Partial<AppearanceState> | null {
    if (!this.storage) return null;
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<AppearanceState>;
      return typeof parsed === 'object' && parsed ? parsed : null;
    } catch {
      return null;
    }
  }
}
