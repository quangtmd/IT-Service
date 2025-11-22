
// @ts-nocheck

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. SERVER RACK COMPONENT ---
const ServerRack = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  const frameColor = "#1e293b";
  const lightColor = "#00f3ff";
  const activeLightColor = "#ff0055";

  return (
    <group position={position} rotation={rotation}>
      {/* Main Cabinet Body */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1.2, 4, 1.2]} />
        <meshStandardMaterial color={frameColor} roughness={0.2} metalness={0.6} />
      </mesh>
      
      {/* Server Units */}
      {[...Array(8)].map((_, i) => (
        <group key={i} position={[0, 0.2 + i * 0.45, 0.61]}>
           <mesh>
             <planeGeometry args={[1, 0.4]} />
             <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.5} />
           </mesh>
           {/* Blinking Lights */}
           <BlinkingLight position={[-0.4, 0, 0.01]} color={lightColor} speed={1 + Math.random()} />
           <BlinkingLight position={[-0.3, 0, 0.01]} color={Math.random() > 0.7 ? activeLightColor : lightColor} speed={2 + Math.random()} />
           <BlinkingLight position={[0.35, 0, 0.01]} color="#10b981" speed={0.5} />
        </group>
      ))}
    </group>
  );
};

const BlinkingLight = ({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) => {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime();
            const intensity = (Math.sin(t * speed * 5) + 1) / 2;
            (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = (intensity * 2) + 0.5;
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <circleGeometry args={[0.04, 16]} />
            <meshStandardMaterial color="black" emissive={color} emissiveIntensity={2} />
        </mesh>
    )
}

// --- 2. CYBER OBELISK (Command Center Tower) ---
const CyberObelisk = ({ position }: { position: [number, number, number] }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const ringsRef = useRef<THREE.Group>(null!);
    const textGroupRef = useRef<THREE.Group>(null!);
    // Refs for individual text elements to update color
    const text1Ref = useRef<any>(null!);
    const text2Ref = useRef<any>(null!);
    const text3Ref = useRef<any>(null!);
    const text4Ref = useRef<any>(null!);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        
        // Gentle float
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.1;
        }
        
        // Rotate rings
        if (ringsRef.current) {
            ringsRef.current.rotation.y = t * 0.2;
        }

        // Rotate Text Group
        if (textGroupRef.current) {
             textGroupRef.current.rotation.y = -t * 0.5;
        }

        // RGB Color Cycle Logic
        const hue = (t * 0.2) % 1; // Cycle through colors
        const color = new THREE.Color().setHSL(hue, 1, 0.6); // Bright saturated color

        // Apply color to texts
        [text1Ref, text2Ref, text3Ref, text4Ref].forEach(ref => {
            if (ref.current) {
                ref.current.color = color;
                // Also update outline if needed, or just the fill
            }
        });
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Main Monolith Pillar */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[1, 1.2, 5, 6]} />
                <meshStandardMaterial 
                    color="#0f172a" 
                    roughness={0.2} 
                    metalness={0.8} 
                    emissive="#001133"
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Glowing Circuitry Edges */}
            <mesh position={[0, 0, 0]} scale={[1.01, 1, 1.01]}>
                 <cylinderGeometry args={[1, 1.2, 5, 6]} />
                 <meshStandardMaterial 
                    color="#00f3ff"
                    wireframe
                    transparent
                    opacity={0.15}
                 />
            </mesh>

            {/* Top Crystal / Beacon */}
            <mesh position={[0, 3, 0]}>
                <coneGeometry args={[0.8, 1.5, 6]} />
                <meshStandardMaterial 
                    color="#ffffff" 
                    emissive="#00f3ff" 
                    emissiveIntensity={2} 
                    roughness={0}
                    metalness={1}
                />
            </mesh>

            {/* Floating Holographic Rings */}
            <group ref={ringsRef}>
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.8, 1.9, 6]} />
                    <meshBasicMaterial color="#00f3ff" transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, Math.PI/6]}>
                    <ringGeometry args={[1.5, 1.55, 6]} />
                    <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
                 <mesh position={[0, -1, 0]} rotation={[Math.PI / 2, 0, -Math.PI/6]}>
                    <ringGeometry args={[2.2, 2.25, 6]} />
                    <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Holographic RGB Text Labels */}
            <group ref={textGroupRef} position={[0, 4.5, 0]}>
                 <Text
                    ref={text1Ref}
                    position={[0, 0, 2.5]}
                    fontSize={0.5}
                    anchorX="center"
                    anchorY="middle"
                >
                    IQ TECHNOLOGY
                </Text>
                <Text
                    ref={text2Ref}
                    position={[2.5, 0, 0]}
                    rotation={[0, Math.PI / 2, 0]}
                    fontSize={0.5}
                    anchorX="center"
                    anchorY="middle"
                >
                    DATA CENTER
                </Text>
                 <Text
                    ref={text3Ref}
                    position={[0, 0, -2.5]}
                    rotation={[0, Math.PI, 0]}
                    fontSize={0.5}
                    anchorX="center"
                    anchorY="middle"
                >
                    SECURITY
                </Text>
                 <Text
                    ref={text4Ref}
                    position={[-2.5, 0, 0]}
                    rotation={[0, -Math.PI / 2, 0]}
                    fontSize={0.5}
                    anchorX="center"
                    anchorY="middle"
                >
                    CLOUD
                </Text>
            </group>
        </group>
    );
};

// --- MAIN SCENE ---
const ServerTechScene: React.FC = () => {
  const rackPositions = [
      // Center Left
      { pos: [-4, 0, -2], rot: 0.2 },
      { pos: [-3, 0, -5], rot: 0.1 },
      // Far Left (Filling the void)
      { pos: [-7, 0, -3], rot: 0.25 },
      { pos: [-10, 0, -1], rot: 0.3 },
      { pos: [-8, 0, -6], rot: 0.15 },
      { pos: [-13, 0, -4], rot: 0.35 },

      // Center Right
      { pos: [4, 0, -2], rot: -0.2 },
      { pos: [3, 0, -5], rot: -0.1 },
      // Far Right (Filling the void)
      { pos: [7, 0, -3], rot: -0.25 },
      { pos: [10, 0, -1], rot: -0.3 },
      { pos: [8, 0, -6], rot: -0.15 },
      { pos: [13, 0, -4], rot: -0.35 },
  ];

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={60} />
      <color attach="background" args={['#020617']} />
      
      <fog attach="fog" args={['#020617', 5, 40]} />
      <ambientLight intensity={1.5} />
      <hemisphereLight intensity={1} groundColor="#000000" color="#ffffff" />
      
      <pointLight position={[0, 10, 0]} intensity={3} color="#00aaff" distance={50} />
      <directionalLight position={[0, 5, 10]} intensity={3} color="#ffffff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={30} size={3} speed={0.4} opacity={0.5} color="#00f3ff" />

      <group position={[0, -2, 0]}>
         <gridHelper args={[80, 80, 0x00f3ff, 0x0f172a]} />
      </group>

      <group position={[0, -2, 0]}>
          {rackPositions.map((rack, i) => (
              <ServerRack key={i} position={[rack.pos[0], rack.pos[1], rack.pos[2]]} rotation={[0, rack.rot, 0]} />
          ))}
      </group>

      {/* CENTRAL OBELISK */}
      <CyberObelisk position={[0, -1, -6]} />

    </>
  );
};

export default ServerTechScene;
