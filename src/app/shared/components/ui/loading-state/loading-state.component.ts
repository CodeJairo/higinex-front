import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-loading-state',
  standalone: true,
  template: `
    @if (type() === 'table') {
      <div class="space-y-3 p-4">
        @for (i of countArray(); track i) {
          <div class="h-10 bg-base-200/60 rounded-lg animate-pulse w-full"></div>
        }
      </div>
    } @else if (type() === 'spinner') {
      <div class="flex flex-col items-center justify-center p-8 gap-3">
        <span class="loading loading-spinner loading-md text-primary"></span>
        @if (message()) {
          <span class="text-xs text-base-content/60">{{ message() }}</span>
        }
      </div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        @for (i of countArray(); track i) {
          <div class="border border-base-200 rounded-xl p-5 bg-base-100 shadow-xs space-y-3 animate-pulse">
            <div class="h-4 bg-base-200 rounded w-1/3"></div>
            <div class="h-6 bg-base-200 rounded w-2/3"></div>
            <div class="h-3 bg-base-200 rounded w-full"></div>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiLoadingStateComponent {
  readonly count = input<number>(3);
  readonly type = input<'card' | 'table' | 'spinner'>('card');
  readonly message = input<string>();

  readonly countArray = computed(() => {
    const n = Math.max(1, Math.min(this.count(), 12));
    return Array.from({ length: n }, (_, i) => i);
  });
}
