

import React, { useEffect } from 'react';
// FIX: Update react-router-dom from v5 to v6 for compatibility.
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
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
    <ReactRouterDOM.HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-bgCanvas">
        <Header />
        <main className="flex-grow pt-[168px]">
          {/* FIX: Use Routes instead of Switch for react-router-dom v6 */}
          <ReactRouterDOM.Routes>
            {/* FIX: Use Navigate for redirects in react-router-dom v6 */}
            <ReactRouterDOM.Route path="/" element={<ReactRouterDOM.Navigate to="/home" replace />} />
            
            {/* FIX: Use the element prop for Route components in react-router-dom v6 */}
            <ReactRouterDOM.Route path="/home" element={<HomePage />} />
            <ReactRouterDOM.Route path="/shop" element={<ShopPage />} />
            <ReactRouterDOM.Route path="/product/:productId" element={<ProductDetailPage />} />
            <ReactRouterDOM.Route path="/services" element={<ServicesPage />} />
            <ReactRouterDOM.Route path="/service/:serviceId" element={<ServiceDetailPage />} />
            <ReactRouterDOM.Route path="/projects" element={<ProjectsPage />} />
            <ReactRouterDOM.Route path="/blog" element={<BlogPage />} />
            <ReactRouterDOM.Route path="/article/:articleId" element={<ArticleDetailPage />} />
            <ReactRouterDOM.Route path="/about" element={<AboutPage />} />
            <ReactRouterDOM.Route path="/contact" element={<ContactPage />} />
            <ReactRouterDOM.Route path="/cart" element={<CartPage />} />
            <ReactRouterDOM.Route path="/pc-builder" element={<PCBuilderPage />} />
            <ReactRouterDOM.Route path="/pc-build-suggestions" element={<PCBuildSuggestionsPage />} />

            {/* Auth Routes */}
            <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
            <ReactRouterDOM.Route path="/register" element={<RegisterPage />} />
            <ReactRouterDOM.Route path="/checkout" element={<CheckoutPage />} />

            {/* Protected Admin Route - Updated for v6 */}
            <ReactRouterDOM.Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            <ReactRouterDOM.Route path="*" element={<NotFoundPage />} />
          </ReactRouterDOM.Routes>
        </main>
        <Footer />
        <FloatingActionButtons />
      </div>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;