
// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Stars, Billboard, Text, Ring, Html } from '@react-three/drei';
import * as THREE from 'three';

const PulsingCore = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scale = 1 + Math.sin(time * 2) * 0.05;
    if (meshRef.current) {
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.y += 0.005;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 3 + Math.sin(time * 2) * 1.5;
    }
  });

  return (
    <group>
      <pointLight ref={lightRef} color="#ef4444" intensity={3} distance={10} />
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial 
          color="#dc2626" 
          emissive="#991b1b" 
          emissiveIntensity={0.5} 
          roughness={0.2} 
          metalness={0.8} 
        />
      </mesh>
    </group>
  );
};

const Satellite = ({ position, text, icon }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      // Bobbing motion
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.5 + position[0]) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Billboard>
        <Html center>
          <div className="w-16 h-16 bg-red-900/30 border-2 border-red-500/50 rounded-full flex items-center justify-center backdrop-blur-sm">
            <i className={`${icon} text-red-300 text-2xl`}></i>
          </div>
        </Html>
        <Text fontSize={0.2} color="#f87171" position={[0, -0.6, 0]} anchorX="center">
          {text}
        </Text>
      </Billboard>
    </group>
  );
};

const DataLine = ({ start, end }) => {
    const ref = useRef<any>();
    const curve = useMemo(() => new THREE.LineCurve3(start, end), [start, end]);
    const points = useMemo(() => curve.getPoints(50), [curve]);
    
    useFrame((state, delta) => {
        if(ref.current) {
            // This logic is for THREE.LineDashedMaterial
             if(ref.current.material.dashOffset !== undefined) {
                ref.current.material.dashOffset -= delta * 0.5;
             }
        }
    });

    return (
        <line ref={ref} onUpdate={self => self.computeLineDistances()}>
            <bufferGeometry attach="geometry">
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length}
                    array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineDashedMaterial
                color="#ef4444"
                dashSize={0.2}
                gapSize={0.1}
                transparent
                opacity={0.4}
            />
        </line>
    );
};

const AboutScene = () => {
  const satellitePositions = useMemo(() => [
    new THREE.Vector3(2.5, 0.5, 0),
    new THREE.Vector3(-2.5, -0.5, 0)
  ], []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="white" />
      <PulsingCore />
      
      <Satellite position={satellitePositions[0].toArray()} text="Dịch vụ IT Doanh Nghiệp" icon="fas fa-briefcase" />
      <Satellite position={satellitePositions[1].toArray()} text="Giải pháp CNTT Toàn diện" icon="fas fa-lightbulb" />

      {satellitePositions.map((pos, i) => (
          <DataLine key={i} start={new THREE.Vector3(0,0,0)} end={pos} />
      ))}
      
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={100} scale={15} size={3} speed={0.3} color="#b91c1c" />
    </>
  );
};

export default AboutScene;
