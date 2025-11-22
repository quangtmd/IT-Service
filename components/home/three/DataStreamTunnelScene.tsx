// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const DataParticle = ({ position }: { position: THREE.Vector3 }) => {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        if(ref.current) {
            ref.current.position.z += 0.1;
            if (ref.current.position.z > 5) {
                ref.current.position.z = -20;
            }
        }
    });
    return (
        <mesh ref={ref} position={position}>
            <boxGeometry args={[0.05, 0.05, 0.5]} />
            <meshBasicMaterial color="#00f3ff" />
        </mesh>
    )
}

const DataStreamTunnelScene: React.FC = () => {
  const particles = useMemo(() => {
    const particleArray = [];
    for (let i = 0; i < 200; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 8 + 4;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = Math.random() * -25;
        particleArray.push(new THREE.Vector3(x, y, z));
    }
    return particleArray;
  }, []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      <ambientLight intensity={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {particles.map((pos, i) => <DataParticle key={i} position={pos} />)}
    </>
  );
};

export default DataStreamTunnelScene;