import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { FormProvider } from './context/FormContext';
// import LoginPage from './pages/LoginPage';
import GuestbookPage from './pages/GuestbookPage';
import AdminPage from './pages/AdminPage';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <FormProvider>
        <BrowserRouter>
          <Routes>
            {/* <Route path="/" element={<LoginPage />} /> */}
            <Route path="/" element={<GuestbookPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FormProvider>
    </AuthProvider>
  );
};

export default App;
