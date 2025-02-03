import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { RecipeImport } from '../components/RecipeImport';

export function ImportPage() {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <RecipeImport />;
}