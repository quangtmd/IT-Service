
// @ts-nocheck

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. VERTICAL DATA BEAM EFFECT ---
const DataBeam = ({ position, delay = 0, color = "#00f3ff" }: { position: [number, number, number], delay?: number, color?: string }) => {
    const ref = useRef<THREE.Mesh>(null!);
    
    useFrame(({ clock }) => {
        if (ref.current) {
            const t = (clock.getElapsedTime() * 0.5 + delay) % 1;
            // Move up
            ref.current.position.y = -1 + t * 6;
            // Fade out at top
            const opacity = 1 - t;
            (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.5;
            // Scale down as it goes up
            ref.current.scale.setScalar(1 - t * 0.5);
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <boxGeometry args={[0.05, 0.8, 0.05]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
    );
};

// --- 2. STRATEGIC COMMAND TABLE (Replaces Sphere/Globe) ---
const StrategicCommandTable = ({ position }: { position: [number, number, number] }) => {
    const tableRef = useRef<THREE.Group>(null!);
    const ringRef = useRef<THREE.Mesh>(null!);
    const gridRef = useRef<THREE.Mesh>(null!);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (ringRef.current) {
            ringRef.current.rotation.z = -t * 0.2;
        }
        if (gridRef.current) {
            gridRef.current.rotation.z = t * 0.05;
        }
    });

    return (
        <group ref={tableRef} position={position}>
            {/* 1. Base Platform - Large Hexagon Table */}
            <mesh position={[0, -1.5, 0]} rotation={[0, Math.PI/6, 0]}>
                <cylinderGeometry args={[3.5, 2.5, 0.5, 6]} />
                <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
            </mesh>
            
            {/* 2. Glowing Edge Rim */}
            <mesh position={[0, -1.24, 0]} rotation={[0, Math.PI/6, 0]}>
                <cylinderGeometry args={[3.52, 3.52, 0.02, 6]} />
                <meshBasicMaterial color="#00f3ff" />
            </mesh>

            {/* 3. Holographic Surface Grid */}
            <mesh ref={gridRef} position={[0, -1.23, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[3.2, 64]} />
                <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.15} />
            </mesh>
            
            {/* 4. Rotating Scanner Ring on Surface */}
            <mesh ref={ringRef} position={[0, -1.22, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <ringGeometry args={[2.8, 3.0, 64]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>

            {/* 5. Floating Control Screens */}
            <group position={[0, 0.5, 0]}>
                {/* Main Central Screen */}
                <Float speed={2} floatIntensity={0.2}>
                    <mesh position={[0, 0.5, -2]}>
                        <planeGeometry args={[2.5, 1.5]} />
                        <meshBasicMaterial color="#00f3ff" transparent opacity={0.1} side={THREE.DoubleSide} />
                        <lineSegments>
                            <edgesGeometry args={[new THREE.PlaneGeometry(2.5, 1.5)]} />
                            <lineBasicMaterial color="#00f3ff" transparent opacity={0.6} />
                        </lineSegments>
                    </mesh>
                    <Text position={[0, 0.8, -1.9]} fontSize={0.2} color="#00f3ff" anchorX="center">SYSTEM ONLINE</Text>
                </Float>

                {/* Side Screens */}
                <Float speed={1.5} floatIntensity={0.3}>
                    <mesh position={[-2.5, 0, -1]} rotation={[0, 0.5, 0]}>
                         <planeGeometry args={[1.5, 1]} />
                         <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} side={THREE.DoubleSide} />
                         <lineSegments>
                            <edgesGeometry args={[new THREE.PlaneGeometry(1.5, 1)]} />
                            <lineBasicMaterial color="#3b82f6" transparent opacity={0.5} />
                        </lineSegments>
                    </mesh>
                </Float>
                <Float speed={1.8} floatIntensity={0.3}>
                     <mesh position={[2.5, 0, -1]} rotation={[0, -0.5, 0]}>
                         <planeGeometry args={[1.5, 1]} />
                         <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} side={THREE.DoubleSide} />
                         <lineSegments>
                            <edgesGeometry args={[new THREE.PlaneGeometry(1.5, 1)]} />
                            <lineBasicMaterial color="#3b82f6" transparent opacity={0.5} />
                        </lineSegments>
                    </mesh>
                </Float>
            </group>

             {/* 6. Vertical Data Beams Rising */}
             {[...Array(6)].map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const radius = 2;
                return (
                    <DataBeam 
                        key={i} 
                        position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]} 
                        delay={i * 0.3}
                    />
                )
            })}
        </group>
    );
};

// --- MAIN SCENE ---
const CloudNetworkScene: React.FC = () => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={50} />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 5, 0]} intensity={2} color="#3b82f6" distance={20} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, 5, 10]} intensity={1} color="#ec4899" />

            {/* STRATEGIC TABLE (No Sphere) */}
            <StrategicCommandTable position={[0, 0, 0]} />

            {/* Atmosphere */}
            <Sparkles count={150} scale={20} size={2} speed={0.2} opacity={0.3} color="#ffffff" />
            <Stars radius={80} depth={0} count={2000} factor={4} saturation={0} fade speed={1} />
            
             <group position={[0, -2.5, 0]}>
                 <gridHelper args={[80, 80, 0x1e3a8a, 0x0f172a]} />
             </group>
        </>
    );
};

export default CloudNetworkScene;
