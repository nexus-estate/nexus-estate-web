import type {
  User,
  SigninRequest,
  SigninResponse,
  SignupRequest,
  SignupResponse,
  UpdateProfileRequest,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nexus_access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  /**
   * Raw request — NestJS backend returns data directly,
   * NOT wrapped in { success: true, data: ... }
   */
  private async requestRaw<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const json = await response.json();

    if (!response.ok) {
      // NestJS errors: { message: string, statusCode: number, error?: string }
      const message =
        typeof json.message === 'string'
          ? json.message
          : Array.isArray(json.message)
            ? json.message.join(', ')
            : json.error || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return json as T;
  }

  // ─── Auth ────────────────────────────────────────────────
  /**
   * POST /api/auth/signup
   * Returns { user: User, message: string }
   */
  async signup(data: SignupRequest) {
    return this.requestRaw<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * POST /api/auth/signin
   * Body: { email, password }
   * Returns { user: User, accessToken: string, expiresIn: string }
   */
  async signin(data: SigninRequest) {
    return this.requestRaw<SigninResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ─── Users ────────────────────────────────────────────────
  /**
   * GET /api/users/me
   * Returns the currently authenticated user
   */
  async getMe() {
    return this.requestRaw<User>('/users/me');
  }

  /**
   * GET /api/users/:id
   * Returns User with profile relation
   */
  async getUser(id: number) {
    return this.requestRaw<User>(`/users/${id}`);
  }

  /**
   * PATCH /api/users/:id
   * Body: UpdateProfileDto fields
   * Returns updated User with profile
   */
  async updateUser(id: number, data: UpdateProfileRequest) {
    return this.requestRaw<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * POST /api/users/:id/change-password
   * Body: { oldPassword, newPassword }
   * Returns { message: string }
   */
  async changePassword(id: number, oldPassword: string, newPassword: string) {
    return this.requestRaw<{ message: string }>(
      `/users/${id}/change-password`,
      {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      },
    );
  }

  // ─── Properties / Listings (placeholder — no controller yet) ──
  async getProperties(params?: {
    page?: number;
    limit?: number;
    type?: string;
    purpose?: string;
    city?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.purpose) searchParams.set('purpose', params.purpose);
    if (params?.city) searchParams.set('city', params.city);
    if (params?.district) searchParams.set('district', params.district);
    if (params?.minPrice)
      searchParams.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice)
      searchParams.set('maxPrice', params.maxPrice.toString());
    if (params?.bedrooms)
      searchParams.set('bedrooms', params.bedrooms.toString());

    return this.requestRaw<unknown[]>('/properties?' + searchParams.toString());
  }

  async getProperty(id: string) {
    return this.requestRaw<unknown>('/properties/' + id);
  }

  async search(query: string, page?: number, limit?: number) {
    const searchParams = new URLSearchParams();
    searchParams.set('query', query);
    if (page) searchParams.set('page', page.toString());
    if (limit) searchParams.set('limit', limit.toString());
    return this.requestRaw<unknown[]>('/search?' + searchParams.toString());
  }

  async getSimilarProperties(id: string, limit?: number) {
    const params = limit ? '?limit=' + limit : '';
    return this.requestRaw<unknown[]>(
      '/recommendations/properties/' + id + '/similar' + params,
    );
  }

  async getHotProperties(limit?: number) {
    const params = limit ? '?limit=' + limit : '';
    return this.requestRaw<unknown[]>(
      '/recommendations/properties/hot' + params,
    );
  }

  async getListings(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    return this.requestRaw<unknown[]>('/listings?' + params.toString());
  }

  async createListing(data: Record<string, unknown>) {
    return this.requestRaw<unknown>('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async publishListing(id: string) {
    return this.requestRaw<unknown>('/listings/' + id + '/publish', {
      method: 'POST',
    });
  }

  async createLead(data: {
    listingId: string;
    name: string;
    phone: string;
    message?: string;
  }) {
    return this.requestRaw<unknown>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPackages() {
    return this.requestRaw<unknown[]>('/payments/packages');
  }

  async createPayment(data: {
    listingId: string;
    packageId: string;
    provider?: string;
  }) {
    return this.requestRaw<unknown>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPresignedUrl(fileName: string) {
    return this.requestRaw<{
      uploadUrl: string;
      mediaId: string;
      expiresIn: number;
    }>('/media/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ fileName }),
    });
  }

  async getAdminUsers(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    return this.requestRaw<unknown[]>('/admin/users?' + params.toString());
  }

  async approveListing(id: string) {
    return this.requestRaw<unknown>('/admin/listings/' + id + '/approve', {
      method: 'POST',
    });
  }

  async rejectListing(id: string, reason: string) {
    return this.requestRaw<unknown>('/admin/listings/' + id + '/reject', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminOverview() {
    return this.requestRaw<{
      totalUsers: number;
      totalBrokers: number;
      totalListings: number;
    }>('/admin/reports/overview');
  }
}

export const api = new ApiClient(API_BASE);
