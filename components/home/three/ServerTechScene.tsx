
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Sparkles, Instances, Instance, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. SERVER RACK COMPONENT ---
const ServerRack = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  // Procedural generation of a server rack
  // Frame
  const frameColor = "#1e293b";
  const lightColor = "#00f3ff";
  const activeLightColor = "#ff0055";

  return (
    <group position={position} rotation={rotation}>
      {/* Main Cabinet Body */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1.2, 4, 1.2]} />
        <meshStandardMaterial color={frameColor} roughness={0.2} metalness={0.6} />
      </mesh>
      
      {/* Server Units (Blades) */}
      {[...Array(8)].map((_, i) => (
        <group key={i} position={[0, 0.2 + i * 0.45, 0.61]}>
           {/* Faceplate */}
           <mesh>
             <planeGeometry args={[1, 0.4]} />
             <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.5} />
           </mesh>
           {/* Blinking Lights */}
           <BlinkingLight position={[-0.4, 0, 0.01]} color={lightColor} speed={1 + Math.random()} />
           <BlinkingLight position={[-0.3, 0, 0.01]} color={Math.random() > 0.7 ? activeLightColor : lightColor} speed={2 + Math.random()} />
           <BlinkingLight position={[0.35, 0, 0.01]} color="#10b981" speed={0.5} />
           {/* Vents */}
           <mesh position={[0, -0.1, 0.01]}>
              <planeGeometry args={[0.8, 0.05]} />
              <meshBasicMaterial color="#0f172a" />
           </mesh>
        </group>
      ))}

      {/* Glass Door Effect */}
      <mesh position={[0, 2, 0.65]}>
        <boxGeometry args={[1.2, 4, 0.05]} />
        <meshPhysicalMaterial 
            color="#a5f3fc" 
            transparent 
            opacity={0.15} 
            roughness={0} 
            metalness={0.1} 
            transmission={0.6}
        />
      </mesh>
    </group>
  );
};

const BlinkingLight = ({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) => {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame(({ clock }) => {
        if (ref.current) {
            // Simple blinking effect
            const t = clock.getElapsedTime();
            const intensity = (Math.sin(t * speed * 5) + 1) / 2; // 0 to 1
            // Random glitch
            const glitch = Math.random() > 0.95 ? 0 : 1;
            (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = (intensity * glitch * 2) + 0.5; // Ensure minimum brightness
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <circleGeometry args={[0.04, 16]} />
            <meshStandardMaterial color="black" emissive={color} emissiveIntensity={2} />
        </mesh>
    )
}

// --- 2. ELECTRIC CURRENT EFFECT ---
// Moves a glowing pulse along a path
const DataStream = ({ start, end, speed = 1, delay = 0 }: { start: THREE.Vector3, end: THREE.Vector3, speed?: number, delay?: number }) => {
    const ref = useRef<THREE.Mesh>(null!);
    const curve = useMemo(() => {
        // Create a curved path with a random control point for organic look
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        mid.y += 1 + Math.random() * 2; // Arch upwards
        return new THREE.CatmullRomCurve3([start, mid, end]);
    }, [start, end]);

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = (clock.getElapsedTime() * speed + delay) % 1;
            const pos = curve.getPoint(t);
            ref.current.position.copy(pos);
            
            // Scale creates a trail effect stretch
            const tangent = curve.getTangent(t).normalize();
            ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        }
    });

    // Draw the path faintly
    const points = useMemo(() => curve.getPoints(50), [curve]);

    return (
        <group>
            {/* The Path Wire */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={points.length}
                        array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#0044aa" opacity={0.5} transparent />
            </line>

            {/* The Electric Pulse */}
            <mesh ref={ref}>
                <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
                <meshBasicMaterial color="#00ffff" />
                <pointLight distance={2} intensity={2} color="#00ffff" />
            </mesh>
        </group>
    );
};

// --- 3. DIGITAL FLOOR GRID ---
const DigitalFloor = () => {
    const gridRef = useRef<THREE.Group>(null!);
    useFrame((state, delta) => {
        if(gridRef.current) {
            // Move grid slowly to simulate moving forward
            gridRef.current.position.z = (gridRef.current.position.z + delta * 0.5) % 2;
        }
    });

    return (
        <group position={[0, -0.1, 0]}>
             <gridHelper args={[60, 60, 0x00f3ff, 0x112233]} position={[0, 0, 0]} />
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                 <planeGeometry args={[60, 60]} />
                 <meshBasicMaterial color="#050505" transparent opacity={0.9} />
             </mesh>
        </group>
    )
}

// --- MAIN SCENE ---
const ServerTechScene: React.FC = () => {
  // Define positions for racks
  const rackPositions = [
      { pos: [-4, 0, -2], rot: 0.2 },
      { pos: [-3, 0, -5], rot: 0.1 },
      { pos: [-5, 0, 1], rot: 0.3 },
      { pos: [4, 0, -2], rot: -0.2 },
      { pos: [3, 0, -5], rot: -0.1 },
      { pos: [5, 0, 1], rot: -0.3 },
  ];

  const hubPosition = new THREE.Vector3(0, 1, -8); // Central Hub far back

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3, 6]} fov={60} />
      
      {/* Environment & Lighting (Brightened) */}
      <fog attach="fog" args={['#050505', 10, 40]} /> {/* Pushed fog back to reveal racks */}
      <ambientLight intensity={1.2} /> {/* Increased general brightness */}
      
      {/* Key Lights */}
      <pointLight position={[0, 10, 0]} intensity={3} color="#00aaff" distance={50} />
      <pointLight position={[10, 5, 5]} intensity={2} color="#ffffff" distance={30} />
      <pointLight position={[-10, 5, 5]} intensity={2} color="#ffffff" distance={30} />
      
      {/* Fill Light from front to illuminate racks */}
      <directionalLight position={[0, 2, 10]} intensity={2} color="#ffffff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={20} size={4} speed={0.2} opacity={0.5} color="#00f3ff" position={[0, 2, 0]}/>

      {/* Floor */}
      <DigitalFloor />

      {/* Server Racks */}
      <group>
          {rackPositions.map((rack, i) => (
              <group key={i}>
                  <ServerRack position={[rack.pos[0], rack.pos[1], rack.pos[2]]} rotation={[0, rack.rot, 0]} />
                  {/* Connections to Hub */}
                  <DataStream 
                    start={new THREE.Vector3(rack.pos[0], 3.5, rack.pos[2])} 
                    end={hubPosition} 
                    speed={0.5 + Math.random() * 0.5}
                    delay={Math.random()}
                  />
                  {/* Connections between racks (Mesh network look) */}
                  {i > 0 && i % 2 !== 0 && (
                      <DataStream 
                        start={new THREE.Vector3(rack.pos[0], 2, rack.pos[2])} 
                        end={new THREE.Vector3(rackPositions[i-1].pos[0], 2, rackPositions[i-1].pos[2])} 
                        speed={0.3}
                        delay={Math.random()}
                      />
                  )}
              </group>
          ))}
      </group>

      {/* Central Core/Hub (The "Brain") */}
      <group position={[0, 2, -8]}>
          <mesh>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshStandardMaterial color="#000" emissive="#00f3ff" emissiveIntensity={0.8} wireframe />
          </mesh>
          <mesh>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={3} />
          </mesh>
          <pointLight distance={15} intensity={5} color="#00f3ff" />
      </group>

    </>
  );
};

export default ServerTechScene;
