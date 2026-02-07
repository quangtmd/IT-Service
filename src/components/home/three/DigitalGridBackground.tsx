
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const MovingGrid = () => {
  const gridRef = useRef<THREE.Group>(null!);
  const planeRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (gridRef.current) {
      // Move grid towards camera to simulate flying
      gridRef.current.position.z = (state.clock.elapsedTime * 2) % 20;
    }
  });

  return (
    <group ref={gridRef} position={[0, -5, 0]}>
      <gridHelper args={[100, 50, 0x00f3ff, 0x111133]} position={[0, 0, 0]} />
      <gridHelper args={[100, 50, 0x00f3ff, 0x111133]} position={[0, 0, -100]} />
      {/* Floor reflection */}
      <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -50]}>
        <planeGeometry args={[100, 200]} />
        <meshBasicMaterial color="#000000" opacity={0.8} transparent />
      </mesh>
    </group>
  );
};

const FloatingParticles = () => {
  const count = 200;
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshBasicMaterial color="#00f3ff" transparent opacity={0.6} />
    </instancedMesh>
  );
};

const DigitalGridBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#050a14]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={75} />
        <fog attach="fog" args={['#050a14', 10, 60]} />
        <ambientLight intensity={0.5} />
        
        <MovingGrid />
        <FloatingParticles />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

export default DigitalGridBackground;
