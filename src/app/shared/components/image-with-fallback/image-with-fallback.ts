import { ChangeDetectionStrategy, Component, computed, Input, signal } from '@angular/core';

@Component({
  selector: 'shared-image-with-fallback',
  imports: [],
  templateUrl: './image-with-fallback.html',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageWithFallback {
  @Input({ required: true }) src!: string;
  @Input({ required: true }) alt!: string;
  @Input() imgClass: string = '';

  hasError = signal(false);
  isLoading = signal(true);

  readonly errorClass = computed(
    () => `flex items-center justify-center bg-base-200 ${this.imgClass}`
  );

  readonly loadingClass = computed(
    () => `flex items-center justify-center bg-base-200 animate-pulse ${this.imgClass}`
  );

  readonly imageClass = computed(() => `${this.imgClass}${this.isLoading() ? ' hidden' : ''}`);

  onError(): void {
    this.hasError.set(true);
    this.isLoading.set(false);
  }

  onLoad(): void {
    this.isLoading.set(false);
  }
}
