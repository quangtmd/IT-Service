
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import HeaderSearchBar from '../shared/GlobalSearch';
import MegaMenu from './MegaMenu';
import * as Constants from '../../constants';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#020617]/80 backdrop-blur-md border-b border-cyan-500/20 py-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
            : 'bg-transparent py-4 border-b border-white/5'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300 transform group-hover:rotate-12">
                <span className="text-white font-black text-xl italic">IQ</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight leading-none group-hover:text-cyan-400 transition-colors">
                  TECH
                </span>
                <span className="text-[10px] text-cyan-500 uppercase tracking-widest font-semibold">
                  Technology
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1 bg-white/5 backdrop-blur-sm px-2 py-1.5 rounded-full border border-white/10">
              {Constants.NAVIGATION_LINKS_BASE.filter(l => !['/pc-builder', '/blog'].includes(l.path)).map(link => {
                 if (link.path === '/shop') return <div key="mega" className="px-1"><MegaMenu /></div>;
                 return (
                  <NavLink 
                    key={link.path}
                    to={link.path}
                    className={({isActive}) => `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </NavLink>
                 )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
               <div className="hidden lg:block w-64">
                  <HeaderSearchBar />
               </div>

               <Link to={Constants.PC_BUILDER_PATH} className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-110" title="Build PC">
                  <i className="fas fa-tools"></i>
               </Link>

               <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
                  <i className="fas fa-shopping-cart"></i>
                  {totalItemsInCart > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                      {totalItemsInCart}
                    </span>
                  )}
               </Link>

               {isAuthenticated && currentUser ? (
                 <div className="relative group hidden lg:block">
                    <button className="flex items-center gap-2 pl-2">
                       <img src={currentUser.imageUrl || `https://ui-avatars.com/api/?name=${currentUser.username}`} className="w-9 h-9 rounded-full border-2 border-cyan-500/50" alt="Avt"/>
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-56 bg-[#0f172a] border border-cyan-500/30 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                        <div className="px-4 py-3 border-b border-white/10">
                           <p className="text-white font-semibold truncate">{currentUser.username}</p>
                           <p className="text-xs text-gray-400">{currentUser.email}</p>
                        </div>
                        {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                          <Link to="/admin" className="block px-4 py-2 text-sm text-cyan-400 hover:bg-white/5"><i className="fas fa-shield-alt mr-2"></i> Quản trị</Link>
                        )}
                        <Link to="/account/orders" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5"><i className="fas fa-receipt mr-2"></i> Đơn hàng</Link>
                        <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"><i className="fas fa-sign-out-alt mr-2"></i> Đăng xuất</button>
                    </div>
                 </div>
               ) : (
                 <Link to="/login" className="hidden lg:block">
                    <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-white backdrop-blur-sm">
                       Đăng nhập
                    </Button>
                 </Link>
               )}

               <button className="xl:hidden text-2xl text-white" onClick={() => setIsMobileMenuOpen(true)}>
                 <i className="fas fa-bars"></i>
               </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay would go here (simplified for brevity) */}
    </>
  );
};

export default Header;
