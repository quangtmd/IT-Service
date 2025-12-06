
// @ts-nocheck
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles, PerspectiveCamera, Float, Icosahedron, Octahedron, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';

const HighlightShape = ({ position, color, children }) => {
    const lightRef = useRef<THREE.PointLight>(null!);

    useFrame((state) => {
        if (lightRef.current) {
            lightRef.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.8} floatIntensity={1}>
            <group position={position}>
                <pointLight ref={lightRef} color={color} distance={5} intensity={1.5} />
                {children}
            </group>
        </Float>
    );
}

const FeaturedServicesScene: React.FC = () => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
            <ambientLight intensity={0.1} />
            <hemisphereLight intensity={0.2} groundColor="black" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={200} scale={20} size={1} speed={0.3} />

            {/* Highlighted Service 1 */}
            <HighlightShape position={[-4.5, 1, 0]} color="#00f3ff">
                <Icosahedron args={[1, 1]}>
                    <meshStandardMaterial color="#00f3ff" roughness={0.1} metalness={0.9} wireframe opacity={0.3} transparent />
                </Icosahedron>
            </HighlightShape>

            {/* Highlighted Service 2 */}
            <HighlightShape position={[0, -1, -2]} color="#ec4899">
                <Octahedron args={[1.2, 0]}>
                     <meshStandardMaterial color="#ec4899" roughness={0.1} metalness={0.9} wireframe opacity={0.3} transparent />
                </Octahedron>
            </HighlightShape>

            {/* Highlighted Service 3 */}
            <HighlightShape position={[4.5, 1, 0]} color="#f59e0b">
                <TorusKnot args={[0.8, 0.2, 128, 16]}>
                     <meshStandardMaterial color="#f59e0b" roughness={0.1} metalness={0.9} wireframe opacity={0.3} transparent />
                </TorusKnot>
            </HighlightShape>
            
             <gridHelper args={[100, 100, '#1e3a8a', '#0f172a']} position={[0, -4, 0]} />
        </>
    );
};

export default FeaturedServicesScene;
