import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // Updated imports for v6/v7
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
import { PCBuilderPage } from './pages/PCBuilderPage'; // Fix: Changed named import to default export.
import ProjectsPage from './pages/ProjectsPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/shared/ScrollToTop';
import FloatingActionButtons from './components/shared/FloatingActionButtons';
import PCBuildSuggestionsPage from './pages/PCBuildSuggestionsPage'; // Import the new page

// Auth and Admin
import AdminPage from './pages/admin/AdminPage';
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
        <main className="flex-grow pt-[168px] print:pt-0">
          <ReactRouterDOM.Routes> {/* Replaced Switch with Routes */}
            <ReactRouterDOM.Route path="/" element={<HomePage />} />
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
            <ReactRouterDOM.Route path="/pc-build-suggestions" element={<PCBuildSuggestionsPage />} /> {/* Add new route */}

            {/* Auth Routes */}
            <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
            <ReactRouterDOM.Route path="/register" element={<RegisterPage />} />
            <ReactRouterDOM.Route path="/checkout" element={<CheckoutPage />} />

            {/* Protected Admin Route - Updated for v6/v7 */}
            <ReactRouterDOM.Route
              path="/admin/*" // Add /* to allow nested routes within AdminPage if any
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