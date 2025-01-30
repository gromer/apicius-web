export interface ApiError {
    code: string | null;
    error: string;
    status: number;
}

export interface EarlyAccessRequest {
    email: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface UpdatePasswordRequest {
    accessToken: string;
    newPassword: string;
}

export interface GetUserPreferencesResponse extends BaseResponseBody {
    preferences: UserPreferences | null;
}

export interface UserPreferences {
    avatarUrl: string;
    displayName: string;
    id: string;
    theme: 'dark' | 'light' | 'system';
}

export interface Recipe {
    createdAt: Date;
    id: string;
    isPublic: boolean;
    recipeMarkdown: string;
    updatedAt: Date | null;
    userId: string;
}

export interface GetRecipesResponse extends BaseResponseBody {
    recipes: Recipe[];
}

export interface GetRecipeResponse extends BaseResponseBody {
    recipe: Recipe | null;
}

export interface CreateRecipeRequest {
    isPublic: boolean;
    recipeMarkdown: string;
}

export interface CreateRecipeResponse extends BaseResponseBody {
    createdRecipe: Recipe | null;
}

export interface BaseResponseBody {
    error: ErrorResponse | null;
}

export interface ErrorResponse {
    code: string | null;
    message: string;
    status: number;
}

export interface ImportRecipeResponseBody extends BaseResponseBody {
    recipeMarkdown: string;
}