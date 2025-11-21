
import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. MOVING DATA PACKET EFFECT ---
const DataStream = ({ start, end, speed = 1, delay = 0, color = "#00f3ff" }: { start: THREE.Vector3, end: THREE.Vector3, speed?: number, delay?: number, color?: string }) => {
    const ref = useRef<THREE.Mesh>(null!);
    const curve = useMemo(() => {
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        // Add some arc to the line
        mid.y += start.distanceTo(end) * 0.2; 
        return new THREE.CatmullRomCurve3([start, mid, end]);
    }, [start, end]);

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = (clock.getElapsedTime() * speed + delay) % 1;
            const pos = curve.getPoint(t);
            ref.current.position.copy(pos);
            
            // Orient the packet along the path
            const tangent = curve.getTangent(t).normalize();
            ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
            
            // Scale effect: stretch when moving fast
            const scale = 1 + Math.sin(t * Math.PI) * 0.5;
            ref.current.scale.set(scale, scale, scale * 1.5);
        }
    });

    const points = useMemo(() => curve.getPoints(40), [curve]);

    return (
        <group>
            {/* The Wire Path */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={points.length}
                        array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color={color} opacity={0.15} transparent />
            </line>

            {/* The Glowing Packet */}
            <mesh ref={ref}>
                <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
                <meshBasicMaterial color={color} />
                <pointLight distance={3} intensity={1.5} color={color} />
            </mesh>
        </group>
    );
};

// --- 2. ROTATING RINGS (The "Moving Small Components") ---
const RotatingRing = ({ radius, speed, axis, color }: { radius: number, speed: number, axis: 'x'|'y'|'z', color: string }) => {
    const ref = useRef<THREE.Mesh>(null!);
    
    useFrame((state, delta) => {
        if (ref.current) {
            if (axis === 'x') ref.current.rotation.x += delta * speed;
            if (axis === 'y') ref.current.rotation.y += delta * speed;
            if (axis === 'z') ref.current.rotation.z += delta * speed;
        }
    });

    return (
        <mesh ref={ref} rotation={[Math.random(), Math.random(), Math.random()]}>
            <torusGeometry args={[radius, 0.02, 16, 100]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
    );
};

// --- 3. SATELLITE NODE (Small floating devices) ---
const SatelliteNode = ({ position }: { position: [number, number, number] }) => {
    const ref = useRef<THREE.Group>(null!);
    
    useFrame((state) => {
        if(ref.current) {
            // Gentle hovering
            ref.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.002;
            // Slow rotation
            ref.current.rotation.y += 0.01;
        }
    });

    return (
        <group ref={ref} position={position}>
            {/* Main box */}
            <mesh>
                <boxGeometry args={[0.6, 0.4, 0.05]} /> {/* Like a screen */}
                <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.25, 0]}>
                 <boxGeometry args={[0.6, 0.05, 0.4]} /> {/* Keyboard base */}
                 <meshStandardMaterial color="#334155" />
            </mesh>
            {/* Hologram above */}
            <mesh position={[0, 0.3, 0]}>
                <octahedronGeometry args={[0.15, 0]} />
                <meshBasicMaterial color="#00f3ff" wireframe />
            </mesh>
        </group>
    )
}

// --- MAIN SCENE ---
const CloudNetworkScene: React.FC = () => {
    // Central Hub Position
    const centerPos = new THREE.Vector3(0, 0, 0);

    // Generate random satellite positions around the center
    const satellites = useMemo(() => {
        const items = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 4 + Math.random() * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 3;
            items.push(new THREE.Vector3(x, y, z));
        }
        return items;
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 2, 9]} fov={50} />
            
            {/* Lighting */}
            <ambientLight intensity={0.1} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#3b82f6" distance={10} /> {/* Core Glow */}
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />

            {/* 1. CENTRAL CLOUD SERVER CORE */}
            <group position={[0, 0, 0]}>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    {/* The glowing ball */}
                    <mesh>
                        <sphereGeometry args={[1, 32, 32]} />
                        <meshStandardMaterial 
                            color="#000000" 
                            emissive="#3b82f6" 
                            emissiveIntensity={2} 
                            roughness={0.1}
                        />
                    </mesh>
                    {/* Wireframe shell */}
                    <mesh scale={1.2}>
                        <icosahedronGeometry args={[1, 1]} />
                        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.1} />
                    </mesh>
                    
                    {/* Rotating Rings (Moving parts) */}
                    <RotatingRing radius={1.6} speed={0.5} axis="x" color="#60a5fa" />
                    <RotatingRing radius={1.8} speed={0.3} axis="y" color="#2563eb" />
                    <RotatingRing radius={2.0} speed={0.4} axis="z" color="#93c5fd" />
                </Float>
            </group>

            {/* 2. SATELLITES & CONNECTIONS */}
            {satellites.map((pos, i) => (
                <group key={i}>
                    {/* The Device/Node */}
                    <SatelliteNode position={[pos.x, pos.y, pos.z]} />
                    
                    {/* Data Stream: Satellite -> Center */}
                    <DataStream 
                        start={pos} 
                        end={centerPos} 
                        speed={0.5 + Math.random() * 0.5} 
                        delay={Math.random()} 
                        color="#00f3ff"
                    />
                    
                    {/* Data Stream: Center -> Satellite (Visual variety) */}
                    {i % 2 === 0 && (
                        <DataStream 
                            start={centerPos} 
                            end={pos} 
                            speed={0.8} 
                            delay={Math.random() + 0.5} 
                            color="#ec4899" 
                        />
                    )}
                </group>
            ))}

            {/* 3. ATMOSPHERE */}
            <Sparkles count={100} scale={15} size={2} speed={0.4} opacity={0.2} color="#ffffff" />
            <Stars radius={50} depth={0} count={2000} factor={4} saturation={0} fade speed={1} />
            
            {/* Grid Removed based on feedback */}
        </>
    );
};

export default CloudNetworkScene;