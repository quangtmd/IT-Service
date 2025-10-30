
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Update react-router-dom from v5 to v6. Replaced useHistory with useNavigate.
import { Link, NavLink, useNavigate } from 'react-router-dom';
import * as Constants from '../../constants.tsx';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { CustomMenuLink, SiteSettings, NavLinkItem } from '../../types';
import HeaderSearchBar from '../shared/GlobalSearch';
import MegaMenu from './MegaMenu'; // Import the new MegaMenu component

// New component for right-side action links, styled as per the image
const HeaderActionLink: React.FC<{ to: string; icon: string; label: string; badgeCount?: number }> = ({ to, icon, label, badgeCount }) => (
    <Link to={to} className="hidden lg:flex flex-col items-center text-white hover:text-primary transition-colors text-xs font-medium space-y-1 w-[70px] text-center">
        <div className="relative">
            <i className={`fas ${icon} text-2xl`}></i>
            {badgeCount && badgeCount > 0 ? (
                <span className="absolute -top-1 -right-2 bg-secondary text-white text-[10px] font-bold rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            ) : null}
        </div>
        <span>{label}</span>
    </Link>
);

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const { isAuthenticated, currentUser, logout, isLoading } = useAuth();
  // FIX: Use useNavigate hook for react-router-dom v6
  const navigate = useNavigate();
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [currentNavLinks, setCurrentNavLinks] = useState<(CustomMenuLink | NavLinkItem)[]>([]);

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
  }, [loadData]);

  const finalNavLinks = useMemo(() => {
    return currentNavLinks.filter(link => link.path !== '/admin');
  }, [currentNavLinks]);


  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    // FIX: Use navigate for navigation in v6
    navigate('/home');
  };

  const mainNavLinks = finalNavLinks;
  const desktopNavLinks = mainNavLinks.filter(link => link.path !== Constants.PC_BUILDER_PATH && link.path !== '/blog');

  const renderUserAuth = (isMobile = false) => {
    if (isLoading) return <div className={`h-6 w-24 rounded ${isMobile ? 'bg-gray-700' : 'bg-red-700/50'} animate-pulse`}></div>;

    if (isAuthenticated && currentUser) {
      return (
        <div className="relative group">
          <button className={`flex items-center gap-2 ${isMobile ? 'text-gray-200' : 'text-white'}`}>
            <img src={currentUser.imageUrl || `https://ui-avatars.com/api/?name=${currentUser.username.charAt(0)}&background=random`} alt="avatar" className="w-6 h-6 rounded-full" />
            <span className={`text-xs font-semibold ${isMobile ? '' : 'hidden md:inline'}`}>{currentUser.username}</span>
            <i className="fas fa-chevron-down text-xs transition-transform duration-200 group-hover:rotate-180"></i>
          </button>
          <div className={`absolute top-full ${isMobile ? 'bottom-full top-auto' : 'right-0 mt-2'} w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto`}>
            <div className="px-3 py-2 border-b border-gray-200">
                <p className="text-sm font-semibold text-textBase">{currentUser.username}</p>
                <p className="text-xs text-textMuted truncate">{currentUser.email}</p>
            </div>
            {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                <Link to="/admin" className="flex items-center px-3 py-2 text-sm text-textBase hover:bg-bgMuted"><i className="fas fa-user-shield w-6"></i>Quản trị</Link>
            )}
            <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm text-textBase hover:bg-bgMuted">
                <i className="fas fa-sign-out-alt w-6"></i>Đăng xuất
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-3 ${isMobile ? 'flex-col w-full' : ''}`}>
        <Link to="/login" className={`${isMobile ? 'w-full' : ''}`}>
          <Button variant={isMobile ? 'outline' : 'ghost'} size='sm' className={`w-full ${isMobile ? 'border-gray-500 text-gray-200' : 'text-white hover:bg-white/20'}`}>Đăng nhập</Button>
        </Link>
        <Link to="/register" className={`${isMobile ? 'w-full' : ''}`}>
          <Button variant='secondary' size='sm' className="w-full">Đăng ký</Button>
        </Link>
      </div>
    );
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 shadow-lg">
        {/* TOP BAR */}
        <div className="bg-primary text-white text-xs h-8">
          <div className="container mx-auto px-4 h-full flex justify-between items-center">
            <div className="flex items-center gap-4">
              {siteSettings.companyPhone && <span><i className="fas fa-phone-alt mr-1"></i> {siteSettings.companyPhone}</span>}
              {siteSettings.companyEmail && <span className="hidden sm:inline"><i className="fas fa-envelope mr-1"></i> {siteSettings.companyEmail}</span>}
            </div>
            <div className="hidden lg:block">
              {renderUserAuth()}
            </div>
          </div>
        </div>

        {/* MAIN HEADER */}
        <div className="bg-black text-white">
          <div className="container mx-auto px-4 flex items-center justify-between gap-4 h-20">
            <Link to="/home" className="flex-shrink-0">
              <svg width="125" height="45" viewBox="0 0 125 45" xmlns="http://www.w3.org/2000/svg">
                  <style>{`.logo-main-red { font-family: Impact, sans-serif; font-size: 36px; fill: var(--color-primary-default); font-style: italic; } .logo-main-white { font-family: Impact, sans-serif; font-size: 36px; fill: #ffffff; font-style: italic; } .logo-sub { font-family: 'Arial Narrow', Arial, sans-serif; font-size: 10px; fill: #ffffff; letter-spacing: 2px; }`}</style>
                  <text x="0" y="30" className="logo-main-red">IQ</text>
                  <text x="38" y="30" className="logo-main-white">TECH</text>
                  <text x="38" y="42" className="logo-sub">TECHNOLOGY</text>
              </svg>
            </Link>
            
            <div className="flex-grow max-w-2xl hidden lg:block">
              <HeaderSearchBar />
            </div>
            
            <div className="flex items-center gap-4">
              <HeaderActionLink to="/blog" icon="fa-newspaper" label="Tin tức" />
              <HeaderActionLink to={Constants.PC_BUILDER_PATH} icon="fa-tools" label="Xây dựng PC" />
              <HeaderActionLink to="/cart" icon="fa-shopping-cart" label="Giỏ hàng" badgeCount={totalItemsInCart} />
            </div>
            
            <button className="lg:hidden text-2xl text-white" onClick={() => setIsMobileMenuOpen(true)} aria-label="Mở menu">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
        
        {/* MAIN NAVIGATION BAR */}
        <nav className="main-navbar">
          <div className="main-navbar-links">
            {desktopNavLinks.map((link) => {
              if (link.path === '/shop') {
                return <MegaMenu key={link.path} />;
              }
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                  end={link.path === "/home"}
                >
                  {link.icon && typeof link.icon === 'string' && <i className={`${link.icon} mr-2`}></i>}
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-xs bg-gray-800 shadow-xl z-50 transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Menu</h3>
            <button className="text-2xl text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)} aria-label="Đóng menu"><i className="fas fa-times"></i></button>
          </div>
          
          <div className="p-4 border-b border-gray-700">
            <HeaderSearchBar />
          </div>

          <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
            {mainNavLinks.map((link) => (
              <NavLink key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center text-lg py-3 px-4 rounded-md transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-200 hover:bg-white/10'}`} end={link.path === "/home"}>
                {link.icon && typeof link.icon === 'string' && <i className={`${link.icon} mr-4 w-5 text-center`}></i>}
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-700 space-y-3">
            {renderUserAuth(true)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
