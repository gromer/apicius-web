import { useParams, Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { RecipeView } from '../components/RecipeView';

export function RecipePage() {
  const { recipeId } = useParams();
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!recipeId) {
    return <Navigate to="/" replace />;
  }

  return <RecipeView recipeId={recipeId} />;
}