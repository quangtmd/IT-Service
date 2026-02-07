
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Sparkles, RoundedBox, Cylinder, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// --- SUB-COMPONENTS ---

const Fan = ({ position, color = "#00f3ff", scale = 1 }: { position: [number, number, number], color?: string, scale?: number }) => {
    const bladesRef = useRef<THREE.Group>(null!);
    useFrame((state, delta) => {
        if(bladesRef.current) bladesRef.current.rotation.z -= delta * 8; // Spin speed
    });

    return (
        <group position={position} scale={scale}>
            {/* Fan Frame */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.45, 0.02, 8, 24]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            {/* Glow Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.42, 0.01, 8, 24]} />
                <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            {/* Blades */}
            <group ref={bladesRef}>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <mesh key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]}>
                        <boxGeometry args={[0.12, 0.4, 0.005]} />
                        <meshStandardMaterial color="#333" transparent opacity={0.9} />
                    </mesh>
                ))}
            </group>
            {/* Center Hub */}
            <mesh rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
                <meshStandardMaterial color="#111" />
                {/* Logo Sticker */}
                <mesh position={[0, 0.03, 0]}>
                     <circleGeometry args={[0.08, 16]} />
                     <meshBasicMaterial color={color} />
                </mesh>
            </mesh>
            
            {/* Fan Light Cast */}
            <pointLight color={color} intensity={1} distance={1.5} decay={2} />
        </group>
    );
};

const GamingPC = () => {
    const groupRef = useRef<THREE.Group>(null!);
    const floatRef = useRef<THREE.Group>(null!);

    // Mouse parallax effect
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const mouseX = state.mouse.x * 0.5;
        const mouseY = state.mouse.y * 0.5;
        
        if (groupRef.current) {
            // Smooth rotation towards mouse
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX * 0.5 - 0.6, 0.1);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouseY * 0.2, 0.1);
        }
    });

    return (
        <group>
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                <group ref={groupRef} rotation={[0, -0.6, 0]} position={[2, -0.5, 0]}>
                    
                    {/* --- CHASSIS --- */}
                    {/* Main Frame (Dark Metal) */}
                    <RoundedBox args={[2.2, 4.5, 4.5]} radius={0.05} smoothness={4}>
                        <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.2} />
                    </RoundedBox>
                    
                    {/* Glass Side Panel (Tinted) */}
                    <RoundedBox args={[0.05, 4.1, 4.1]} radius={0.02} smoothness={2} position={[1.11, 0, 0]}>
                         <meshPhysicalMaterial 
                            color="#111" 
                            transmission={0.6} 
                            opacity={0.3} 
                            transparent 
                            roughness={0} 
                            metalness={0.5} 
                            clearcoat={1}
                         />
                    </RoundedBox>

                    {/* --- INTERNALS --- */}
                    
                    {/* Motherboard (Base) */}
                    <mesh position={[-0.9, 0, 0]}>
                        <boxGeometry args={[0.1, 4.0, 4.0]} />
                        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.8} />
                    </mesh>

                    {/* GPU (Graphics Card) */}
                    <group position={[0.2, -0.8, 0.5]}>
                        <mesh>
                            <boxGeometry args={[1.5, 0.3, 3]} />
                            <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
                        </mesh>
                        {/* GPU RGB Strip */}
                        <mesh position={[0.76, 0, 0]}>
                             <boxGeometry args={[0.02, 0.1, 2.8]} />
                             <meshBasicMaterial color="#a855f7" />
                        </mesh>
                        {/* GPU Fans (Bottom) */}
                        <Fan position={[0, -0.16, 0.8]} color="#a855f7" scale={0.8} />
                        <Fan position={[0, -0.16, -0.8]} color="#a855f7" scale={0.8} />
                    </group>

                    {/* CPU Cooler (AIO Block) */}
                    <group position={[-0.8, 0.8, 0.5]} rotation={[0, 0, Math.PI/2]}>
                        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
                        <meshStandardMaterial color="#111" />
                        <mesh position={[0, 0.11, 0]}>
                             <circleGeometry args={[0.3, 32]} />
                             <meshBasicMaterial color="#00f3ff" />
                        </mesh>
                        {/* Pipes */}
                        <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                             <tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(1,1.5,0)]), 20, 0.05, 8, false]} />
                             <meshStandardMaterial color="black" />
                        </mesh>
                    </group>

                    {/* RAM Sticks (Glowing) */}
                    <group position={[-0.8, 0.8, 1.2]}>
                        {[0, 1, 2, 3].map(i => (
                            <mesh key={i} position={[0.2 * i, 0, 0]}>
                                <boxGeometry args={[0.05, 1.2, 0.1]} />
                                <meshStandardMaterial color="#000" />
                                <mesh position={[0.03, 0, 0]}>
                                     <boxGeometry args={[0.01, 1.1, 0.02]} />
                                     <meshBasicMaterial color="#ff0055" />
                                </mesh>
                            </mesh>
                        ))}
                    </group>

                    {/* Front Fans (Intake) */}
                    <group position={[0, 0, 2.1]} rotation={[0, Math.PI, 0]}>
                        <Fan position={[0, 1.2, 0]} color="#00f3ff" />
                        <Fan position={[0, 0, 0]} color="#00f3ff" />
                        <Fan position={[0, -1.2, 0]} color="#00f3ff" />
                    </group>

                    {/* Rear Fan (Exhaust) */}
                    <group position={[0, 1.2, -2.1]}>
                        <Fan position={[0, 0, 0]} color="#00f3ff" />
                    </group>

                    {/* Top Radiator/Fans */}
                    <group position={[0, 2.1, 0]} rotation={[Math.PI/2, 0, 0]}>
                        <Fan position={[0, 0.8, 0]} color="#ec4899" />
                        <Fan position={[0, -0.8, 0]} color="#ec4899" />
                    </group>

                </group>
            </Float>
            
            {/* Floor Shadows */}
            <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={10} blur={2} far={4} />
        </group>
    );
};

// --- MAIN SCENE ---
const ServerTechScene: React.FC = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={45} />
      
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[-5, 2, 5]} intensity={2} color="#00f3ff" distance={10} />
      <pointLight position={[5, -2, 5]} intensity={2} color="#a855f7" distance={10} />
      <spotLight position={[0, 5, 5]} angle={0.5} penumbra={1} intensity={1} color="#ffffff" castShadow />

      {/* Hero Object */}
      <GamingPC />

      {/* Atmospheric Particles */}
      <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={100} scale={12} size={3} speed={0.4} opacity={0.5} color="#00f3ff" position={[2, 0, 0]} />
      <Sparkles count={50} scale={10} size={2} speed={0.2} opacity={0.3} color="#ec4899" position={[-2, 0, 0]} />
    </>
  );
};

export default ServerTechScene;
