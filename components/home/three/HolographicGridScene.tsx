
// @ts-nocheck
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const HolographicGridScene: React.FC = () => {
    const gridRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        if(gridRef.current) {
            gridRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 5, 0]} intensity={2} color="#ffffff" />
            <group ref={gridRef}>
                <gridHelper args={[50, 50, '#0ea5e9', '#0ea5e9']} position={[0, -2, 0]} />
            </group>
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        </>
    );
};

export default HolographicGridScene;
