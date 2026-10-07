import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const STATUS_VARIANT_MAP: Record<string, StatusVariant> = {
  // Success
  completed: 'success',
  delivered: 'success',
  paid: 'success',
  active: 'success',
  in_stock: 'success',
  approved: 'success',

  // Warning
  pending: 'warning',
  processing: 'warning',
  shipped: 'warning',
  low_stock: 'warning',
  in_transit: 'warning',

  // Error
  cancelled: 'error',
  canceled: 'error',
  failed: 'error',
  out_of_stock: 'error',
  inactive: 'error',
  rejected: 'error',

  // Info
  draft: 'info',
  open: 'info',
};

const VARIANT_BADGE_CLASSES: Record<StatusVariant, string> = {
  success: 'badge badge-sm gap-1.5 border border-success/30 bg-success/10 text-success font-medium',
  warning: 'badge badge-sm gap-1.5 border border-warning/30 bg-warning/10 text-warning font-medium',
  error: 'badge badge-sm gap-1.5 border border-error/30 bg-error/10 text-error font-medium',
  info: 'badge badge-sm gap-1.5 border border-info/30 bg-info/10 text-info font-medium',
  neutral: 'badge badge-sm gap-1.5 border border-base-300 bg-base-200 text-base-content/70 font-medium',
};

const VARIANT_DOT_CLASSES: Record<StatusVariant, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  neutral: 'bg-base-content/40',
};

@Component({
  selector: 'ui-status-badge',
  standalone: true,
  template: `
    <span [class]="badgeClasses()">
      <span class="w-1.5 h-1.5 rounded-full shrink-0" [class]="dotClass()"></span>
      <span>{{ displayLabel() }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiStatusBadgeComponent {
  readonly status = input.required<string>();
  readonly label = input<string>();

  private readonly normalizedVariant = computed<StatusVariant>(() => {
    const raw = (this.status() ?? '').toLowerCase().trim();
    return STATUS_VARIANT_MAP[raw] ?? 'neutral';
  });

  readonly badgeClasses = computed(() => {
    return VARIANT_BADGE_CLASSES[this.normalizedVariant()];
  });

  readonly dotClass = computed(() => {
    return VARIANT_DOT_CLASSES[this.normalizedVariant()];
  });

  readonly displayLabel = computed(() => {
    const custom = this.label();
    if (custom) return custom;
    const raw = this.status() ?? '';
    return raw.replace(/_/g, ' ').toUpperCase();
  });
}
