import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Check,
  Facebook,
  Instagram,
  Linkedin,
  LucideAngularModule,
  Mail,
  MapPin,
  Phone,
  Send,
  Twitter,
  Youtube,
} from 'lucide-angular';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'sales-footer',
  imports: [LucideAngularModule, CommonModule, FormsModule],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  private router = inject(Router);
  private filterService = inject(FilterService);

  // Icons
  readonly facebookIcon = Facebook;
  readonly instagramIcon = Instagram;
  readonly linkedinIcon = Linkedin;
  readonly twitterIcon = Twitter;
  readonly youtubeIcon = Youtube;
  readonly mailIcon = Mail;
  readonly phoneIcon = Phone;
  readonly mapPinIcon = MapPin;
  readonly sendIcon = Send;
  readonly checkIcon = Check;

  // Form state
  formData = signal({
    name: '',
    email: '',
    message: '',
  });
  isSubmitting = signal(false);
  submitSuccess = signal(false);

  readonly socialLinks = [
    { icon: this.facebookIcon, href: '#', label: 'Facebook' },
    { icon: this.instagramIcon, href: '#', label: 'Instagram' },
    { icon: this.linkedinIcon, href: '#', label: 'LinkedIn' },
    { icon: this.twitterIcon, href: '#', label: 'Twitter' },
    { icon: this.youtubeIcon, href: '#', label: 'YouTube' },
  ];

  get currentYear(): number {
    return new Date().getFullYear();
  }

  onSubmit(): void {
    this.isSubmitting.set(true);

    // Simulate form submission
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitSuccess.set(true);
      this.formData.set({ name: '', email: '', message: '' });

      setTimeout(() => this.submitSuccess.set(false), 3000);
    }, 1000);
  }

  goTo404(): void {
    this.router.navigateByUrl('/errors/404');
  }

  goToPromotions(): void {
    this.filterService.resetFilters();
    this.router.navigateByUrl('/sales/catalog');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }

  updateFormField(field: 'name' | 'email' | 'message', value: string): void {
    this.formData.update((data) => ({ ...data, [field]: value }));
  }
}
