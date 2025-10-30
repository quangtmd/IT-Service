
import React, { useEffect } from 'react';
// FIX: Update react-router-dom from v5 to v6 for compatibility.
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import BlogPage from './pages/BlogPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import PCBuilderPage from './pages/PCBuilderPage';
import ProjectsPage from './pages/ProjectsPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/shared/ScrollToTop';
import FloatingActionButtons from './components/shared/FloatingActionButtons';
import PCBuildSuggestionsPage from './pages/PCBuildSuggestionsPage'; // Import the new page

// Auth and Admin
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CheckoutPage from './pages/CheckoutPage';

const App: React.FC = () => {

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-bgCanvas">
        <Header />
        <main className="flex-grow pt-[168px]">
          {/* FIX: Use Routes instead of Switch for react-router-dom v6 */}
          <Routes>
            {/* FIX: Use Navigate for redirects in react-router-dom v6 */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            {/* FIX: Use the element prop for Route components in react-router-dom v6 */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/article/:articleId" element={<ArticleDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/pc-builder" element={<PCBuilderPage />} />
            <Route path="/pc-build-suggestions" element={<PCBuildSuggestionsPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Protected Admin Route - Updated for v6 */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <FloatingActionButtons />
      </div>
    </HashRouter>
  );
};

export default App;
