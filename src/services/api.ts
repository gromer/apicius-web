import { supabase } from './supabase';

// Types
interface LoginRequest {
  email: string;
  password: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface UpdatePasswordRequest {
  accessToken: string;
  newPassword: string;
}

interface BetaUserRequest {
  email: string;
}

interface UserPreferences {
  theme?: string;
  notifications_enabled?: boolean;
}

interface Recipe {
  title: string;
  description: string;
  is_public: boolean;
}

// API Client class
class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  constructor() {
    this.baseUrl = 'https://apicius-api.onrender.com';
  }

  private async getAuthHeader(): Promise<HeadersInit> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    return {
      ...this.headers,
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<Response> {
    return fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<Response> {
    return fetch(`${this.baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<Response> {
    return fetch(`${this.baseUrl}/auth/update-password`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
  }

  // Beta Users endpoints
  async addBetaUser(data: BetaUserRequest): Promise<Response> {
    return fetch(`${this.baseUrl}/beta-users`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
  }

  // Preferences endpoints
  async getPreferences(): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/preferences`, {
      headers,
    });
  }

  async updatePreferences(data: Partial<UserPreferences>): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/preferences`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  }

  // Recipes endpoints
  async getRecipes(): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/recipes`, {
      headers,
    });
  }

  async createRecipe(data: Recipe): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/recipes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  async getRecipe(id: string): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/recipes/${id}`, {
      headers,
    });
  }

  async updateRecipe(id: string, data: Partial<Recipe>): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/recipes/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  }

  async deleteRecipe(id: string): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/recipes/${id}`, {
      method: 'DELETE',
      headers,
    });
  }

  async importRecipeFromImage(file: File): Promise<Response> {
    const headers = await this.getAuthHeader();
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${this.baseUrl}/recipes/import-image`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async importRecipeFromText(text: string): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/recipes/import-text`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
    });
  }

  // Error handling helper
  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'An error occurred');
    }
    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();