import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  template: `
    <div
      class="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-base-300 bg-base-100/50"
    >
      <div
        class="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center text-base-content/50 mb-4"
      >
        <ng-content select="[icon]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 stroke-[1.5]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </ng-content>
      </div>
      <h3 class="text-base font-semibold text-base-content">{{ title() }}</h3>
      @if (description()) {
        <p class="mt-1 text-sm text-base-content/60 max-w-sm">{{ description() }}</p>
      }
      <div class="mt-6 flex items-center gap-3">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiEmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
