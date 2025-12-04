import svgPaths from "./svg-rzm29w0w4u";
import imgIPhone16ProWhiteTitaniumPortrait from "figma:asset/898d6b6326c8696cb62d35eae092fcdb03f4c874.png";
import { DraggablePhone, ProximityData } from "../components/DraggablePhone";
import { PhoneWithProximity } from "../components/PhoneWithProximity";
import { useState, useRef, useEffect } from "react";
import { Plus, Minus, ZoomIn, ZoomOut, MousePointer2, Move } from "lucide-react";
import { Button } from "../components/ui/button";
import { 
  RigidBody, 
  calculateMomentOfInertia, 
  checkCollision, 
  resolveCollision, 
  checkBoundaryCollision, 
  updatePhysics 
} from "../utils/physics";

type Tool = 'move' | 'interact';

function Time() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Time">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8.279px] items-center justify-center pl-[13.247px] pr-[4.968px] py-0 relative w-full">
          <p className="font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[18.214px] relative shrink-0 text-[14.075px] text-black text-center text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
            9:41
          </p>
        </div>
      </div>
    </div>
  );
}

function DynamicIslandSpacer() {
  return <div className="h-[8.279px] shrink-0 w-[102.662px]" data-name="Dynamic Island spacer" />;
}

function Battery() {
  return (
    <div className="h-[10.763px] relative shrink-0 w-[22.627px]" data-name="Battery">
      <div className="absolute bottom-0 left-0 right-[-0.01%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 11">
          <g id="Battery">
            <rect height="9.93501" id="Border" opacity="0.35" rx="3.14609" stroke="var(--stroke-0, black)" strokeWidth="0.827918" width="19.87" x="0.413959" y="0.413959" />
            <path d={svgPaths.p2847800} fill="var(--fill-0, black)" id="Cap" opacity="0.4" />
            <rect fill="var(--fill-0, black)" height="7.45126" id="Capacity" rx="2.06979" width="17.3863" x="1.65527" y="1.65601" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Levels() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Levels">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[5.795px] items-center justify-center pl-[4.968px] pr-[13.247px] py-0 relative w-full">
          <div className="h-[10.122px] relative shrink-0 w-[15.896px]" data-name="Cellular Connection">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(0, 0, 0, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
                <path clipRule="evenodd" d={svgPaths.p1685f000} fill="var(--fill-0, black)" fillRule="evenodd" id="Cellular Connection" />
              </svg>
            </div>
          </div>
          <div className="h-[10.207px] relative shrink-0 w-[14.192px]" data-name="Wifi">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(0, 0, 0, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 11">
                <path clipRule="evenodd" d={svgPaths.p21f7eac0} fill="var(--fill-0, black)" fillRule="evenodd" id="Wifi" />
              </svg>
            </div>
          </div>
          <Battery />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Frame">
      <Time />
      <DynamicIslandSpacer />
      <Levels />
    </div>
  );
}

function StatusBarIPhone() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[41.396px] items-start left-[calc(50%-0.27px)] pb-0 pt-[17.386px] px-0 top-0 translate-x-[-50%] w-[310.469px]" data-name="Status Bar - iPhone">
      <Frame />
    </div>
  );
}

function Screen() {
  return (
    <div className="absolute bg-white h-[674.25px] left-[-0.13%] overflow-x-clip overflow-y-auto right-[0.12%] rounded-[24px] top-[0.62px]" data-name="Screen">
      <div className="absolute bg-black bottom-[7.21px] h-[4.14px] left-[calc(50%+0.73px)] rounded-[82.8px] translate-x-[-50%] w-[110.952px]" data-name="Home bar" />
      <StatusBarIPhone />
    </div>
  );
}

function Bezel() {
  return (
    <div className="absolute h-[675px] left-0 top-0 w-[310.469px]" data-name="Bezel">
      <div className="absolute h-[710.526px] left-[-18.54px] top-[-17.76px] w-[347.54px]" data-name="iPhone 16 Pro - White Titanium - Portrait">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIPhone16ProWhiteTitaniumPortrait} />
      </div>
    </div>
  );
}

