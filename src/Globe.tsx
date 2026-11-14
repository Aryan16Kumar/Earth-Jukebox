import { Component, Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { regions, asset, type Region } from "./scenes";
function position(
  lat: number,
  lon: number,
  r = 2.025,
): [number, number, number] {
  const p = ((90 - lat) * Math.PI) / 180,
    t = ((lon + 180) * Math.PI) / 180;
  return [
    -r * Math.sin(p) * Math.cos(t),
    r * Math.cos(p),
    r * Math.sin(p) * Math.sin(t),
  ];
}
function Planet({
  rotate,
  onSelect,
}: {
  rotate: boolean;
  onSelect: (r: Region) => void;
}) {
  const texture = useTexture(asset("earth-night.png"));
  const group = useRef<THREE.Group>(null);
  const earth = useRef<THREE.Mesh>(null!);
  texture.colorSpace = THREE.SRGBColorSpace;
  useFrame((_, delta) => {
    if (rotate && group.current) group.current.rotation.y += delta * 0.025;
  });
  return (
    <group ref={group} rotation={[0, -2.8, 0.06]}>
      <mesh ref={earth}>
        <sphereGeometry args={[2, 96, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <mesh scale={1.012}>
        <sphereGeometry args={[2, 64, 48]} />
        <meshBasicMaterial
          color="#69929e"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      {regions.map((r) => (
        <mesh
          key={"area-" + r.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(r);
          }}
        >
          <sphereGeometry
            args={[
              2.012,
              24,
              16,
              ((r.bounds[0] + 180) * Math.PI) / 180,
              ((r.bounds[2] - r.bounds[0]) * Math.PI) / 180,
              ((90 - r.bounds[3]) * Math.PI) / 180,
              ((r.bounds[3] - r.bounds[1]) * Math.PI) / 180,
            ]}
          />
          <meshBasicMaterial
            color="#e7c28e"
            transparent
            opacity={0.055}
            depthWrite={false}
          />
        </mesh>
      ))}
      {regions.map((r) => (
        <group key={r.id} position={position(r.lat, r.lon)}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelect(r);
            }}
          >
            <sphereGeometry args={[0.038, 16, 16]} />
            <meshBasicMaterial color="#edc78d" />
          </mesh>
          <Html distanceFactor={7} occlude={[earth]} center>
            <button
              className="globe-label"
              onClick={() => onSelect(r)}
              tabIndex={-1}
            >
              {r.name}
              <span>LISTEN ↗</span>
            </button>
          </Html>
        </group>
      ))}
    </group>
  );
}
class Boundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function Globe({
  rotate,
  onSelect,
  onInteract,
  onFail,
}: {
  rotate: boolean;
  onSelect: (r: Region) => void;
  onInteract: () => void;
  onFail: () => void;
}) {
  return (
    <Boundary onFail={onFail}>
      <Canvas
        camera={{ position: [0, 0.4, 6.4], fov: 43 }}
        dpr={[1, 1.5]}
        fallback={
          <p className="webgl-fallback">
            Use the region list below to explore.
          </p>
        }
        onPointerDown={onInteract}
      >
        <Suspense fallback={null}>
          <Planet rotate={rotate} onSelect={onSelect} />
          <Stars
            radius={70}
            depth={20}
            count={650}
            factor={1.3}
            saturation={0}
            fade
          />
          <OrbitControls
            enablePan={false}
            minDistance={3.1}
            maxDistance={9}
            enableDamping
            onStart={onInteract}
          />
        </Suspense>
      </Canvas>
    </Boundary>
  );
}
