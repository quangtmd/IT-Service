
// @ts-nocheck
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Stars, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

const PulsingCoreScene: React.FC = () => {
    const coreRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if(coreRef.current) {
            const time = state.clock.getElapsedTime();
            const scale = 1 + Math.sin(time * 1.5) * 0.1;
            coreRef.current.scale.set(scale, scale, scale);
            if (coreRef.current.material instanceof THREE.MeshStandardMaterial) {
                coreRef.current.material.emissiveIntensity = 2 + Math.sin(time * 1.5) * 1.5;
            }
        }
    });

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} color="#ef4444" intensity={5} />
            <Icosahedron ref={coreRef} args={[2, 3]}>
                <meshStandardMaterial 
                    color="#ef4444" 
                    emissive="#ef4444" 
                    emissiveIntensity={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Icosahedron>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={100} scale={20} size={2} speed={0.3} color="#ef4444" />
        </>
    );
}

export default PulsingCoreScene;
