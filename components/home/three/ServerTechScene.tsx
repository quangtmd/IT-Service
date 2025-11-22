// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Sparkles, Text } from '@react-three/drei';
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
        <meshStandardMaterial color={frameColor} roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Server Units */}
      {[...Array(8)].map((_, i) => (
        <group key={i} position={[0, 0.2 + i * 0.45, 0.61]}>
           <mesh>
             <planeGeometry args={[1, 0.4]} />
             <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.6} />
           </mesh>
           {/* Blinking Lights */}
           <BlinkingLight position={[-0.4, 0, 0.02]} color={lightColor} speed={1 + Math.random()} />
           <BlinkingLight position={[-0.3, 0, 0.02]} color={Math.random() > 0.7 ? activeLightColor : lightColor} speed={2 + Math.random()} />
           <BlinkingLight position={[0.35, 0, 0.02]} color="#10b981" speed={0.5} />
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
            if (ref.current.material instanceof THREE.MeshStandardMaterial) {
                ref.current.material.emissiveIntensity = (intensity * 3) + 0.5;
            }
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <circleGeometry args={[0.03, 8]} />
            <meshStandardMaterial color="black" emissive={color} emissiveIntensity={2} />
        </mesh>
    )
}

// --- 2. CYBER OBELISK (Command Center Tower) ---
const CyberObelisk = ({ position }: { position: [number, number, number] }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const ringsRef = useRef<THREE.Group>(null!);
    const textGroupRef = useRef<THREE.Group>(null!);
    const textRefs = [useRef<any>(null!), useRef<any>(null!), useRef<any>(null!), useRef<any>(null!)];

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (groupRef.current) groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.1;
        if (ringsRef.current) ringsRef.current.rotation.y = t * 0.2;
        if (textGroupRef.current) textGroupRef.current.rotation.y = -t * 0.3;

        // RGB Color Cycle Logic
        const hue = (t * 0.1) % 1; 
        const color = new THREE.Color().setHSL(hue, 1, 0.5);
        textRefs.forEach(ref => {
            if (ref.current) ref.current.color = color;
        });
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[1.2, 1.5, 6, 6]} /><meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} /></mesh>
            <mesh position={[0, 1.5, 0]} scale={[1.02, 1, 1.02]}><cylinderGeometry args={[1.2, 1.5, 6, 6]} /><meshStandardMaterial color="#00f3ff" wireframe transparent opacity={0.2} /></mesh>
            <mesh position={[0, 5.2, 0]}><coneGeometry args={[1.2, 1.5, 4]} /><meshStandardMaterial color="#ffffff" emissive="#00f3ff" emissiveIntensity={1.5} roughness={0} metalness={1} /></mesh>
            <group ref={ringsRef} position={[0, 2, 0]}>
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[2.5, 2.6, 6]} /><meshBasicMaterial color="#00f3ff" transparent opacity={0.4} side={THREE.DoubleSide} /></mesh>
                <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, Math.PI/6]}><ringGeometry args={[3, 3.1, 6]} /><meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
            </group>
            <group ref={textGroupRef} position={[0, 6.5, 0]}>
                 <Text ref={textRefs[0]} position={[0, 0, 3]} fontSize={0.6} anchorX="center" anchorY="middle">IQ TECHNOLOGY</Text>
                 <Text ref={textRefs[1]} position={[3, 0, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.6} anchorX="center" anchorY="middle">DATA CENTER</Text>
                 <Text ref={textRefs[2]} position={[0, 0, -3]} rotation={[0, Math.PI, 0]} fontSize={0.6} anchorX="center" anchorY="middle">SECURITY</Text>
                 <Text ref={textRefs[3]} position={[-3, 0, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.6} anchorX="center" anchorY="middle">CLOUD</Text>
            </group>
        </group>
    );
};

// --- MAIN SCENE ---
const ServerTechScene: React.FC = () => {
  const rackPositions = [
      { pos: [-3, 0, -4], rot: 0.2 }, { pos: [3, 0, -4], rot: -0.2 },
      { pos: [-6, 0, -2], rot: 0.3 }, { pos: [6, 0, -2], rot: -0.3 },
      { pos: [-7, 0, -6], rot: 0.1 }, { pos: [7, 0, -6], rot: -0.1 },
      { pos: [-10, 0, -1], rot: 0.4 }, { pos: [10, 0, -1], rot: -0.4 },
      { pos: [-11, 0, -5], rot: 0.2 }, { pos: [11, 0, -5], rot: -0.2 },
      { pos: [-14, 0, 0], rot: 0.5 }, { pos: [14, 0, 0], rot: -0.5 },
      { pos: [-15, 0, -4], rot: 0.3 }, { pos: [15, 0, -4], rot: -0.3 },
  ];

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={60} />
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 8, 45]} />
      <ambientLight intensity={2} />
      <hemisphereLight intensity={1} groundColor="#000000" color="#ffffff" />
      <spotLight position={[0, 20, 0]} angle={0.5} penumbra={1} intensity={5} color="#00f3ff" distance={50} />
      <pointLight position={[-10, 5, 5]} intensity={2} color="#3b82f6" />
      <pointLight position={[10, 5, 5]} intensity={2} color="#ec4899" />
      <Stars radius={100} depth={50} count={6000} factor={5} saturation={0} fade speed={1} />
      <Sparkles count={300} scale={40} size={4} speed={0.5} opacity={0.6} color="#00f3ff" />
      <group position={[0, -2, 0]}>
         <gridHelper args={[100, 100, 0x00f3ff, 0x0f172a]} />
      </group>
      <group position={[0, -2, 0]}>
          {rackPositions.map((rack, i) => (
              <ServerRack key={i} position={rack.pos as [number, number, number]} rotation={[0, rack.rot, 0]} />
          ))}
      </group>
      <CyberObelisk position={[0, -2, -8]} />
    </>
  );
};

export default ServerTechScene;
