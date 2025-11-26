
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

// 3D/Cyberpunk Action Link Component
const HeaderActionLink: React.FC<{ to: string; icon: string; label: string; badgeCount?: number }> = ({ to, icon, label, badgeCount }) => (
    <Link to={to} className="hidden lg:flex flex-col items-center justify-center text-cyan-400/70 hover:text-cyan-300 transition-all duration-300 group relative w-[70px] h-full">
        <div className="relative p-1">
            <i className={`fas ${icon} text-xl transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]`}></i>
            {badgeCount && badgeCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold rounded-sm h-4 min-w-[1rem] px-1 flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.8)] border border-red-400 animate-pulse">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            ) : null}
        </div>
        <span className="text-[9px] uppercase font-bold tracking-wider mt-1 group-hover:text-cyan-200">{label}</span>
        
        {/* Hover underline effect */}
        <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-cyan-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
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
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
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

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const mainNavLinks = finalNavLinks;
  const desktopNavLinks = mainNavLinks.filter(link => link.path !== Constants.PC_BUILDER_PATH && link.path !== '/blog');

  const renderUserAuth = (isMobile = false) => {
    if (isLoading) return <div className={`h-6 w-24 rounded bg-cyan-900/50 animate-pulse border border-cyan-500/30`}></div>;

    if (isAuthenticated && currentUser) {
      return (
        <div className="relative group z-50">
          <button className={`flex items-center gap-2 ${isMobile ? 'text-cyan-100' : 'text-cyan-400 hover:text-cyan-200'} transition-colors`}>
            <div className="relative">
                <img src={currentUser.imageUrl || `https://ui-avatars.com/api/?name=${currentUser.username.charAt(0)}&background=000&color=0ff`} alt="avatar" className="w-8 h-8 rounded-sm border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black"></div>
            </div>
            <span className={`text-xs font-bold uppercase tracking-wide ${isMobile ? '' : 'hidden md:inline'}`}>{currentUser.username}</span>
            <i className="fas fa-caret-down text-xs ml-1"></i>
          </button>
          
          {/* Dropdown Menu */}
          <div className={`absolute top-full right-0 mt-2 w-56 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-br-lg rounded-bl-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto transform origin-top-right scale-95 group-hover:scale-100`}>
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500"></div>

            <div className="px-4 py-3 border-b border-cyan-500/20 bg-cyan-500/5">
                <p className="text-sm font-bold text-cyan-300 truncate">{currentUser.username}</p>
                <p className="text-[10px] text-cyan-500/70 truncate font-mono">{currentUser.email}</p>
            </div>
            {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                <Link to="/admin" className="flex items-center px-4 py-2.5 text-xs font-semibold text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors border-l-2 border-transparent hover:border-cyan-400">
                    <i className="fas fa-shield-alt w-6 text-center"></i>TRUNG TÂM QUẢN TRỊ
                </Link>
            )}
            <Link to="/account/orders" className="flex items-center px-4 py-2.5 text-xs font-semibold text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors border-l-2 border-transparent hover:border-cyan-400">
                <i className="fas fa-history w-6 text-center"></i>LỊCH SỬ ĐƠN HÀNG
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border-l-2 border-transparent hover:border-red-500 text-left">
                <i className="fas fa-power-off w-6 text-center"></i>ĐĂNG XUẤT
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 ${isMobile ? 'flex-col w-full mt-4' : ''}`}>
        <Link to="/login" className={`${isMobile ? 'w-full' : ''}`}>
          <Button variant={isMobile ? 'outline' : 'ghost'} size='sm' className={`w-full ${isMobile ? 'border-cyan-500/30 text-cyan-300' : 'text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10 font-bold uppercase tracking-wider text-xs'}`}>
            <i className="fas fa-sign-in-alt mr-2"></i> Đăng nhập
          </Button>
        </Link>
        <Link to="/register" className={`${isMobile ? 'w-full' : ''}`}>
          <Button variant='primary' size='sm' className="w-full bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] text-xs font-bold uppercase tracking-wider">
            Đăng ký
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-0' : 'py-2'}`}>
        
        {/* TOP HUD BAR */}
        <div className="bg-slate-950 text-cyan-500/60 text-[10px] h-8 border-b border-cyan-500/20 relative overflow-hidden font-mono tracking-wider hidden md:block">
           <div className="container mx-auto px-4 h-full flex justify-between items-center">
              <div className="flex items-center gap-6">
                  <span className="flex items-center"><i className="fas fa-wifi mr-2 animate-pulse text-green-500"></i> SYSTEM ONLINE</span>
                  {siteSettings.companyPhone && <span className="hover:text-cyan-300 transition-colors cursor-pointer"><i className="fas fa-phone-alt mr-1"></i> {siteSettings.companyPhone}</span>}
                  {siteSettings.companyEmail && <span className="hover:text-cyan-300 transition-colors cursor-pointer"><i className="fas fa-envelope mr-1"></i> {siteSettings.companyEmail}</span>}
              </div>
              <div className="flex items-center gap-6">
                 <span>SECURE CONNECTION: <strong className="text-green-500">ENCRYPTED</strong></span>
                 <div className="flex items-center gap-4">
                    {renderUserAuth()}
                 </div>
              </div>
           </div>
           {/* Scanline animation */}
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-20 animate-scanline pointer-events-none"></div>
        </div>

        {/* MAIN COMMAND CENTER HEADER */}
        <div className={`bg-slate-900/90 backdrop-blur-xl border-b border-cyan-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-500 relative ${scrolled ? 'h-16' : 'h-20'}`}>
          {/* Glow effect underneath */}
          <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          
          <div className="container mx-auto px-4 flex items-center justify-between h-full gap-6">
            
            {/* LOGO */}
            <Link to="/" className="flex-shrink-0 group relative">
                <div className="relative z-10 flex items-center gap-2">
                     <div className="w-10 h-10 bg-cyan-600 rounded flex items-center justify-center text-white font-black text-2xl italic transform -skew-x-12 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] group-hover:shadow-[0_0_25px_rgba(6,182,212,1)] transition-all duration-300">
                        IQ
                     </div>
                     <div className="flex flex-col">
                        <span className="text-2xl font-black italic tracking-tighter text-white leading-none group-hover:text-cyan-300 transition-colors filter drop-shadow-lg">TECH</span>
                        <span className="text-[9px] font-bold tracking-[0.2em] text-cyan-500 uppercase leading-none group-hover:text-cyan-200 transition-colors">Technology</span>
                     </div>
                </div>
            </Link>
            
            {/* SEARCH - Centered HUD Element */}
            <div className="flex-grow max-w-2xl hidden lg:block relative group">
               {/* Decor lines */}
               <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
               <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
               <HeaderSearchBar />
            </div>
            
            {/* RIGHT ACTIONS */}
            <div className="flex items-center h-full">
              <HeaderActionLink to="/blog" icon="fa-newspaper" label="News Feed" />
              <HeaderActionLink to={Constants.PC_BUILDER_PATH} icon="fa-microchip" label="PC Builder" />
              <HeaderActionLink to="/cart" icon="fa-shopping-cart" label="Cart" badgeCount={totalItemsInCart} />
              
              {/* Mobile Menu Toggle */}
              <button className="lg:hidden ml-4 text-cyan-400 text-2xl hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* HOLOGRAPHIC NAV BAR */}
        <nav className={`bg-slate-950/95 border-b border-white/5 relative hidden lg:block transition-all duration-500 ${scrolled ? 'h-10' : 'h-12'}`}>
          <div className="container mx-auto h-full flex items-center justify-center">
             <div className="flex h-full">
                {desktopNavLinks.map((link) => {
                    if (link.path === '/shop') {
                        return <MegaMenu key={link.path} />;
                    }
                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => `
                                relative h-full px-6 flex items-center text-xs font-bold uppercase tracking-widest transition-all duration-300 group overflow-hidden
                                ${isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-300'}
                            `}
                            end={link.path === "/"}
                        >
                            {/* Hover Background Sweep */}
                            <span className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            
                            {/* Active Indicator */}
                            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_10px_cyan] transform transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100`}></span>
                            <NavLink to={link.path} className={({isActive}) => isActive ? "absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_10px_cyan] scale-x-100" : "hidden"} />

                            <span className="relative z-10 flex items-center gap-2">
                                {link.icon && <i className={`${link.icon} text-sm opacity-70 group-hover:opacity-100`}></i>}
                                {link.label}
                            </span>
                        </NavLink>
                    );
                })}
             </div>
          </div>
        </nav>

      </header>

      {/* MOBILE MENU - CYBERPUNK DRAWER */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#0B1120] border-l border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] z-[60] transform transition-transform duration-300 ease-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Tech Background Grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <div className="flex flex-col h-full relative z-10">
          <div className="p-5 flex justify-between items-center border-b border-cyan-500/20 bg-cyan-950/20">
             <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                <h3 className="text-lg font-bold text-white tracking-widest uppercase">System Menu</h3>
             </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="p-5 border-b border-white/5">
            <HeaderSearchBar />
          </div>

          <nav className="flex-grow p-5 space-y-2 overflow-y-auto">
            {mainNavLinks.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={({ isActive }) => `
                    flex items-center p-3 rounded-lg border transition-all duration-300 group
                    ${isActive 
                        ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white'}
                `}
              >
                <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 bg-black/40 border border-white/10 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors`}>
                     <i className={`${link.icon || 'fas fa-circle'} text-sm`}></i>
                </div>
                <span className="font-bold tracking-wide text-sm">{link.label}</span>
                <i className="fas fa-chevron-right ml-auto text-xs opacity-50 group-hover:translate-x-1 transition-transform"></i>
              </NavLink>
            ))}
             {isAuthenticated && (
              <NavLink to="/account/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 rounded-lg border border-cyan-500/30 bg-cyan-900/20 text-cyan-300 mt-4">
                <div className="w-8 h-8 rounded flex items-center justify-center mr-3 bg-black/40 border border-cyan-500/30 text-cyan-400">
                    <i className="fas fa-receipt text-sm"></i>
                </div>
                <span className="font-bold tracking-wide text-sm">Đơn hàng của tôi</span>
              </NavLink>
            )}
          </nav>

          <div className="p-5 border-t border-white/10 bg-black/20">
             {renderUserAuth(true)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
