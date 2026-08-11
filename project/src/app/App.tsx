import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import Chatbot from './components/Chatbot';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Chatbot />
    </AuthProvider>
  );
}
