
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. SERVER RACK COMPONENT ---
const ServerRack = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  const rackHeight = 3.5;
  const rackWidth = 1.2;
  const rackDepth = 1.2;
  
  // Generate server units (blades) inside the rack
  const serverCount = 10;
  const servers = useMemo(() => {
    return new Array(serverCount).fill(0).map((_, i) => ({
      y: -rackHeight/2 + 0.3 + i * 0.32,
      blinkSpeed: 0.5 + Math.random() * 2,
      phase: Math.random() * Math.PI
    }));
  }, []);

  return (
    <group position={position} rotation={rotation}>
      {/* Rack Frame (Cabinet) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[rackWidth, rackHeight, rackDepth]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Glass Door Reflection */}
      <mesh position={[0, 0, rackDepth/2 + 0.01]}>
        <planeGeometry args={[rackWidth, rackHeight]} />
        <meshPhysicalMaterial 
            color="#88ccff" 
            transparent 
            opacity={0.2} 
            roughness={0} 
            metalness={0.9} 
            clearcoat={1}
            emissive="#0044aa"
            emissiveIntensity={0.1}
        />
      </mesh>

      {/* Server Units */}
      {servers.map((server, i) => (
        <group key={i} position={[0, server.y, rackDepth/2]}>
           {/* Server Faceplate */}
           <mesh position={[0, 0, 0.01]}>
             <planeGeometry args={[rackWidth - 0.1, 0.25]} />
             <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
           </mesh>
           {/* Blinking LEDs */}
           <ServerLED position={[-0.4, 0, 0.02]} color="#00ff88" speed={server.blinkSpeed} />
           <ServerLED position={[-0.35, 0, 0.02]} color="#00ccff" speed={server.blinkSpeed * 1.5} />
           <ServerLED position={[0.4, 0, 0.02]} color="#ff3366" speed={server.blinkSpeed * 0.3} isError={Math.random() > 0.9} />
           
           {/* Vents texture simulation (lines) */}
           <mesh position={[0, -0.05, 0.02]}>
              <planeGeometry args={[0.6, 0.05]} />
              <meshBasicMaterial color="#000000" />
           </mesh>
        </group>
      ))}
    </group>
  );
};

const ServerLED = ({ position, color, speed, isError }: { position: [number, number, number], color: string, speed: number, isError?: boolean }) => {
    const ref = useRef<THREE.Mesh>(null!);
    
    useFrame(({ clock }) => {
        if (ref.current) {
            // Sharp blinking effect
            const t = clock.getElapsedTime();
            const val = Math.sin(t * speed * 5);
            const intensity = val > 0.5 ? 3 : 0.2; // Brighter on/off
            
            // Random occasional flicker
            const flicker = Math.random() > 0.95 ? 0 : 1;
            
            (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity * flicker;
            if(isError) {
               (ref.current.material as THREE.MeshStandardMaterial).color.set(val > 0.8 ? "#ff0000" : "#330000"); 
            }
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <circleGeometry args={[0.03, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
    )
}

// --- 2. ORGANIZED DATA CABLES (Streams) ---
const DataCable = ({ start, end, color = "#3b82f6" }: { start: THREE.Vector3, end: THREE.Vector3, color?: string }) => {
    const curve = useMemo(() => {
        const mid1 = new THREE.Vector3(start.x, start.y + 2, start.z); // Go up
        const mid2 = new THREE.Vector3(end.x, end.y + 2, end.z); // Go over
        return new THREE.CatmullRomCurve3([start, mid1, mid2, end]);
    }, [start, end]);

    const packetRef = useRef<THREE.Mesh>(null!);

    useFrame(({ clock }) => {
        if (packetRef.current) {
            const t = (clock.getElapsedTime() * 0.5) % 1;
            const pos = curve.getPoint(t);
            packetRef.current.position.copy(pos);
            
            const tangent = curve.getTangent(t).normalize();
            packetRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        }
    });

    const points = useMemo(() => curve.getPoints(30), [curve]);

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
                <lineBasicMaterial color={color} opacity={0.3} transparent linewidth={2} />
            </line>
            <mesh ref={packetRef}>
                <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
                <meshBasicMaterial color={color} />
                <pointLight distance={2.5} intensity={4} color={color} />
            </mesh>
        </group>
    );
};

// --- 3. REFLECTIVE FLOOR ---
const TechFloor = () => {
    return (
        <group position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <gridHelper args={[40, 40, 0x445566, 0x1e293b]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0.01]} />
             <mesh>
                 <planeGeometry args={[100, 100]} />
                 <meshStandardMaterial 
                    color="#0a1120" 
                    roughness={0.05} 
                    metalness={0.9} 
                 />
             </mesh>
        </group>
    )
}

// --- MAIN SCENE ---
const ServerTechScene: React.FC = () => {
  // Define positions for 2 rows of racks (Aisle layout)
  const leftRowX = -2.5;
  const rightRowX = 2.5;
  const rackZStart = -2;
  const rackGap = 2;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={60} />
      
      {/* Environment Lighting - BRIGHTER */}
      <ambientLight intensity={0.6} color="#ccccff" />
      
      {/* Overhead Panel Lights */}
      <directionalLight position={[0, 10, 0]} intensity={1.5} color="#ffffff" castShadow />
      <pointLight position={[0, 5, 5]} intensity={1} color="#ffffff" />
      
      {/* Aisle Glow */}
      <pointLight position={[0, 2, -10]} intensity={3} color="#3b82f6" distance={30} />
      
      {/* Subtle Fill */}
      <hemisphereLight groundColor="#000000" intensity={0.5} />

      {/* Fog for depth - slightly lighter */}
      <fog attach="fog" args={['#050a14', 5, 25]} />

      {/* Racks - Left Row */}
      {[0, 1, 2, 3].map(i => (
          <group key={`L-${i}`}>
            <ServerRack position={[leftRowX, 0, rackZStart - i * rackGap]} rotation={[0, 0.2, 0]} />
            <DataCable 
                start={new THREE.Vector3(leftRowX, 1.5, rackZStart - i * rackGap)} 
                end={new THREE.Vector3(0, 1.5, -10)} 
                color="#00ccff"
            />
          </group>
      ))}

      {/* Racks - Right Row */}
      {[0, 1, 2, 3].map(i => (
          <group key={`R-${i}`}>
            <ServerRack position={[rightRowX, 0, rackZStart - i * rackGap]} rotation={[0, -0.2, 0]} />
             <DataCable 
                start={new THREE.Vector3(rightRowX, 1.5, rackZStart - i * rackGap)} 
                end={new THREE.Vector3(0, 1.5, -10)} 
                color="#ff00aa"
            />
          </group>
      ))}

      <TechFloor />
      
      {/* Camera Movement */}
      <CameraDolly />
    </>
  );
};

// Simple camera movement
const CameraDolly = () => {
    useFrame((state) => {
        const x = state.pointer.x * 0.5;
        const y = state.pointer.y * 0.2;
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x, 0.05);
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, y, 0.05);
        state.camera.lookAt(0, 0, -8); 
    });
    return null;
}

export default ServerTechScene;
