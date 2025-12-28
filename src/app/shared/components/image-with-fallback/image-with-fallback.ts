import { ChangeDetectionStrategy, Component, computed, Input, signal } from '@angular/core';

@Component({
  selector: 'shared-image-with-fallback',
  imports: [],
  templateUrl: './image-with-fallback.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageWithFallback {
  @Input({ required: true }) src!: string;
  @Input({ required: true }) alt!: string;
  @Input() class: string = '';

  hasError = signal(false);
  isLoading = signal(true);

  readonly errorClass = computed(
    () => `flex items-center justify-center bg-base-200 ${this.class}`
  );

  readonly loadingClass = computed(
    () => `flex items-center justify-center bg-base-200 animate-pulse ${this.class}`
  );

  readonly imageClass = computed(() => `${this.class}${this.isLoading() ? ' hidden' : ''}`);

  onError(): void {
    this.hasError.set(true);
    this.isLoading.set(false);
  }

  onLoad(): void {
    this.isLoading.set(false);
  }
}
