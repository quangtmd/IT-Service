import React, { useEffect } from 'react';
// Fix: Use named imports from react-router-dom instead of namespace import
import { HashRouter, Routes, Route } from 'react-router-dom';
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
import CustomerOrdersPage from './pages/CustomerOrdersPage'; // New import for customer orders page
import CustomerOrderDetailPage from './pages/CustomerOrderDetailPage'; // Import the new detail page

// Auth and Admin
import AdminPage from './pages/admin/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CheckoutPage from './pages/CheckoutPage';

const App: React.FC = () => {

  return (
    // Fix: Use HashRouter directly
    <HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-bgCanvas">
        <Header />
        <main className="flex-grow pt-[168px] print:pt-0">
          {/* Fix: Use Routes directly */}
          <Routes> {/* Replaced Switch with Routes */}
            {/* Fix: Use Route directly */}
            <Route path="/" element={<HomePage />} />
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
            <Route path="/pc-build-suggestions" element={<PCBuildSuggestionsPage />} /> {/* Add new route */}

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
             <Route
              path="/account/orders"
              element={
                <ProtectedRoute>
                  <CustomerOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/orders/:orderId"
              element={
                <ProtectedRoute>
                  <CustomerOrderDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Route - Updated for v6/v7 */}
            <Route
              path="/admin/*" // Add /* to allow nested routes within AdminPage if any
              element={
                <ProtectedRoute roles={['admin', 'staff']}>
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