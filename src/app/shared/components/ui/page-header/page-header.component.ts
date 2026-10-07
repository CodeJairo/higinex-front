import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-page-header',
  standalone: true,
  template: `
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
          {{ title() }}
        </h1>
        @if (description()) {
          <p class="mt-1 text-sm text-base-content/70">
            {{ description() }}
          </p>
        }
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <ng-content select="[actions]"></ng-content>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
