import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ImportPage } from './pages/ImportPage';
import { RecipePage } from './pages/RecipePage';
import { SettingsPage } from './pages/SettingsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { EarlyAccessPage } from './pages/EarlyAccessPage';
import { Layout } from './components/Layout';
import { RecipeListProvider } from './contexts/RecipeListContext';

export default function App() {
  return (
    <RecipeListProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/" element={<EarlyAccessPage />} />
        <Route element={<Layout />}>
          <Route path="/import" element={<ImportPage />} />
          <Route path="/recipes/:recipeId" element={<RecipePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </RecipeListProvider>
  );
}