import { OrbitControls, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type Keyword = { word: string; weight: number };

function Word({ word, position, size }: { word: string; position: [number, number, number]; size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.lookAt(0, 0, 0);
    }
  });
  return (
    <Text
      ref={ref}
      position={position}
      fontSize={size}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      {word}
    </Text>
  );
}

export default function WordCloud3D({ words }: { words: Keyword[] }) {
  const radius = 3;
  const positions: [number, number, number][] = words.map((_, i) => {
    const phi = Math.acos(-1 + (2 * i) / words.length);
    const theta = Math.sqrt(words.length * Math.PI) * phi;
    return [
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi),
    ];
  });

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{ width: '100%', height: '80vh', background: '#000' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {words.map((w, i) => (
        <Word
          key={i}
          word={w.word}
          position={positions[i]}
          size={0.5 + Math.min(2, w.weight * 0.5)}
        />
      ))}
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1.0} />
    </Canvas>
  );
}
