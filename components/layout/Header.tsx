

import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import * as Constants from '../../constants.tsx';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { CustomMenuLink, SiteSettings, NavLinkItem } from '../../types';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const { isAuthenticated, currentUser, logout, isLoading, adminNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [currentNavLinks, setCurrentNavLinks] = useState<(CustomMenuLink | NavLinkItem)[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const isSolid = isScrolled || location.pathname !== '/';
  const textColor = isSolid ? 'text-gray-800' : 'text-white';

  const unreadAdminNotificationCount = adminNotifications.filter(n => !n.isRead && (currentUser?.role === 'admin' || currentUser?.role === 'staff')).length;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = useCallback(() => {
    const storedSettings = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    const currentSiteSettings = storedSettings ? JSON.parse(storedSettings) : Constants.INITIAL_SITE_SETTINGS;
    setSiteSettings(currentSiteSettings);

    const storedMenu = localStorage.getItem(Constants.CUSTOM_MENU_STORAGE_KEY);
    let linksSource: (CustomMenuLink | NavLinkItem)[] = [];
    if (storedMenu) {
      linksSource = JSON.parse(storedMenu).filter((l: CustomMenuLink) => l.isVisible).sort((a: CustomMenuLink, b: CustomMenuLink) => a.order - b.order);
    } else {
      linksSource = Constants.INITIAL_CUSTOM_MENU_LINKS.filter(l => l.isVisible).sort((a, b) => a.order - b.order);
    }
    setCurrentNavLinks(linksSource);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('siteSettingsUpdated', loadData);
    window.addEventListener('menuUpdated', loadData);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadData);
      window.removeEventListener('menuUpdated', loadData);
    };
  }, [loadData, isAuthenticated]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const displayLogo = siteSettings.siteLogoUrl || siteSettings.siteFaviconUrl;

  const renderNavLink = (link: CustomMenuLink | NavLinkItem, isMobile: boolean = false) => {
    const showNotificationBadge = link.path === '/admin' && isAuthenticated && (currentUser?.role === 'admin' || currentUser?.role === 'staff') && unreadAdminNotificationCount > 0;
    
    if (isMobile) {
      return (
        <NavLink
          key={link.path}
          to={link.path}
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => 
            `flex items-center text-lg py-3 px-4 rounded-md transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-200 hover:bg-white/10'}`
          }
          end={link.path === "/"}
        >
          {link.icon && typeof link.icon === 'string' && <i className={`${link.icon} mr-4 w-5 text-center`}></i>}
          {link.label}
        </NavLink>
      );
    }

    // Desktop Nav Link
    return (
      <NavLink
        key={link.path}
        to={link.path}
        className={({ isActive }) => 
          `relative px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${textColor} ${isActive ? (isSolid ? 'bg-primary/10 text-primary' : 'bg-white/20') : (isSolid ? 'hover:bg-gray-100' : 'hover:bg-white/10')}`
        }
        end={link.path === "/"}
      >
        <div className="flex items-center">
            {link.label}
            {showNotificationBadge && (
            <span className="ml-1.5 bg-secondary text-white text-[10px] font-bold rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center">
                {unreadAdminNotificationCount > 9 ? '9+' : unreadAdminNotificationCount}
            </span>
            )}
        </div>
      </NavLink>
    );
  };
  
  const headerClasses = `fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${isSolid ? 'bg-white shadow-lg py-3' : 'bg-transparent py-5'}`;

  return (
    <>
      <header className={headerClasses}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center shrink-0">
              {displayLogo ? (
                <img src={displayLogo} alt={`${siteSettings.companyName} Logo`} className="h-10 max-w-[150px] object-contain mr-2 transition-all" />
              ) : (
                <span className={`text-2xl font-bold transition-colors ${textColor}`}>{siteSettings.companyName}</span>
              )}
            </Link>

            <nav className="hidden lg:flex flex-1 justify-center items-center space-x-2">
              {currentNavLinks.map((link) => renderNavLink(link))}
              {isAuthenticated && (currentUser?.role === 'admin' || currentUser?.role === 'staff') && renderNavLink({label: 'Quản trị', path: '/admin'})}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-2 shrink-0">
                  {!isLoading && (
                      <>
                          {isAuthenticated && currentUser ? (
                              <div className="relative group">
                                  <button className={`flex items-center space-x-2 transition-colors duration-200 ease-in-out hover:text-primary ${textColor}`}>
                                      <img src={currentUser.imageUrl || `https://ui-avatars.com/api/?name=${currentUser.username.charAt(0)}&background=random`} alt="avatar" className="w-8 h-8 rounded-full"/>
                                      <span className="text-sm font-semibold">{currentUser.username}</span>
                                      <i className="fas fa-chevron-down text-xs transition-transform duration-200 group-hover:rotate-180"></i>
                                  </button>
                                  <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                    {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                                        <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-textBase hover:bg-bgMuted hover:text-primary"><i className="fas fa-user-shield w-6"></i>Trang Quản trị</Link>
                                    )}
                                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-textBase hover:bg-bgMuted hover:text-primary">
                                        <i className="fas fa-sign-out-alt w-6"></i>Đăng xuất
                                    </button>
                                  </div>
                              </div>
                          ) : (
                              <>
                                  <Link to="/login">
                                      <Button variant='ghost' size='sm' className={`${isSolid ? 'text-primary hover:bg-primary/10' : 'text-white hover:bg-white/10'}`}>Đăng nhập</Button>
                                  </Link>
                                  <Link to="/register">
                                       <Button variant='primary' size='sm' className="shadow-md hover:shadow-lg hover:shadow-primary/40 transition-shadow">Đăng ký</Button>
                                  </Link>
                              </>
                          )}
                      </>
                  )}
              </div>

              <Link to="/cart" className={`relative transition-colors duration-200 ease-in-out hover:text-primary ${textColor}`} title="Giỏ hàng">
                <i className="fas fa-shopping-cart text-xl"></i>
                {totalItemsInCart > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {totalItemsInCart}
                  </span>
                )}
              </Link>
              
              <button
                className={`lg:hidden text-2xl ${textColor}`}
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Mở menu"
              >
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xs bg-gray-800 shadow-xl z-50 transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
          <div className="flex flex-col h-full">
            <div className="p-4 flex justify-between items-center border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Menu</h3>
                <button
                    className="text-2xl text-gray-300 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Đóng menu"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <nav className="flex-grow p-4 space-y-2">
                {currentNavLinks.map((link) => renderNavLink(link, true))}
                {isAuthenticated && (currentUser?.role === 'admin' || currentUser?.role === 'staff') && renderNavLink({label: 'Quản trị', path: '/admin'}, true)}
            </nav>

            <div className="p-4 border-t border-gray-700 space-y-3">
                 {!isLoading && (
                    <>
                        {isAuthenticated && currentUser ? (
                            <div className='text-center'>
                                <p className="text-gray-300 mb-3 text-sm">Chào, {currentUser.username}!</p>
                                <Button onClick={handleLogout} variant="outline" className="w-full border-gray-500 text-gray-200 hover:bg-primary/20 hover:border-primary">Đăng xuất</Button>
                            </div>
                        ) : (
                            <>
                               <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
                                   <Button variant="outline" className="w-full border-gray-500 text-gray-200">Đăng nhập</Button>
                               </Link>
                               <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block">
                                   <Button variant="primary" className="w-full">Đăng ký</Button>
                               </Link>
                            </>
                        )}
                    </>
                )}
            </div>
          </div>
      </div>
    </>
  );
};

export default Header;