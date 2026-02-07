
// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import * as Constants from '../../constants.tsx';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { CustomMenuLink, SiteSettings } from '../../types';
import HeaderSearchBar from '../shared/GlobalSearch';
import MegaMenu from './MegaMenu';
import { useTheme } from '../../contexts/ThemeContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Icosahedron, Octahedron, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D SCENE COMPONENTS (Robust Version) ---

const CrystalLogo = () => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const coreRef = useRef<THREE.Mesh>(null!);
    
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if(meshRef.current) {
            meshRef.current.rotation.y = time * 0.5;
            meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.2;
        }
        if(coreRef.current) {
             const scale = 0.8 + Math.sin(time * 3) * 0.1;
             coreRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group>
            {/* Outer Shell */}
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[1.4, 0]} />
                <meshStandardMaterial 
                    color="#00f3ff" 
                    wireframe 
                    transparent 
                    opacity={0.4} 
                    emissive="#00f3ff"
                    emissiveIntensity={0.5}
                />
            </mesh>
            
            {/* Inner Core */}
            <mesh ref={coreRef}>
                <octahedronGeometry args={[0.7, 0]} />
                <MeshDistortMaterial 
                    color="#ef4444" 
                    speed={2} 
                    distort={0.4} 
                    radius={1}
                    emissive="#ef4444"
                    emissiveIntensity={1}
                />
            </mesh>
            
            <pointLight color="#00f3ff" intensity={2} distance={3} />
        </group>
    );
};

const Header3DCanvas = () => {
    return (
        <Canvas gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <Suspense fallback={null}>
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <CrystalLogo />
                </Float>
                <Sparkles count={20} scale={4} size={2} speed={0.4} opacity={0.5} color="#00f3ff" />
            </Suspense>
        </Canvas>
    );
};

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cart } = useCart();
    const { isAuthenticated, currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
    const [scrolled, setScrolled] = useState(false);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

    // Load settings logic
    const loadData = useCallback(() => {
        const storedSettings = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
        setSiteSettings(storedSettings ? JSON.parse(storedSettings) : Constants.INITIAL_SITE_SETTINGS);
    }, []);

    useEffect(() => {
        loadData();
        window.addEventListener('siteSettingsUpdated', loadData);
        
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('siteSettingsUpdated', loadData);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [loadData]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
                <div className={`mx-auto px-4 transition-all duration-300 ${scrolled ? 'container max-w-[98%]' : 'container'}`}>
                    <div className={`
                        relative bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] 
                        flex items-center justify-between px-4 lg:px-8 transition-all duration-300
                        ${scrolled ? 'h-16' : 'h-20'}
                    `}>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>

                        {/* LEFT: LOGO */}
                        <Link to="/" className="flex items-center gap-3 relative z-10 group">
                            <div className="w-12 h-12 relative">
                                <Header3DCanvas />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black italic tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
                                    IQ<span className="text-cyan-400 group-hover:text-white transition-colors">TECH</span>
                                </span>
                                <span className="text-[10px] tracking-[0.3em] text-gray-400 uppercase">Technology</span>
                            </div>
                        </Link>

                        {/* CENTER: NAVIGATION */}
                        <nav className="hidden xl:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                            {Constants.NAVIGATION_LINKS_BASE.filter(l => l.path !== '/pc-builder' && l.path !== '/blog').map(link => {
                                if (link.path === '/shop') return <div key="mega" className="px-2"><MegaMenu /></div>;
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link 
                                        key={link.path} 
                                        to={link.path}
                                        className={`
                                            relative px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-300
                                            ${isActive 
                                                ? 'text-cyan-300 bg-white/5 shadow-[0_0_15px_rgba(34,211,238,0.2)] border border-cyan-500/30' 
                                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
                                        `}
                                    >
                                        {link.label}
                                        {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]"></span>}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* RIGHT: ACTIONS */}
                        <div className="flex items-center gap-4 relative z-10">
                            {/* Search */}
                            <div className="hidden lg:block w-64">
                                <HeaderSearchBar />
                            </div>

                            {/* PC Builder Button */}
                            <Link to={Constants.PC_BUILDER_PATH} className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-purple-500/40 hover:scale-105 transition-all border border-white/10" title="Build PC">
                                <i className="fas fa-tools"></i>
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="relative group">
                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                                    <i className="fas fa-shopping-cart"></i>
                                </div>
                                {totalItemsInCart > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-[#0F172A]">
                                        {totalItemsInCart}
                                    </span>
                                )}
                            </Link>

                            {/* User / Login */}
                            {isAuthenticated && currentUser ? (
                                <div className="hidden lg:block relative group">
                                    <button className="flex items-center gap-3 pl-3 border-l border-white/10">
                                        <img 
                                            src={currentUser.imageUrl || `https://ui-avatars.com/api/?name=${currentUser.username}`} 
                                            alt="Avatar" 
                                            className="w-9 h-9 rounded-full border-2 border-cyan-500/30 p-[2px]" 
                                        />
                                    </button>
                                    {/* Dropdown */}
                                    <div className="absolute top-full right-0 mt-2 w-60 bg-[#0f172a] border border-cyan-900/50 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                        <div className="px-4 py-3 border-b border-white/5">
                                            <p className="text-white font-bold truncate">{currentUser.username}</p>
                                            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                                        </div>
                                        {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                                            <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-cyan-400 hover:bg-white/5"><i className="fas fa-shield-alt w-5 mr-2"></i> Quản trị</Link>
                                        )}
                                        <Link to="/account/orders" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5"><i className="fas fa-box w-5 mr-2"></i> Đơn hàng</Link>
                                        <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"><i className="fas fa-sign-out-alt w-5 mr-2"></i> Đăng xuất</button>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="hidden lg:block">
                                    <Button size="sm" className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-white transition-all">
                                        Đăng nhập
                                    </Button>
                                </Link>
                            )}

                            {/* Mobile Toggle */}
                            <button className="lg:hidden text-2xl text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
                                <i className="fas fa-bars"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full p-6">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-2xl font-bold text-white">MENU</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-white text-3xl"><i className="fas fa-times"></i></button>
                    </div>

                    <div className="mb-6">
                        <HeaderSearchBar />
                    </div>

                    <nav className="flex flex-col gap-4 overflow-y-auto flex-grow">
                        {Constants.NAVIGATION_LINKS_BASE.map(link => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 text-lg font-medium text-gray-300 hover:text-cyan-400 py-2 border-b border-white/5"
                            >
                                <i className={`${link.icon} w-6 text-center`}></i>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        {isAuthenticated ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <img src={currentUser?.imageUrl || `https://ui-avatars.com/api/?name=${currentUser?.username}`} className="w-10 h-10 rounded-full" alt="" />
                                    <div>
                                        <p className="text-white font-bold">{currentUser?.username}</p>
                                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full py-3 bg-red-900/30 text-red-400 rounded-xl font-bold border border-red-500/20">Đăng xuất</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center rounded-xl bg-white/10 text-white font-bold border border-white/10">Đăng nhập</Link>
                                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center rounded-xl bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/30">Đăng ký</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