export default function Desktop() {
  const [phones, setPhones] = useState(1);
  const [, forceUpdate] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<Tool>('move');
  const [confirmedPhones, setConfirmedPhones] = useState<Set<number>>(new Set());
  const [groupSearchOpenPhones, setGroupSearchOpenPhones] = useState<Set<number>>(new Set());
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [patternOffsetX, setPatternOffsetX] = useState(0);
  const [patternOffsetY, setPatternOffsetY] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const bodiesRef = useRef<RigidBody[]>([]);
  
  // Pool of profile images to cycle through
  const profileImages = [
    "https://images.unsplash.com/photo-1669206053726-bfafe8d4537f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMGZhY2UlMjBwZXJzb258ZW58MXx8fHwxNzY0Nzg5MDE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFufGVufDF8fHx8MTc2NDcxMjI2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NjQ3MTIyNjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1622220104185-96a16a59a432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBwb3J0cmFpdCUyMHlvdW5nfGVufDF8fHx8MTc2NDcyODQ5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1667556205536-e5b04ee97ace?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBzbWlsaW5nJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2NDc5NDA3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ];
  
  // Use refs to always have the latest values during wheel / touch events
  const zoomRef = useRef(zoom);
  const panXRef = useRef(panX);
  const panYRef = useRef(panY);
  
  // Keep refs in sync with zoom
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  
  // Keep refs in sync with pan so cursor-centered zoom stays stable
  useEffect(() => {
    panXRef.current = panX;
    panYRef.current = panY;
  }, [panX, panY]);
  
  // Physics bodies
  const nextIdRef = useRef(2);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pinchStartRef = useRef({ distance: 0, zoom: 1 });
  const lastTimeRef = useRef(Date.now());
  
  // Phone dimensions
  const phoneWidth = 310.469;
  const phoneHeight = 675;

  // Keyboard shortcuts for tools
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();

      if (pressedKey === "m") {
        event.preventDefault();
        setTool("move");
        return;
      }

      if (pressedKey === "i") {
        event.preventDefault();
        setTool("interact");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Initialize first phone
  useEffect(() => {
    if (bodiesRef.current.length === 0) {
      const viewportWidth = window.innerWidth / zoom;
      const viewportHeight = window.innerHeight / zoom;
      
      const initialBody: RigidBody = {
        id: 1,
        x: viewportWidth / 2 - phoneWidth / 2,
        y: viewportHeight / 2 - phoneHeight / 2,
        rotation: 0,
        vx: 0,
        vy: 0,
        angularVelocity: 0,
        mass: 1,
        momentOfInertia: calculateMomentOfInertia(1, phoneWidth, phoneHeight),
        restitution: 0.5,
        friction: 0.4,
        width: phoneWidth,
        height: phoneHeight,
        isDragging: false,
        profileImage: profileImages[1 % profileImages.length]
      };
      
      bodiesRef.current.push(initialBody);
      forceUpdate(prev => prev + 1); // Force re-render after adding initial phone
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Physics loop
  useEffect(() => {
    const physicsLoop = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.033); // Cap at 30ms
      lastTimeRef.current = now;
      
      const bodies = bodiesRef.current;
      // Viewport boundaries scale inversely with zoom - zoom out = bigger world
      const viewportWidth = window.innerWidth / zoom;
      const viewportHeight = window.innerHeight / zoom;
      
      // Update physics for all bodies
      for (const body of bodies) {
        updatePhysics(body, dt);
        // Removed boundary collision - phones can now move freely
      }
      
      // Check collisions between all pairs
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const collision = checkCollision(bodies[i], bodies[j]);
          if (collision.hasCollision && collision.normal && collision.penetration !== undefined && collision.contactPoint) {
            resolveCollision(bodies[i], bodies[j], {
              normal: collision.normal,
              penetration: collision.penetration,
              contactPoint: collision.contactPoint
            });
          }
        }
      }
      
      forceUpdate(prev => prev + 1);
    };
    
    const interval = setInterval(physicsLoop, 1000 / 60); // 60 FPS
    
    return () => clearInterval(interval);
  }, [zoom]);

  // Handle pinch-to-zoom
  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        pinchStartRef.current = { distance, zoom: zoomRef.current };
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const scale = distance / pinchStartRef.current.distance;
        const baseZoom = pinchStartRef.current.zoom;
        const newZoom = Math.min(Math.max(baseZoom * scale, 0.25), 3);
        
        // Use the midpoint between the two touches as the zoom focal point
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        const currentZoom = zoomRef.current;
        const currentPanX = panXRef.current;
        const currentPanY = panYRef.current;
        
        // Convert touch center to canvas space using the current transform
        const canvasX = (centerX - currentPanX) / currentZoom;
        const canvasY = (centerY - currentPanY) / currentZoom;
        
        // Adjust pan so the point under the pinch center stays fixed on screen
        const newPanX = centerX - canvasX * newZoom;
        const newPanY = centerY - canvasY * newZoom;
        
        setZoom(newZoom);
        setPanX(newPanX);
        setPanY(newPanY);
      }
    };
    
    let wheelTimeout: NodeJS.Timeout | null = null;
    
    const handleWheel = (e: WheelEvent) => {
      // Check if this is a pinch gesture (ctrl+wheel on trackpad)
      if (e.ctrlKey) {
        e.preventDefault();
        setIsZooming(true);
        
        // Clear existing timeout
        if (wheelTimeout) clearTimeout(wheelTimeout);
        
        // Get mouse position in screen space
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Use refs to get the latest values
        const currentZoom = zoomRef.current;
        const currentPanX = panXRef.current;
        const currentPanY = panYRef.current;
        
        // Convert mouse position to canvas space (before zoom)
        const canvasX = (mouseX - currentPanX) / currentZoom;
        const canvasY = (mouseY - currentPanY) / currentZoom;
        
        // Calculate new zoom
        const delta = -e.deltaY;
        const zoomFactor = 1 + (delta * 0.005); // Reduced multiplier for smoother zoom
        const newZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.25), 3);
        
        // Adjust pan so the point under cursor stays in same place
        const newPanX = mouseX - canvasX * newZoom;
        const newPanY = mouseY - canvasY * newZoom;
        
        setZoom(newZoom);
        setPanX(newPanX);
        setPanY(newPanY);
        // Pattern offset stays the same during zoom
        
        // Reset zooming flag after a short delay
        wheelTimeout = setTimeout(() => {
          setIsZooming(false);
        }, 150);
      } else {
        // Two-finger pan on trackpad (no ctrl key)
        e.preventDefault();
        setIsPanning(true);
        
        // Clear existing timeout
        if (wheelTimeout) clearTimeout(wheelTimeout);
        
        // Pan the canvas and the pattern
        setPanX(prev => prev - e.deltaX);
        setPanY(prev => prev - e.deltaY);
        setPatternOffsetX(prev => prev - e.deltaX);
        setPatternOffsetY(prev => prev - e.deltaY);
        
        // Reset panning flag after a short delay
        wheelTimeout = setTimeout(() => {
          setIsPanning(false);
        }, 150);
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [zoom]);

  const addPhone = () => {
    // Spawn in center of current viewport (scaled by zoom)
    const viewportWidth = window.innerWidth / zoom;
    const viewportHeight = window.innerHeight / zoom;
    
    // Random position in center area
    const x = viewportWidth / 2 - phoneWidth / 2 + (Math.random() - 0.5) * 200;
    const y = viewportHeight / 2 - phoneHeight / 2 + (Math.random() - 0.5) * 200;
    
    const newBody: RigidBody = {
      id: nextIdRef.current,
      x,
      y,
      rotation: (Math.random() - 0.5) * 0.5, // Small random rotation
      vx: 0,
      vy: 0,
      angularVelocity: 0,
      mass: 1,
      momentOfInertia: calculateMomentOfInertia(1, phoneWidth, phoneHeight),
      restitution: 0.5,
      friction: 0.4,
      width: phoneWidth,
      height: phoneHeight,
      isDragging: false,
      profileImage: profileImages[nextIdRef.current % profileImages.length]
    };
    
    bodiesRef.current.push(newBody);
    nextIdRef.current++;
    forceUpdate(prev => prev + 1);
  };

  const removePhone = () => {
    if (bodiesRef.current.length > 1) {
      bodiesRef.current.pop();
      forceUpdate(prev => prev + 1);
    }
  };

  const handleZoomIn = () => {
    // Get center of viewport as zoom target
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Convert to canvas space
    const canvasX = (centerX - panX) / zoom;
    const canvasY = (centerY - panY) / zoom;
    
    // Calculate new zoom
    const newZoom = Math.min(zoom * 1.2, 3);
    
    // Adjust pan to keep center point stable
    const newPanX = centerX - canvasX * newZoom;
    const newPanY = centerY - canvasY * newZoom;
    
    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
  };

  const handleZoomOut = () => {
    // Get center of viewport as zoom target
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Convert to canvas space
    const canvasX = (centerX - panX) / zoom;
    const canvasY = (centerY - panY) / zoom;
    
    // Calculate new zoom
    const newZoom = Math.max(zoom / 1.2, 0.25);
    
    // Adjust pan to keep center point stable
    const newPanX = centerX - canvasX * newZoom;
    const newPanY = centerY - canvasY * newZoom;
    
    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
  };

  const handleUpdate = () => {
    forceUpdate(prev => prev + 1);
  };
  
  // Handle phone confirmation
  const handleConfirm = (phoneId: number) => {
    setConfirmedPhones(prev => {
      const next = new Set(prev);
      next.add(phoneId);
      return next;
    });
  };

  // Handle phone un-confirmation (back button or swipe home)
  const handleUnconfirm = (phoneId: number) => {
    setConfirmedPhones(prev => {
      const next = new Set(prev);
      next.delete(phoneId);
      return next;
    });
  };

  const handleGroupSearchStateChange = (phoneId: number, isInGroupSearch: boolean) => {
    setGroupSearchOpenPhones(prev => {
      const next = new Set(prev);
      if (isInGroupSearch) {
        next.add(phoneId);
      } else {
        next.delete(phoneId);
      }
      return next;
    });
  };

  // Calculate proximity data for a specific phone
  const calculateProximityData = (body: RigidBody): ProximityData[] => {
    const proximityList: ProximityData[] = [];
    
    const centerX = body.x + body.width / 2;
    const centerY = body.y + body.height / 2;
    
    for (const otherBody of bodiesRef.current) {
      if (otherBody.id === body.id) continue;
      
      const otherCenterX = otherBody.x + otherBody.width / 2;
      const otherCenterY = otherBody.y + otherBody.height / 2;
      
      const dx = otherCenterX - centerX;
      const dy = otherCenterY - centerY;
      const distancePx = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate edge-to-edge distance instead of center-to-center
      // Subtract the approximate radius of each phone (half width)
      const edgeDistancePx = Math.max(0, distancePx - body.width);
      
      // Convert pixels to cm using adjusted scale
      // Max distance is 8.5cm for proximity detection
      // Adjusted conversion factor to make distances appear more realistic
      const rawDistanceCm = edgeDistancePx * 0.0125;
      // Enforce a minimum readable distance so overlapping phones don't show as 0cm
      const distanceCm = Math.max(2, rawDistanceCm);
      
      // Rotate the offset vector into the phone's local coordinate system
      // This ensures positions rotate smoothly around the center as the phone rotates
      const cos = Math.cos(-body.rotation);
      const sin = Math.sin(-body.rotation);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      
      // Calculate angle from the rotated coordinates
      // (0° = East, 90° = South, 180° = West, 270° = North in phone's local space)
      let angleDeg = Math.atan2(localY, localX) * (180 / Math.PI);
      if (angleDeg < 0) angleDeg += 360;
      
      // Convert to cardinal direction based on angle
      let direction: string;
      if (angleDeg >= 337.5 || angleDeg < 22.5) {
        direction = "E";
      } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
        direction = "SE";
      } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
        direction = "S";
      } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
        direction = "SW";
      } else if (angleDeg >= 157.5 && angleDeg < 202.5) {
        direction = "W";
      } else if (angleDeg >= 202.5 && angleDeg < 247.5) {
        direction = "NW";
      } else if (angleDeg >= 247.5 && angleDeg < 292.5) {
        direction = "N";
      } else {
        direction = "NE";
      }
      
      proximityList.push({
        phoneId: otherBody.id,
        distanceCm: distanceCm,
        direction: direction,
        degrees: Math.round(angleDeg),
        relativeX: localX, // Rotated to phone's local space
        relativeY: localY, // Rotated to phone's local space
      });
    }
    
    // Sort by distance (closest first)
    proximityList.sort((a, b) => a.distanceCm - b.distanceCm);
    
    return proximityList;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      {/* Container for canvas */}
      <div 
        ref={canvasRef}
        className="relative size-full overflow-hidden" 
        style={{ backgroundColor: '#F2F2F2', width: '100%', height: '100%' }}
      >
        {/* SVG Pattern for triangular lattice - Fixed layer that doesn't zoom */}
        <svg 
          className="absolute inset-0 pointer-events-none" 
          width="100%" 
          height="100%"
          style={{
            transform: `translate(${patternOffsetX % 60}px, ${patternOffsetY % 52}px)`,
          }}
        >
          <defs>
            <pattern id="triangular-lattice" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              {/* Row 1 */}
              <circle cx="0" cy="0" r="1.5" fill="#E5E5E6" />
              <circle cx="30" cy="0" r="1.5" fill="#E5E5E6" />
              <circle cx="60" cy="0" r="1.5" fill="#E5E5E6" />
              {/* Row 2 - offset by half */}
              <circle cx="15" cy="26" r="1.5" fill="#E5E5E6" />
              <circle cx="45" cy="26" r="1.5" fill="#E5E5E6" />
              {/* Row 3 */}
              <circle cx="0" cy="52" r="1.5" fill="#E5E5E6" />
              <circle cx="30" cy="52" r="1.5" fill="#E5E5E6" />
              <circle cx="60" cy="52" r="1.5" fill="#E5E5E6" />
            </pattern>
          </defs>
          <rect x="-1000" y="-1000" width="200%" height="200%" fill="url(#triangular-lattice)" />
        </svg>

        {/* Zoomable and pannable canvas */}
        <div 
          className="absolute" 
          data-name="Desktop - 1"
          style={{
            width: window.innerWidth,
            height: window.innerHeight,
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: '0 0',
            overflow: 'visible',
            willChange: 'transform',
            transition: (isZooming || isPanning) ? 'none' : 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Draggable phones */}
          {bodiesRef.current.map((body) => (
            <DraggablePhone 
              key={body.id} 
              body={body}
              zoom={zoom}
              proximityData={calculateProximityData(body)}
              onUpdate={handleUpdate}
              tool={tool}
            >
              <PhoneWithProximity 
                body={body} 
                proximityData={calculateProximityData(body)} 
                tool={tool} 
                allBodies={bodiesRef.current}
                onConfirm={handleConfirm}
                onUnconfirm={handleUnconfirm}
                confirmedPhones={confirmedPhones}
                groupSearchOpenPhones={groupSearchOpenPhones}
                onGroupSearchStateChange={handleGroupSearchStateChange}
              />
            </DraggablePhone>
          ))}
        </div>
      </div>

      {/* Toolbar - Bottom Center - Fixed outside zoom transform */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md rounded-full px-3 py-2 shadow-lg flex items-center gap-1 pointer-events-auto">
          {/* Tool Selection */}
          <Button 
            size="sm" 
            variant={tool === 'move' ? 'default' : 'ghost'}
            onClick={() => setTool('move')}
            className="h-9 w-9 p-0 rounded-full"
          >
            <Move className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={tool === 'interact' ? 'default' : 'ghost'}
            onClick={() => setTool('interact')}
            className="h-9 w-9 p-0 rounded-full"
          >
            <MousePointer2 className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Phone Count */}
          <Button 
            size="sm" 
            variant="ghost"
            onClick={removePhone}
            disabled={bodiesRef.current.length <= 1}
            className="h-9 w-9 p-0 rounded-full"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-8 text-center select-none">{bodiesRef.current.length}</span>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={addPhone}
            className="h-9 w-9 p-0 rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Zoom Controls */}
          <Button 
            size="sm" 
            variant="ghost"
            onClick={handleZoomOut}
            className="h-9 w-9 p-0 rounded-full"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-12 text-center select-none">{Math.round(zoom * 100)}%</span>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={handleZoomIn}
            className="h-9 w-9 p-0 rounded-full"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}