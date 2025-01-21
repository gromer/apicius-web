export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: string | null;
  cookTime: string | null;
  totalTime: string | null;
  servings: number;
  servingUnit: string;
  starRating: number | null;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  categories: Category[];
  tags: Tag[];
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Instruction {
  id: string;
  description: string;
  stepNumber: number;
  timeEstimate: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}