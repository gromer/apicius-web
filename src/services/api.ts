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
  tavatarUrl: string;
  displayName: string;
  id: string;
  theme: string;
}

interface Recipe {
  createdAt: Date;
  id: string;
  isPublic: boolean;
  recipeMarkdown: string;
  updatedAt: Date | null;
  userId: string;
}

interface BaseResponseBody {
  error: ErrorResponse | null;
}

interface ErrorResponse {
    error: string;
}

interface ImportRecipeResponseBody extends BaseResponseBody {
  importedRecipe: Recipe | null;
}

// API Client class
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
      credentials: 'include',
      headers,
    });
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
  async getRecipes(): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/recipes`, {
      credentials: 'include',
      headers,
    });
  }

  async createRecipe(data: Recipe): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/recipes`, {
      credentials: 'include',
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  async getRecipe(id: string): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/recipes/${id}`, {
      credentials: 'include',
      headers,
    });
  }

  async updateRecipe(id: string, data: Partial<Recipe>): Promise<Response> {
    const headers = await this.getAuthHeader();
    return fetch(`${this.baseUrl}/recipes/${id}`, {
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
      formData.append('files[]', file);
    });

    const response = await fetch(`${this.baseUrl}/recipes/import-image`, {
      body: formData,
      credentials: 'include',
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
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