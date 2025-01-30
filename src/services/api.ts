import { ApiError, CreateRecipeRequest, CreateRecipeResponse, EarlyAccessRequest, GetRecipeResponse, GetRecipesResponse, GetUserPreferencesResponse, ImportRecipeResponseBody, Recipe, UserPreferences } from '../types/api';
import { supabase } from './supabase';

class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL!;
  }

  private async getAuthHeader(): Promise<HeadersInit> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    return {
      ...this.headers,
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  // Early Access endpoints
  async addEarlyAccessRequest(data: EarlyAccessRequest): Promise<void | ApiError> {
    const response = await fetch(`${this.baseUrl}/early-access`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return;
    }

    const json = await response.json();
    throw new Error(json.error);
  }

  // Preferences endpoints
  async getPreferences(): Promise<GetUserPreferencesResponse> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${this.baseUrl}/preferences`, {
      credentials: 'include',
      headers,
    });

    const json = await response.json();
    return json as GetUserPreferencesResponse;
  }

  async updatePreferences(data: Partial<UserPreferences>): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/preferences`, {
      credentials: 'include',
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  }

  // Recipes endpoints
  async getRecipes(): Promise<GetRecipesResponse> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${this.baseUrl}/recipes`, {
      credentials: 'include',
      headers,
    });

    const json = await response.json();
    return json as GetRecipesResponse;
  }

  async createRecipe(data: CreateRecipeRequest): Promise<CreateRecipeResponse> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${this.baseUrl}/recipes`, {
      credentials: 'include',
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const json = await response.json();
    return json as CreateRecipeResponse;
  }

  async getRecipe(id: string): Promise<GetRecipeResponse> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${this.baseUrl}/recipes/${id}`, {
      credentials: 'include',
      headers,
    });

    const json = await response.json();
    return json as GetRecipeResponse;
  }

  async updateRecipe(id: string, data: Partial<Recipe>): Promise<void> {
    const headers = await this.getAuthHeader();
    await fetch(`${this.baseUrl}/recipes/${id}`, {
      credentials: 'include',
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  }

  async deleteRecipe(id: string): Promise<void> {
    const headers = await this.getAuthHeader();
    await fetch(`${this.baseUrl}/recipes/${id}`, {
      credentials: 'include',
      method: 'DELETE',
      headers,
    });
  }

  async importRecipeFromImage(files: File[]): Promise<ImportRecipeResponseBody> {
    const headers = await this.getAuthHeader();
    const formData = new FormData();
    files.forEach(file => {
      console.log(file.name);
      formData.append('files[]', file);
    });

    if (files.length === 0) {
      throw new Error('No files provided');
    }

    const response = await fetch(`${this.baseUrl}/recipes/import-image`, {
      body: formData,
      credentials: 'include',
      headers: {
        ...headers,
        'Content-Type': `Content-Type: multipart/form-data`
      },
      method: 'POST',
    });

    var json = await response.json();
    return json as ImportRecipeResponseBody;
  }

  async importRecipeFromText(text: string): Promise<ImportRecipeResponseBody> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${this.baseUrl}/recipes/import-text`, {
      body: JSON.stringify({ text }),
      credentials: 'include',
      headers,
      method: 'POST',
    });

    var json = await response.json();
    return json as ImportRecipeResponseBody;
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