import { Component, Suspense, useRef, useEffect, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
  selected,
  interacting,
  dragging,
}: {
  selected?: Region;
  interacting: React.MutableRefObject<boolean>;
  dragging: React.MutableRefObject<boolean>;
  rotate: boolean;
  onSelect: (r: Region) => void;
}) {
  const texture = useTexture(asset("earth-day.jpg"));
  const group = useRef<THREE.Group>(null);
  const earth = useRef<THREE.Mesh>(null!);
  const target = useRef<THREE.Quaternion | null>(null);
  useEffect(() => {
    if (!selected) {
      target.current = null;
      return;
    }
    interacting.current = false;
    const normal = new THREE.Vector3(
      ...position(selected.lat, selected.lon),
    ).normalize();
    target.current = new THREE.Quaternion().setFromUnitVectors(
      normal,
      new THREE.Vector3(0, 0, 1),
    );
  }, [selected]);
  const gl = useThree((state) => state.gl);
  texture.anisotropy = gl.capabilities.getMaxAnisotropy();
  texture.colorSpace = THREE.SRGBColorSpace;
  useFrame(({ camera }, delta) => {
    if (target.current && group.current && !interacting.current) {
      target.current.setFromEuler(
        new THREE.Euler(
          (selected!.lat * Math.PI) / 180,
          -Math.PI / 2 - (selected!.lon * Math.PI) / 180,
          0,
          "XYZ",
        ),
      );
      target.current.premultiply(
        new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          camera.position.clone().normalize(),
        ),
      );
      group.current.quaternion.slerp(
        target.current,
        matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 1
          : 1 - Math.exp(-delta * 4),
      );
    }
    if (rotate && !dragging.current && group.current)
      group.current.rotation.y += delta * 0.025;
  });
  return (
    <group ref={group} rotation={[0.12, -2.8, 0.06]}>
      <mesh ref={earth}>
        <sphereGeometry args={[2, 128, 96]} />
        <meshStandardMaterial map={texture} roughness={0.92} metalness={0} />
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
            color="#C5F277"
            transparent
            opacity={selected?.id === r.id ? 0.18 : 0.025}
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
            <meshBasicMaterial color="#C5F277" />
          </mesh>
          <Html occlude={[earth]} center zIndexRange={[5, 0]}>
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
  selected,
  presentation = false,
}: {
  presentation?: boolean;
  selected?: Region;
  rotate: boolean;
  onSelect: (r: Region) => void;
  onInteract?: () => void;
  onFail: () => void;
}) {
  const interacting = useRef(false);
  const dragging = useRef(false);
  function interact() {
    interacting.current = true;
    dragging.current = true;
    onInteract?.();
  }
  return (
    <Boundary onFail={onFail}>
      <Canvas
        camera={{
          position: [0, 0.4, presentation ? 8 : 6.4],
          fov: presentation ? 60 : 43,
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        fallback={
          <p className="webgl-fallback">
            Use the region list below to explore.
          </p>
        }
        onPointerDown={interact}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[-3, 4, 5]} intensity={1.9} />
          <Planet
            rotate={rotate}
            onSelect={onSelect}
            selected={selected}
            interacting={interacting}
            dragging={dragging}
          />
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
            minDistance={3.8}
            maxDistance={presentation ? 12 : 9}
            enableDamping
            onStart={interact}
            onEnd={() => {
              dragging.current = false;
            }}
          />
        </Suspense>
      </Canvas>
    </Boundary>
  );
}
