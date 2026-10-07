import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideAngularModule, MapPin, Phone } from 'lucide-angular';

@Component({
  selector: 'sales-footer',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly mapPinIcon = MapPin;
  readonly phoneIcon = Phone;

  get currentYear(): number {
    return new Date().getFullYear();
  }
}

