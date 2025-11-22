// @ts-nocheck

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. DATA STREAM BEAM ---
const DataBeam = ({ position, delay = 0, color = "#00f3ff" }: { position: [number, number, number], delay?: number, color?: string }) => {
    const ref = useRef<THREE.Mesh>(null!);
    
    useFrame(({ clock }) => {
        if (ref.current) {
            const t = (clock.getElapsedTime() * 0.5 + delay) % 1;
            // Move up from base
            ref.current.position.y = -1.5 + t * 5;
            // Fade out as it goes up
            const opacity = Math.max(0, 1 - t * 1.2);
            (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.6;
            // Scale down slightly
            ref.current.scale.setScalar(1 - t * 0.3);
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
    );
};

// --- 2. HOLOGRAPHIC COMMAND TABLE ---
const HolographicCommandTable = ({ position }: { position: [number, number, number] }) => {
    const baseRef = useRef<THREE.Group>(null!);
    const hologramRef = useRef<THREE.Group>(null!);
    const ringRef = useRef<THREE.Mesh>(null!);
    const textRingRef = useRef<THREE.Group>(null!);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        
        // Rotate the scanner ring
        if (ringRef.current) {
            ringRef.current.rotation.z = -t * 0.1;
        }
        
        // Gently rotate the hologram projection
        if (hologramRef.current) {
            hologramRef.current.rotation.y = t * 0.05;
        }

        // Rotate text ring
        if (textRingRef.current) {
            textRingRef.current.rotation.y = t * 0.02;
        }
    });

    return (
        <group position={position}>
            {/* BASE PLATFORM (The Table) */}
            <group ref={baseRef} position={[0, -2, 0]}>
                {/* Main Hexagonal Base */}
                <mesh rotation={[0, Math.PI/6, 0]}>
                    <cylinderGeometry args={[3.5, 3, 0.5, 6]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
                </mesh>
                {/* Glowing Rim */}
                <mesh position={[0, 0.26, 0]} rotation={[0, Math.PI/6, 0]}>
                    <cylinderGeometry args={[3.55, 3.55, 0.05, 6]} />
                    <meshBasicMaterial color="#0ea5e9" />
                </mesh>
                {/* Glass Top Surface */}
                <mesh position={[0, 0.28, 0]}>
                    <cylinderGeometry args={[3.2, 3.2, 0.05, 32]} />
                    <meshPhysicalMaterial 
                        color="#1e293b" 
                        transmission={0.8} 
                        opacity={0.8} 
                        metalness={0.5} 
                        roughness={0} 
                        transparent
                    />
                </mesh>
            </group>

            {/* HOLOGRAPHIC PROJECTION AREA */}
            <group position={[0, -1.7, 0]}>
                {/* Hologram Grid */}
                <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]}>
                    <circleGeometry args={[3, 64]} />
                    <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.15} />
                </mesh>
                
                {/* Rotating Scanner Ring */}
                <mesh ref={ringRef} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.15, 0]}>
                    <ringGeometry args={[2.5, 2.6, 64]} />
                    <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>

                {/* Floating Hologram Central Hub */}
                <group ref={hologramRef} position={[0, 1.5, 0]}>
                    <Float speed={4} rotationIntensity={0.5} floatIntensity={0.5}>
                        {/* Central Core Shape */}
                        <mesh>
                            <octahedronGeometry args={[0.8, 0]} />
                            <meshStandardMaterial 
                                color="#00f3ff" 
                                wireframe 
                                emissive="#00f3ff" 
                                emissiveIntensity={1}
                                transparent 
                                opacity={0.5} 
                            />
                        </mesh>
                        <mesh>
                             <octahedronGeometry args={[0.4, 0]} />
                             <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} />
                        </mesh>
                    </Float>

                    {/* Orbiting Data Screens */}
                    {[0, 120, 240].map((angle, i) => (
                        <group key={i} rotation={[0, (angle * Math.PI) / 180, 0]}>
                            <Float speed={2} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
                                <group position={[2.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                                    <mesh>
                                        <planeGeometry args={[1.8, 1]} />
                                        <meshBasicMaterial color="#1e40af" transparent opacity={0.2} side={THREE.DoubleSide} />
                                        <lineSegments>
                                            <edgesGeometry args={[new THREE.PlaneGeometry(1.8, 1)]} />
                                            <lineBasicMaterial color="#60a5fa" transparent opacity={0.6} />
                                        </lineSegments>
                                    </mesh>
                                    {/* Mock Data Lines on Screen */}
                                    <mesh position={[0, 0.2, 0.01]}>
                                        <planeGeometry args={[1.4, 0.05]} />
                                        <meshBasicMaterial color="#93c5fd" />
                                    </mesh>
                                    <mesh position={[-0.3, 0, 0.01]}>
                                        <planeGeometry args={[0.8, 0.05]} />
                                        <meshBasicMaterial color="#60a5fa" />
                                    </mesh>
                                    <mesh position={[0.3, -0.2, 0.01]}>
                                        <planeGeometry args={[0.8, 0.05]} />
                                        <meshBasicMaterial color="#3b82f6" />
                                    </mesh>
                                </group>
                            </Float>
                        </group>
                    ))}
                </group>
                
                {/* Floating Text Ring */}
                <group ref={textRingRef} position={[0, 0.5, 0]}>
                    <Text 
                        position={[0, 0, 2.8]} 
                        rotation={[ -Math.PI/4, 0, 0]} 
                        fontSize={0.15} 
                        color="#00f3ff" 
                        anchorX="center"
                    >
                        SYSTEM ONLINE • MONITORING ACTIVE • SECURE CONNECTION
                    </Text>
                    <Text 
                        position={[0, 0, -2.8]} 
                        rotation={[ -Math.PI/4, Math.PI, 0]} 
                        fontSize={0.15} 
                        color="#00f3ff" 
                        anchorX="center"
                    >
                        DATA ANALYSIS • TRAFFIC FLOW • OPTIMIZED
                    </Text>
                </group>
            </group>

            {/* VERTICAL BEAMS (Connecting Base to Cloud) */}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 1.5 + Math.random();
                return (
                    <DataBeam 
                        key={i} 
                        position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]} 
                        delay={Math.random()}
                    />
                )
            })}
        </group>
    );
};

// --- MAIN SCENE COMPONENT ---
const CloudNetworkScene: React.FC = () => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 4, 9]} fov={55} />
            
            {/* Cyberpunk Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 5, 0]} intensity={2} color="#0ea5e9" distance={15} />
            <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1} color="#ffffff" />
            <pointLight position={[-8, 2, -5]} intensity={1} color="#ec4899" distance={20} />

            {/* THE COMMAND CENTER */}
            <HolographicCommandTable position={[0, 0, 0]} />

            {/* Environmental Effects */}
            <Stars radius={80} depth={20} count={3000} factor={4} saturation={0} fade speed={0.5} />
            <Sparkles count={100} scale={20} size={2} speed={0.2} opacity={0.4} color="#ffffff" />
            
            {/* Floor Grid */}
            <group position={[0, -3, 0]}>
                <gridHelper args={[100, 100, 0x1e3a8a, 0x020617]} />
            </group>
        </>
    );
};

export default CloudNetworkScene;
