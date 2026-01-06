import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import {
  CreateVariantImagePayload,
  CreateVariantPayload,
  ListVariantsQuery,
  MessageResponse,
  ProductVariant,
  ProductVariantImage,
  UpdateVariantImagePayload,
  UpdateVariantPayload,
} from '../interfaces';

@Injectable({ providedIn: 'root' })
export class VariantsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly queryClient = inject(QueryClient);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

  // --- Mutations ---

  readonly createVariantMutation = injectMutation(() => ({
    mutationFn: (args: { productId: string; payload: CreateVariantPayload }) =>
      this.createVariantRequest(args.productId, args.payload),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['variants', 'list', variables.productId],
      });
    },
  }));

  readonly updateVariantMutation = injectMutation(() => ({
    mutationFn: (args: { variantId: string; payload: UpdateVariantPayload }) =>
      this.updateVariantRequest(args.variantId, args.payload),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['variants', 'detail', variables.variantId] });
      // Invalidate list as well since name/sku might have changed
      this.queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
  }));

  readonly activateVariantMutation = injectMutation(() => ({
    mutationFn: (variantId: string) => this.activateVariantRequest(variantId),
    onSuccess: (_, variantId) => {
      this.queryClient.invalidateQueries({ queryKey: ['variants', 'detail', variantId] });
      this.queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
  }));

  readonly deactivateVariantMutation = injectMutation(() => ({
    mutationFn: (variantId: string) => this.deactivateVariantRequest(variantId),
    onSuccess: (_, variantId) => {
      this.queryClient.invalidateQueries({ queryKey: ['variants', 'detail', variantId] });
      this.queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
  }));

  readonly deleteVariantMutation = injectMutation(() => ({
    mutationFn: (variantId: string) => this.deleteVariantRequest(variantId),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
  }));

  // Images
  readonly uploadImageMutation = injectMutation(() => ({
    mutationFn: (args: { variantId: string; payload: CreateVariantImagePayload }) =>
      this.uploadImageRequest(args.variantId, args.payload),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['variant-images', variables.variantId],
      });
      // Invalidate variant detail as it might include the images list
      this.queryClient.invalidateQueries({ queryKey: ['variants', 'detail', variables.variantId] });
    },
  }));

  readonly updateImageMutation = injectMutation(() => ({
    mutationFn: (args: {
      variantId: string;
      imageId: string;
      payload: UpdateVariantImagePayload;
    }) => this.updateImageRequest(args.variantId, args.imageId, args.payload),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['variant-images', variables.variantId],
      });
    },
  }));

  readonly deleteImageMutation = injectMutation(() => ({
    mutationFn: (args: { variantId: string; imageId: string }) =>
      this.deleteImageRequest(args.variantId, args.imageId),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['variant-images', variables.variantId],
      });
    },
  }));

  readonly setDefaultImageMutation = injectMutation(() => ({
    mutationFn: (args: { variantId: string; imageId: string }) =>
      this.setDefaultImageRequest(args.variantId, args.imageId),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['variant-images', variables.variantId],
      });
      this.queryClient.invalidateQueries({
        queryKey: ['variants', 'detail', variables.variantId],
      });
    },
  }));

  // --- Public Query Builders / Helpers ---

  getVariantDetailQuery(variantId: string) {
    return {
      queryKey: ['variants', 'detail', variantId],
      queryFn: () => this.getVariantRequest(variantId),
    };
  }

  buildImageUrl(variantId: string, imageId: string): string {
    return this.buildUrl(`/products/variants/${variantId}/images/${imageId}`);
  }

  // --- HTTP Requests ---

  async listVariantsRequest(query: ListVariantsQuery = {}): Promise<ProductVariant[]> {
    const httpParams = new HttpParams({
      fromObject: {
        limit: String(query.limit ?? 10),
        offset: String(query.offset ?? 0),
        status: query.status ?? 'all',
        productStatus: query.productStatus ?? 'all',
      },
    });

    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.get<ProductVariant[]>(this.buildUrl('/products/variants'), {
        headers,
        params: httpParams,
      })
    );
  }

  async getVariantRequest(variantId: string): Promise<ProductVariant> {
    const variant = await this.authService.requestWithAuthHeaders((headers) =>
      this.http.get<ProductVariant>(this.buildUrl(`/products/variants/${variantId}`), {
        headers,
      })
    );
    // Enrich with image URLs if images are present
    if (variant.images) {
      variant.images = variant.images.map((img) => ({
        ...img,
        url: this.buildImageUrl(variant.id, img.id),
      }));
    }
    return variant;
  }

  async createVariantRequest(
    productId: string,
    payload: CreateVariantPayload
  ): Promise<ProductVariant> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.post<ProductVariant>(
        this.buildUrl(`/products/variants/create/${productId}`),
        payload,
        { headers }
      )
    );
  }

  async updateVariantRequest(
    variantId: string,
    payload: UpdateVariantPayload
  ): Promise<MessageResponse> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.patch<MessageResponse>(
        this.buildUrl(`/products/variants/update/${variantId}`),
        payload,
        { headers }
      )
    );
  }

  async activateVariantRequest(variantId: string): Promise<MessageResponse> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.patch<MessageResponse>(
        this.buildUrl(`/products/variants/activate/${variantId}`),
        {},
        { headers }
      )
    );
  }

  async deactivateVariantRequest(variantId: string): Promise<MessageResponse> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.patch<MessageResponse>(
        this.buildUrl(`/products/variants/deactivate/${variantId}`),
        {},
        { headers }
      )
    );
  }

  async deleteVariantRequest(variantId: string): Promise<MessageResponse> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.delete<MessageResponse>(this.buildUrl(`/products/variants/${variantId}`), {
        headers,
      })
    );
  }

  async listImagesRequest(variantId: string): Promise<ProductVariantImage[]> {
    const images = await this.authService.requestWithAuthHeaders((headers) =>
      this.http.get<ProductVariantImage[]>(
        this.buildUrl(`/products/variants/${variantId}/images`),
        { headers }
      )
    );
    return images.map((img) => ({
      ...img,
      url: this.buildImageUrl(variantId, img.id),
    }));
  }

  async uploadImageRequest(
    variantId: string,
    payload: CreateVariantImagePayload
  ): Promise<ProductVariantImage> {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.altText) formData.append('altText', payload.altText);

    const image = await this.authService.requestWithAuthHeaders((headers) =>
      this.http.post<ProductVariantImage>(
        this.buildUrl(`/products/variants/${variantId}/images`),
        formData,
        { headers }
      )
    );
    return {
      ...image,
      url: this.buildImageUrl(variantId, image.id),
    };
  }

  async updateImageRequest(
    variantId: string,
    imageId: string,
    payload: UpdateVariantImagePayload
  ): Promise<MessageResponse> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.patch<MessageResponse>(
        this.buildUrl(`/products/variants/${variantId}/images/${imageId}`),
        payload,
        { headers }
      )
    );
  }

  async deleteImageRequest(variantId: string, imageId: string): Promise<MessageResponse> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.delete<MessageResponse>(
        this.buildUrl(`/products/variants/${variantId}/images/${imageId}`),
        { headers }
      )
    );
  }

  async setDefaultImageRequest(variantId: string, imageId: string): Promise<MessageResponse> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.patch<MessageResponse>(
        this.buildUrl(`/products/variants/${variantId}/images/${imageId}/default`),
        {},
        { headers }
      )
    );
  }

  private buildUrl(path: string): string {
    if (!this.apiBaseUrl) {
      return path;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${normalizedPath}`;
  }
}
