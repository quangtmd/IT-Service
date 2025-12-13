
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import * as Constants from '../../constants.tsx';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { CustomMenuLink, SiteSettings, NavLinkItem } from '../../types';
import HeaderSearchBar from '../shared/GlobalSearch';
import MegaMenu from './MegaMenu'; 
import { useTheme } from '../../contexts/ThemeContext';

const HeaderActionLink: React.FC<{ to: string; icon: string; label: string; badgeCount?: number }> = ({ to, icon, label, badgeCount }) => (
    <Link to={to} className="hidden lg:flex flex-col items-center text-gray-300 hover:text-cyan-400 transition-all duration-300 text-xs font-medium space-y-1 w-[70px] text-center group perspective-500">
        <div className="relative transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 group-hover:rotate-x-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
            <i className={`fas ${icon} text-2xl group-hover:text-shadow-cyan transition-colors duration-300`}></i>
            {badgeCount && badgeCount > 0 ? (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center animate-bounce shadow-md border border-red-400 z-10">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            ) : null}
        </div>
        <span className="group-hover:text-cyan-300 text-shadow-sm transition-colors">{label}</span>
    </Link>
);

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const { isAuthenticated, currentUser, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [currentNavLinks, setCurrentNavLinks] = useState<(CustomMenuLink | NavLinkItem)[]>([]);
  const [scrolled, setScrolled] = useState(false);

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
    
    const handleScroll = () => {
        setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('siteSettingsUpdated', loadData);
      window.removeEventListener('menuUpdated', loadData);
      window.removeEventListener('scroll', handleScroll);
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
          <button className={`flex items-center gap-3 ${isMobile ? 'text-gray-200' : 'text-gray-300'} hover:text-cyan-400 transition-colors p-1 pr-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10`}>
            <div className="p-0.5 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                <img src={currentUser.imageUrl || `https://ui-avatars.com/api/?name=${currentUser.username.charAt(0)}&background=random`} alt="avatar" className="w-8 h-8 rounded-full border border-black/50" />
            </div>
            <span className={`text-sm font-semibold tracking-wide ${isMobile ? '' : 'hidden md:inline'}`}>{currentUser.username}</span>
            <i className="fas fa-chevron-down text-xs transition-transform duration-200 group-hover:rotate-180 opacity-70"></i>
          </button>
          
          {/* Dropdown 3D */}
          <div className={`absolute top-full ${isMobile ? 'bottom-full top-auto' : 'right-0 mt-4'} w-64 bg-[#0f172a]/95 backdrop-blur-xl rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] py-2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto border border-white/10 transform origin-top-right scale-95 group-hover:scale-100 ring-1 ring-white/5`}>
            {/* Arrow */}
            <div className="absolute -top-1.5 right-6 w-3 h-3 bg-[#0f172a] border-l border-t border-white/10 transform rotate-45"></div>
            
            <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <p className="text-base font-bold text-white truncate">{currentUser.username}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{currentUser.email}</p>
            </div>
            
            <div className="p-2 space-y-1">
                {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                    <Link to="/admin" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-cyan-900/30 hover:to-transparent rounded-lg hover:text-cyan-400 transition-all group/item">
                        <span className="w-8 h-8 rounded-full bg-cyan-900/20 flex items-center justify-center mr-3 group-hover/item:bg-cyan-500/20 transition-colors">
                            <i className="fas fa-user-shield text-cyan-500"></i>
                        </span>
                        Quản trị hệ thống
                    </Link>
                )}
                <Link to="/account/orders" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-transparent rounded-lg hover:text-blue-400 transition-all group/item">
                     <span className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center mr-3 group-hover/item:bg-blue-500/20 transition-colors">
                        <i className="fas fa-receipt text-blue-500"></i>
                    </span>
                    Đơn hàng của tôi
                </Link>
            </div>
            
            <div className="border-t border-white/10 mt-1 p-2">
                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 rounded-lg hover:text-red-300 transition-colors text-left group/btn">
                    <i className="fas fa-sign-out-alt w-6 group-hover/btn:translate-x-1 transition-transform"></i>
                    Đăng xuất
                </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-3 ${isMobile ? 'flex-col w-full' : ''}`}>
        <Link to="/login" className={`${isMobile ? 'w-full' : ''}`}>
          <Button variant={isMobile ? 'outline' : 'ghost'} size='sm' className={`w-full font-medium ${isMobile ? 'border-gray-500 text-gray-200' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Đăng nhập</Button>
        </Link>
        <Link to="/register" className={`${isMobile ? 'w-full' : ''}`}>
          <Button variant='primary' size='sm' className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] border-none font-bold tracking-wide">
             Đăng ký
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b backdrop-blur-xl ${
            scrolled 
            ? 'bg-[#020617]/95 border-cyan-500/20 py-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]' 
            : 'bg-[#0B1120]/80 border-white/5 py-3'
        }`}
      >
        {/* Glowing Top Line */}
        <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}></div>

        {/* TOP BAR - INFO */}
        <div className={`container mx-auto px-4 flex justify-between items-center transition-all duration-500 overflow-hidden ${scrolled ? 'h-0 opacity-0 mb-0' : 'h-8 opacity-100 mb-1'} border-b border-white/5`}>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              {siteSettings.companyPhone && (
                <span className="hover:text-cyan-400 cursor-pointer transition-colors flex items-center gap-2 group">
                    <i className="fas fa-phone-alt text-cyan-600 group-hover:text-cyan-400 animate-pulse"></i> 
                    {siteSettings.companyPhone}
                </span>
              )}
              {siteSettings.companyEmail && (
                <span className="hidden sm:flex hover:text-cyan-400 cursor-pointer transition-colors items-center gap-2 group">
                    <i className="fas fa-envelope text-cyan-600 group-hover:text-cyan-400"></i> 
                    {siteSettings.companyEmail}
                </span>
              )}
            </div>
            <div className="hidden lg:flex items-center gap-6 text-xs">
                {renderUserAuth()}
            </div>
        </div>

        {/* MAIN HEADER CONTENT */}
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-6 h-16">
                
                {/* 3D LOGO */}
                <Link to="/" className="flex-shrink-0 group relative perspective-500 z-50">
                    <div className="transform transition-transform duration-500 group-hover:rotate-x-12 group-hover:scale-105 group-hover:translate-z-10">
                        <div className="absolute -inset-4 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <svg width="160" height="50" viewBox="0 0 130 45" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl filter relative z-10">
                            <defs>
                                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{stopColor:'#22d3ee', stopOpacity:1}} />
                                    <stop offset="100%" style={{stopColor:'#3b82f6', stopOpacity:1}} />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            <text x="0" y="32" className="font-black text-4xl italic fill-[url(#logoGradient)] filter-[url(#glow)]" style={{fontFamily: 'Impact, sans-serif'}}>IQ</text>
                            <text x="38" y="32" className="font-black text-4xl italic fill-white" style={{fontFamily: 'Impact, sans-serif', textShadow: '0 0 10px rgba(255,255,255,0.5)'}}>TECH</text>
                            <text x="38" y="44" className="font-bold text-[10px] fill-slate-400 tracking-[0.3em]" style={{fontFamily: 'Arial, sans-serif'}}>TECHNOLOGY</text>
                        </svg>
                    </div>
                </Link>
                
                {/* SEARCH BAR - Floating */}
                <div className="flex-grow max-w-xl hidden lg:block transform transition-all duration-300 hover:-translate-y-0.5 z-40">
                    <div className="relative group">
                         {/* Search Glow */}
                         <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-10 group-hover:opacity-50 transition duration-500"></div>
                         <div className="relative bg-[#0F172A] rounded-lg border border-white/10 shadow-inner">
                             <HeaderSearchBar />
                         </div>
                    </div>
                </div>
                
                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-2 xl:gap-6 z-40">
                    <HeaderActionLink to="/blog" icon="fa-newspaper" label="Tin tức" />
                    <HeaderActionLink to={Constants.PC_BUILDER_PATH} icon="fa-tools" label="Build PC" />
                    <HeaderActionLink to="/cart" icon="fa-shopping-cart" label="Giỏ hàng" badgeCount={totalItemsInCart} />
                </div>
                
                {/* Mobile Menu Button */}
                <button className="lg:hidden text-2xl text-white hover:text-cyan-400 transition-colors p-2 z-50" onClick={() => setIsMobileMenuOpen(true)} aria-label="Mở menu">
                    <i className="fas fa-bars"></i>
                </button>
            </div>
        </div>
        
        {/* DESKTOP NAVIGATION - 3D Floating Bar */}
        <div className="hidden lg:block relative z-30 mt-2">
            <div className="container mx-auto px-4">
                 <nav className="flex items-center justify-center gap-2 h-10">
                    {desktopNavLinks.map((link) => {
                    if (link.path === '/shop') {
                        return <MegaMenu key={link.path} />;
                    }
                    return (
                        <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => `
                            relative px-5 py-1.5 text-sm font-bold uppercase tracking-wider transition-all duration-300 rounded-full
                            ${isActive 
                                ? 'text-cyan-300 bg-white/5 shadow-[0_0_15px_rgba(34,211,238,0.2)] border border-cyan-500/30' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'}
                            group overflow-hidden
                        `}
                        end={link.path === "/"}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {link.icon && typeof link.icon === 'string' && <i className={`${link.icon} opacity-70 group-hover:opacity-100 transition-opacity text-xs`}></i>}
                                {link.label}
                            </span>
                            {/* Hover Sweep Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                        </NavLink>
                    );
                    })}
                </nav>
            </div>
        </div>

      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#0B1120] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-white/10 flex flex-col`}>
        
        {/* Mobile Header */}
        <div className="p-5 flex justify-between items-center border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-950">
            <div className="flex items-center gap-3">
                <span className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></span>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">MENU</h3>
            </div>
            <button className="text-2xl text-gray-400 hover:text-white transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10" onClick={() => setIsMobileMenuOpen(false)} aria-label="Đóng menu">
                <i className="fas fa-times"></i>
            </button>
        </div>
        
        {/* Mobile Search */}
        <div className="p-5 border-b border-white/10 bg-[#020617]">
            <HeaderSearchBar />
        </div>

        {/* Mobile Links */}
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto bg-[#0B1120]">
            {mainNavLinks.map((link) => (
              <NavLink key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} 
                className={({ isActive }) => `flex items-center text-base font-medium py-4 px-5 rounded-xl transition-all duration-300 border border-transparent ${isActive ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-lg' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`} end={link.path === "/"}>
                {link.icon && typeof link.icon === 'string' && <i className={`${link.icon} mr-4 w-6 text-center text-lg`}></i>}
                {link.label}
                <i className="fas fa-chevron-right ml-auto text-xs opacity-30"></i>
              </NavLink>
            ))}
             {isAuthenticated && (
              <NavLink to="/account/orders" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center text-base font-medium py-4 px-5 rounded-xl transition-all duration-300 border border-transparent ${isActive ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                <i className="fas fa-receipt mr-4 w-6 text-center text-lg"></i>
                Đơn hàng của tôi
              </NavLink>
            )}
        </nav>

        {/* Mobile Auth */}
        <div className="p-6 border-t border-white/10 bg-[#020617]">
            {renderUserAuth(true)}
        </div>
      </div>
    </>
  );
};

export default Header;
