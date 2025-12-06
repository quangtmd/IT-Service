
// @ts-nocheck
import * as THREE from 'three';
import React, { useRef } from 'react';
import { useFrame, useThree, MeshProps, ThreeElements } from '@react-three/fiber';
import { useScroll, Image, Text, useTexture } from '@react-three/drei';

const TechImage: React.FC<{ url: string; scale: [number, number]; position: THREE.Vector3 }> = ({ url, scale, position }) => {
  return (
    <Image url={url} scale={scale} position={position} />
  );
};

const FadingHeroImage = (props: MeshProps) => {
    const ref = useRef<THREE.Mesh>(null!);
    const scroll = useScroll();
    const texture = useTexture("https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=1920&auto=format&fit=crop");
    
    useFrame(() => {
        if (ref.current && ref.current.material) {
            (ref.current.material as THREE.MeshBasicMaterial).opacity = scroll.range(0.8, 0.2) * 0.5;
        }
    });
    
    return (
        <mesh ref={ref} {...props}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={texture} transparent opacity={0} />
        </mesh>
    );
};

const FadingHeroText = () => {
    const { width: w } = useThree(state => state.viewport);
    const scroll = useScroll();
    const text1Ref = useRef<any>(null!);
    const text2Ref = useRef<any>(null!);

    useFrame(() => {
        const opacity = scroll.range(0.8, 0.2); 
        if (text1Ref.current) text1Ref.current.fillOpacity = opacity;
        if (text2Ref.current) text2Ref.current.fillOpacity = opacity;
    });

    return (
        <>
            <Text
                ref={text1Ref}
                maxWidth={w * 0.7}
                textAlign="center"
                fontSize={w / 10}
                color="white"
                anchorX="center"
                anchorY="middle"
                font="/Inter-Bold.ttf"
                position={[0, 0, 1]}
                fillOpacity={0}
            >
                IQ TECHNOLOGY
            </Text>
            <Text
                ref={text2Ref}
                maxWidth={w * 0.6}
                textAlign="center"
                fontSize={w / 30}
                color="#d1d5db"
                anchorX="center"
                anchorY="top"
                font="/Inter-Regular.ttf"
                position={[0, -w/18, 1]}
                fillOpacity={0}
            >
                Giải Pháp Công Nghệ Toàn Diện Cho Doanh Nghiệp Của Bạn
            </Text>
        </>
    );
};


const Scene = () => {
    const { width: w, height: h } = useThree(state => state.viewport);
    const scroll = useScroll();
    const group = useRef<THREE.Group>(null!);

    const imageData = [
        { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200', position: new THREE.Vector3(1, -h * 0.2, -4), scale: [w / 3.5, w / 5] as [number, number] },
        { url: 'https://images.unsplash.com/photo-1555774698-0b77e0abfe3d?q=80&w=1200', position: new THREE.Vector3(-1.2, -h * 0.8, -3), scale: [w / 3, w / 4] as [number, number] },
        { url: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1200', position: new THREE.Vector3(1.5, -h * 1.5, -3.5), scale: [w / 3.5, w / 3.5] as [number, number] },
        { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200', position: new THREE.Vector3(-1, -h * 2.3, -5), scale: [w / 2.5, w / 4] as [number, number] },
        { url: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1200', position: new THREE.Vector3(1.2, -h * 3.0, -3), scale: [w / 2.8, w / 2.8] as [number, number] },
    ];

    useFrame((state, delta) => {
        const scrollOffset = scroll.offset;
        const totalPages = 4;
        
        if (group.current) {
            group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, scrollOffset * h * totalPages, 0.1);
        }
        
        state.camera.position.z = THREE.MathUtils.lerp(5, -10, scrollOffset);
    });

    return (
        <group ref={group}>
            <Text fontSize={w / 20} position={[0, 0.5, -1]} color="white" anchorX="center" anchorY="middle">SCROLL DOWN</Text>
            {imageData.map((img, i) => (
                <TechImage key={i} {...img} />
            ))}
            <group position={[0, -h * (4 - 0.5), 0]}>
                <FadingHeroImage scale={[w * 1.5, h * 1.5, 1]} />
                <FadingHeroText />
            </group>
        </group>
    );
};

export default Scene;
