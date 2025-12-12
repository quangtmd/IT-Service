
// @ts-nocheck
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Sparkles, Text, Ring, Circle, Plane } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. SERVER RACK COMPONENT ---
const ServerRack = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
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
            const t = clock.getElapsedTime();
            const intensity = (Math.sin(t * speed * 5) + 1) / 2;
            const glitch = Math.random() > 0.95 ? 0 : 1;
            (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = (intensity * glitch * 2) + 0.5;
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
const DataStream = ({ start, end, speed = 1, delay = 0 }: { start: THREE.Vector3, end: THREE.Vector3, speed?: number, delay?: number }) => {
    const ref = useRef<THREE.Mesh>(null!);
    const curve = useMemo(() => {
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        mid.y += 1 + Math.random() * 2;
        return new THREE.CatmullRomCurve3([start, mid, end]);
    }, [start, end]);

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = (clock.getElapsedTime() * speed + delay) % 1;
            const pos = curve.getPoint(t);
            ref.current.position.copy(pos);
            const tangent = curve.getTangent(t).normalize();
            ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        }
    });

    const points = useMemo(() => curve.getPoints(50), [curve]);

    return (
        <group>
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={points.length}
                        array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#0044aa" opacity={0.3} transparent />
            </line>
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

// --- 4. NEW HOLOGRAPHIC CONTROL PANEL (Replaces Sphere) ---
const HoloConsole = ({ position }: { position: [number, number, number] }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const ring1Ref = useRef<THREE.Mesh>(null!);
    const ring2Ref = useRef<THREE.Mesh>(null!);
    const ring3Ref = useRef<THREE.Mesh>(null!);

    useFrame((state, delta) => {
        if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.2;
        if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.1;
        if (ring3Ref.current) ring3Ref.current.rotation.x += delta * 0.3;
        
        // Gentle hovering
        if(groupRef.current) {
             groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Main Screen - Hexagon-ish Plane */}
            <mesh rotation={[0, 0, 0]}>
                <circleGeometry args={[1.5, 6]} />
                <meshBasicMaterial color="#000000" opacity={0.4} transparent side={THREE.DoubleSide} />
            </mesh>
            {/* Tech Grid Texture Simulation on Screen */}
            <mesh position={[0, 0, 0.01]} rotation={[0, 0, 0]}>
                 <planeGeometry args={[2, 2]} />
                 <meshBasicMaterial color="#00f3ff" wireframe opacity={0.1} transparent />
            </mesh>
            
            {/* Rotating Rings (HUD Elements) */}
            <group rotation={[0, 0, 0]}>
                {/* Outer Ring */}
                <Ring ref={ring1Ref} args={[1.6, 1.65, 64]} >
                    <meshBasicMaterial color="#00f3ff" side={THREE.DoubleSide} transparent opacity={0.8} />
                </Ring>
                
                {/* Middle Segmented Ring */}
                <Ring ref={ring2Ref} args={[1.3, 1.4, 32]} rotation={[0,0,1]}>
                     <meshBasicMaterial color="#ff0055" side={THREE.DoubleSide} transparent opacity={0.6} wireframe />
                </Ring>

                {/* Vertical Orbit Ring */}
                <Ring ref={ring3Ref} args={[1.8, 1.82, 64]} rotation={[1.57, 0, 0]}>
                     <meshBasicMaterial color="#00f3ff" side={THREE.DoubleSide} transparent opacity={0.4} />
                </Ring>
            </group>

            {/* Holographic Text/Data - Removed Font Prop to prevent crash */}
            <Text 
                position={[0, 0.5, 0.1]} 
                fontSize={0.2} 
                color="#00f3ff" 
                anchorX="center" 
                anchorY="middle"
            >
                SYSTEM ONLINE
            </Text>
             <Text 
                position={[0, 0, 0.1]} 
                fontSize={0.1} 
                color="white" 
                anchorX="center" 
                anchorY="middle"
            >
                IQ TECHNOLOGY CORE
            </Text>
             <Text 
                position={[0, -0.5, 0.1]} 
                fontSize={0.15} 
                color="#ff0055" 
                anchorX="center" 
                anchorY="middle"
            >
                DATA: SECURE
            </Text>

            {/* Connecting Beam downward */}
            <mesh position={[0, -5, 0]}>
                <cylinderGeometry args={[0.1, 0.5, 10, 16]} />
                <meshBasicMaterial color="#00f3ff" transparent opacity={0.1} />
            </mesh>
            
            {/* Glow Light */}
            <pointLight distance={5} intensity={5} color="#00f3ff" />
        </group>
    );
};

// --- 5. MOVING STARS ---
const MovingStars = () => {
    const starsRef = useRef<THREE.Group>(null!);
    useFrame((state, delta) => {
        if(starsRef.current) {
            starsRef.current.rotation.y += delta * 0.05; // Rotate stars slowly
            starsRef.current.rotation.x += delta * 0.01;
        }
    });

    return (
        <group ref={starsRef}>
             <Stars radius={120} depth={50} count={8000} factor={4} saturation={0} fade speed={2} />
        </group>
    )
}


// --- MAIN SCENE ---
const ServerTechScene: React.FC = () => {
  const rackPositions = [
      { pos: [-4, 0, -2], rot: 0.2 },
      { pos: [-3, 0, -5], rot: 0.1 },
      { pos: [-5, 0, 1], rot: 0.3 },
      { pos: [4, 0, -2], rot: -0.2 },
      { pos: [3, 0, -5], rot: -0.1 },
      { pos: [5, 0, 1], rot: -0.3 },
  ];

  const hubPosition: [number, number, number] = [0, 2.5, -6];

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3, 6]} fov={60} />
      
      <fog attach="fog" args={['#050505', 10, 45]} />
      <ambientLight intensity={1.2} />
      
      <pointLight position={[0, 10, 0]} intensity={3} color="#00aaff" distance={50} />
      <pointLight position={[10, 5, 5]} intensity={2} color="#ffffff" distance={30} />
      <pointLight position={[-10, 5, 5]} intensity={2} color="#ffffff" distance={30} />
      
      <directionalLight position={[0, 2, 10]} intensity={2} color="#ffffff" />
      
      {/* Animated Stars */}
      <MovingStars />
      
      <Sparkles count={300} scale={25} size={4} speed={0.4} opacity={0.5} color="#00f3ff" position={[0, 2, 0]}/>

      <DigitalFloor />

      <group>
          {rackPositions.map((rack, i) => (
              <group key={i}>
                  <ServerRack position={[rack.pos[0], rack.pos[1], rack.pos[2]]} rotation={[0, rack.rot, 0]} />
                  <DataStream 
                    start={new THREE.Vector3(rack.pos[0], 3.5, rack.pos[2])} 
                    end={new THREE.Vector3(...hubPosition)} 
                    speed={0.5 + Math.random() * 0.5}
                    delay={Math.random()}
                  />
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

      {/* Replaced Sphere with Holographic Control Panel */}
      <HoloConsole position={hubPosition} />

    </>
  );
};

export default ServerTechScene;
