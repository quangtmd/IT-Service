import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import * as Constants from '../../constants.tsx';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { CustomMenuLink, SiteSettings, NavLinkItem } from '../../types';
import HeaderSearchBar from '../shared/GlobalSearch';
import MegaMenu from './MegaMenu';
import TiltCard from '../ui/TiltCard'; // Reuse TiltCard for 3D logo effect

// Styled Action Link with 3D hover effect
const HeaderActionLink: React.FC<{ to: string; icon: string; label: string; badgeCount?: number }> = ({ to, icon, label, badgeCount }) => (
    <ReactRouterDOM.Link 
        to={to} 
        className="hidden lg:flex flex-col items-center justify-center text-cyan-100 hover:text-white transition-all duration-300 text-xs font-medium space-y-1 w-[70px] text-center group relative perspective-500"
    >
        <div className="relative p-2 rounded-xl transition-all duration-300 group-hover:bg-white/10 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:translate-z-4 group-hover:scale-110">
            <i className={`fas ${icon} text-xl md:text-2xl drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]`}></i>
            {badgeCount !== undefined && badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 border border-red-400 text-white text-[10px] font-bold rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center shadow-md animate-pulse">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            )}
        </div>
        <span className="opacity-80 group-hover:opacity-100 transition-opacity">{label}</span>
    </ReactRouterDOM.Link>
);

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cart } = useCart();
  const { isAuthenticated, currentUser, logout, isLoading } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [currentNavLinks, setCurrentNavLinks] = useState<(CustomMenuLink | NavLinkItem)[]>([]);

  // Scroll detection for 3D header transformation
  useEffect(() => {
    const handleScroll = () => {
        const offset = window.scrollY;
        setIsScrolled(offset > 50);
    };
    window.addEventListener('scroll', handleScroll);
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
    navigate('/');
  };

  const mainNavLinks = finalNavLinks;
  const desktopNavLinks = mainNavLinks.filter(link => link.path !== Constants.PC_BUILDER_PATH && link.path !== '/blog');

  const renderUserAuth = (isMobile = false) => {
    if (isLoading) return <div className={`h-8 w-24 rounded-full ${isMobile ? 'bg-gray-700' : 'bg-white/10'} animate-pulse`}></div>;

    if (isAuthenticated && currentUser) {
      return (
        <div className="relative group">
          <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${isMobile ? 'text-gray-200 w-full hover:bg-white/10' : 'text-cyan-100 hover:text-white hover:bg-white/10 border border-transparent hover:border-cyan-500/30'}`}>
            <img src={currentUser.imageUrl || `https://ui-avatars.com/api/?name=${currentUser.username.charAt(0)}&background=random`} alt="avatar" className="w-7 h-7 rounded-full border border-cyan-500/50" />
            <span className={`text-xs font-semibold ${isMobile ? '' : 'hidden md:inline'}`}>{currentUser.username}</span>
            <i className="fas fa-chevron-down text-[10px] transition-transform duration-200 group-hover:rotate-180"></i>
          </button>
          
          {/* Dropdown with glassmorphism */}
          <div className={`absolute right-0 w-56 backdrop-blur-xl bg-slate-900/90 border border-cyan-500/20 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] py-2 z-50 transition-all duration-200 transform origin-top-right ${isMobile ? 'static w-full mt-2 opacity-100 scale-100' : 'absolute top-full mt-2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'}`}>
            <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-bold text-white">{currentUser.username}</p>
                <p className="text-xs text-cyan-300/70 truncate">{currentUser.email}</p>
            </div>
            {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                <ReactRouterDOM.Link to="/admin" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                    <i className="fas fa-shield-alt w-6 text-cyan-400"></i>Quản trị
                </ReactRouterDOM.Link>
            )}
             <ReactRouterDOM.Link to="/account/orders" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <i className="fas fa-box w-6 text-cyan-400"></i>Đơn hàng của tôi
            </ReactRouterDOM.Link>
            <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors">
                <i className="fas fa-sign-out-alt w-6"></i>Đăng xuất
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-3 ${isMobile ? 'flex-col w-full' : ''}`}>
        <ReactRouterDOM.Link to="/login" className={`${isMobile ? 'w-full' : ''}`}>
          <Button variant="ghost" size='sm' className={`w-full font-semibold ${isMobile ? 'text-gray-200' : 'text-cyan-100 hover:text-white hover:bg-white/10'}`}>Đăng nhập</Button>
        </ReactRouterDOM.Link>
        <ReactRouterDOM.Link to="/register" className={`${isMobile ? 'w-full' : ''}`}>
          <Button variant='primary' size='sm' className={`w-full shadow-lg hover:shadow-cyan-500/20 bg-gradient-to-r from-cyan-600 to-blue-600 border-none ${isMobile ? '' : ''}`}>Đăng ký</Button>
        </ReactRouterDOM.Link>
      </div>
    );
  };

  return (
    <>
      {/* 3D HEADER CONTAINER */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] 
            ${isScrolled ? 'pt-0' : 'pt-2 md:pt-4'} 
            perspective-[1000px]`}
      >
        {/* Floating Glass Panel */}
        <div 
            className={`
                relative mx-auto transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isScrolled 
                    ? 'w-full rounded-none bg-slate-900/95 shadow-xl border-b border-cyan-500/30' 
                    : 'w-[95%] max-w-[1400px] rounded-2xl bg-slate-900/80 mt-0 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border border-white/10'
                }
                backdrop-blur-xl
            `}
            style={{
                transform: isScrolled ? 'rotateX(0deg)' : 'rotateX(0.5deg)', // Subtle tilt when not scrolled
                transformOrigin: 'top center',
            }}
        >
            {/* Top Info Bar - Collapses on scroll */}
            <div className={`
                flex justify-between items-center px-4 md:px-6 transition-all duration-300 border-b border-white/5
                ${isScrolled ? 'h-0 opacity-0 overflow-hidden py-0' : 'h-10 opacity-100 py-1'}
            `}>
                 <div className="flex items-center gap-4 text-xs font-medium text-cyan-200/80">
                    {siteSettings.companyPhone && <span className="hover:text-cyan-300 transition-colors"><i className="fas fa-phone-alt mr-1.5 animate-pulse"></i>{siteSettings.companyPhone}</span>}
                    {siteSettings.companyEmail && <span className="hidden sm:inline hover:text-cyan-300 transition-colors"><i className="fas fa-envelope mr-1.5"></i>{siteSettings.companyEmail}</span>}
                </div>
                <div className="hidden lg:block">
                     {renderUserAuth()}
                </div>
            </div>

            {/* Main Header Content */}
            <div className="px-4 md:px-6 py-3 md:py-4">
                <div className="flex items-center justify-between gap-6 md:gap-8">
                    {/* Logo with 3D Tilt */}
                    <div className="flex-shrink-0 relative group">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <TiltCard className="!p-0 !bg-transparent !border-none !shadow-none cursor-pointer">
                            <ReactRouterDOM.Link to="/" className="block transform transition-transform duration-300 group-hover:scale-105">
                                <svg width="140" height="50" viewBox="0 0 140 50" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                    <defs>
                                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#22d3ee" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                    <style>{`.logo-main { font-family: Impact, sans-serif; font-size: 40px; fill: url(#logoGradient); font-style: italic; } .logo-white { font-family: Impact, sans-serif; font-size: 40px; fill: #ffffff; font-style: italic; } .logo-sub { font-family: 'Arial', sans-serif; font-weight: 700; font-size: 11px; fill: #94a3b8; letter-spacing: 3px; }`}</style>
                                    <text x="0" y="35" className="logo-main">IQ</text>
                                    <text x="42" y="35" className="logo-white">TECH</text>
                                    <text x="42" y="48" className="logo-sub">TECHNOLOGY</text>
                                    <rect x="0" y="42" width="35" height="3" fill="#22d3ee" className="animate-pulse" />
                                </svg>
                            </ReactRouterDOM.Link>
                        </TiltCard>
                    </div>
                    
                    {/* Search Bar - Integrated Glass Style */}
                    <div className="hidden lg:block flex-grow max-w-2xl transform transition-all hover:scale-[1.01]">
                        <HeaderSearchBar variant="glass" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <HeaderActionLink to="/blog" icon="fa-newspaper" label="Tin tức" />
                        <HeaderActionLink to={Constants.PC_BUILDER_PATH} icon="fa-tools" label="Build PC" />
                        <HeaderActionLink to="/cart" icon="fa-shopping-cart" label="Giỏ hàng" badgeCount={totalItemsInCart} />
                        
                        {/* Mobile Menu Toggle */}
                        <button 
                            className="lg:hidden w-10 h-10 flex items-center justify-center text-cyan-400 hover:text-white bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-transparent hover:border-cyan-500/30" 
                            onClick={() => setIsMobileMenuOpen(true)} 
                            aria-label="Mở menu"
                        >
                            <i className="fas fa-bars text-xl"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Bar - 3D Shelf Look */}
            <div className={`hidden lg:block border-t border-white/5 transition-all duration-300 ${isScrolled ? 'bg-slate-950/50' : 'bg-transparent'}`}>
                <div className="px-6">
                    <nav className="flex items-center gap-1 justify-center relative">
                        {/* Glowing line at top of nav */}
                        {isScrolled && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>}
                        
                        {desktopNavLinks.map((link) => {
                             if (link.path === '/shop') {
                                return <MegaMenu key={link.path} />;
                              }
                            return (
                                <ReactRouterDOM.NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) => `
                                        relative px-5 py-3 text-sm font-bold uppercase tracking-wide transition-all duration-300
                                        ${isActive ? 'text-white text-shadow-cyan' : 'text-gray-400 hover:text-cyan-300'}
                                        group overflow-hidden
                                    `}
                                    end={link.path === "/"}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span className="relative z-10 flex items-center gap-2">
                                                {link.icon && typeof link.icon === 'string' && <i className={`${link.icon} text-xs`}></i>}
                                                {link.label}
                                            </span>
                                            
                                            {/* Hover/Active Effect Background */}
                                            <div className={`absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent opacity-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
                                            
                                            {/* Bottom Highlight Line */}
                                            <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
                                        </>
                                    )}
                                </ReactRouterDOM.NavLink>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu Panel - Cyberpunk Style */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#0b1120] border-l border-cyan-500/20 shadow-2xl z-[70] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="p-5 flex justify-between items-center border-b border-white/10 bg-black/20">
                <h3 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span> MENU
                </h3>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
          
            <div className="p-5 border-b border-white/10">
                <HeaderSearchBar variant="glass" />
            </div>

            <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                {mainNavLinks.map((link) => (
                <ReactRouterDOM.NavLink 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={({ isActive }) => `
                        flex items-center text-base font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-transparent
                        ${isActive 
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' 
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }
                    `} 
                    end={link.path === "/"}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${link.path === window.location.pathname ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-400'}`}>
                        {link.icon && typeof link.icon === 'string' && <i className={`${link.icon} text-sm`}></i>}
                    </div>
                    {link.label}
                </ReactRouterDOM.NavLink>
                ))}
            </nav>

            <div className="p-5 border-t border-white/10 space-y-4 bg-black/20">
                {renderUserAuth(true)}
            </div>
        </div>
      </div>
    </>
  );
};

export default Header;