// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Stars, Sphere, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- Central Data Core Component ---
const DataCore = ({ scale = 1 }) => {
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <group ref={groupRef} scale={scale}>
            {/* Outer wireframe */}
            <Sphere args={[1, 64, 64]}>
                 <meshStandardMaterial 
                    color="#00f3ff"
                    wireframe
                    transparent
                    opacity={0.15}
                 />
            </Sphere>

            {/* Inner semi-transparent sphere */}
            <Sphere args={[0.99, 64, 64]}>
                <meshStandardMaterial 
                    color="#00468B" 
                    emissive="#001F3F" 
                    emissiveIntensity={1}
                    metalness={0.9}
                    roughness={0.1}
                    transparent={true}
                    opacity={0.2}
                />
            </Sphere>

            {/* The central IQ Logo, always facing camera */}
            <Billboard>
                 <Text
                    fontSize={0.4} 
                    color="#ef4444" 
                    anchorX="center"
                    anchorY="bottom" 
                    position={[0, 0.05, 0]} 
                 >
                    IQ
                 </Text>
                 <Text
                    fontSize={0.15} 
                    color="white"
                    anchorX="center"
                    anchorY="top"
                    position={[0, 0.05, 0]}
                 >
                    TECHNOLOGY
                 </Text>
            </Billboard>

             {/* A small, intense light inside the core to make the logo pop */}
            <pointLight color="#ef4444" intensity={10} distance={3} />
        </group>
    );
};

// --- Component for each step using 3D Text ---
const ProcessStepNode = ({ step, position }) => {
    return (
        <Billboard position={position}>
            {/* Step Number */}
            <Text
                fontSize={0.4}
                color="#ef4444"
                anchorY="bottom"
                position={[0, 0.2, 0]}
                opacity={0.4}
            >
                {step.stepNumber}
            </Text>
            {/* Title */}
            <Text
                fontSize={0.15}
                color="white"
                anchorY="middle"
                position={[0, 0, 0]}
                maxWidth={1.5}
                textAlign="center"
            >
                {step.title}
            </Text>
            {/* Description */}
            <Text
                fontSize={0.07}
                color="#a1a1aa"
                anchorY="top"
                position={[0, -0.15, 0]}
                maxWidth={1.5}
                lineHeight={1.5}
                textAlign="center"
            >
                {step.description}
            </Text>
        </Billboard>
    );
};


// --- The main scene content ---
const ProcessSceneContent = ({ steps }) => {
    const textGroupRef = useRef<THREE.Group>(null!);

    // Calculate positions for the 4 steps in a circle
    const stepPositions = useMemo(() => {
        const radius = 2.8;
        return steps.map((_, index) => {
            const angle = (index / steps.length) * Math.PI * 2;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            return [x, 0, z];
        });
    }, [steps]);

    // Automatic rotation animation
    useFrame((state, delta) => {
        if (textGroupRef.current) {
            textGroupRef.current.rotation.y += delta * 0.15;
        }
    });

    return (
        <group>
            {/* The single central sphere, with adjusted scale */}
            <DataCore scale={1.8} />

            {/* The group of rotating text steps */}
            <group ref={textGroupRef}>
                {steps.map((step, index) => (
                    <ProcessStepNode 
                        key={step.id} 
                        step={step} 
                        position={stepPositions[index]}
                    />
                ))}
            </group>
        </group>
    );
};

const ProcessScene = ({ steps }) => {
    return (
        <>
            <color attach="background" args={['#0B1120']} />
            <fog attach="fog" args={['#0B1120', 8, 20]} />
            <ambientLight intensity={1.5} />
            <pointLight position={[0, 5, 5]} intensity={5} color="#00f3ff" />
            <pointLight position={[0, -5, -5]} intensity={3} color="#ec4899" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={150} scale={20} size={1.5} speed={0.3} color="#00f3ff" />

            <ProcessSceneContent steps={steps} />
        </>
    );
};

export default ProcessScene;