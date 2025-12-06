import { computed, effect, Injectable, signal } from '@angular/core';
import { User } from '../interfaces';

const AUTH_STORAGE_KEY = 'higinex_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(this.loadFromStorage());
  private isLoadingSignal = signal<boolean>(false);

  readonly user = this.userSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly userName = computed(() => this.userSignal()?.name ?? '');
  readonly userEmail = computed(() => this.userSignal()?.email ?? '');

  constructor() {
    // Persist auth state to localStorage whenever it changes
    effect(() => {
      this.saveToStorage(this.userSignal());
    });
  }

  private loadFromStorage(): User | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        try {
          return JSON.parse(savedAuth);
        } catch (error) {
          console.error('Error loading auth from localStorage:', error);
          return null;
        }
      }
    }
    return null;
  }

  private saveToStorage(user: User | null): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    this.isLoadingSignal.set(true);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock user for demonstration
        const mockUser: User = {
          id: '1',
          name: 'María González',
          email: email,
          role: 'distributor',
        };

        this.userSignal.set(mockUser);
        this.isLoadingSignal.set(false);
        resolve(true);
      }, 1500);
    });
  }

  async sendPasswordRecovery(email: string): Promise<boolean> {
    this.isLoadingSignal.set(true);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isLoadingSignal.set(false);
        resolve(true);
      }, 2000);
    });
  }

  logout(): void {
    this.userSignal.set(null);
  }
}
