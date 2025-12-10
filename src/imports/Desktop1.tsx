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

// Group types
interface PotentialGroup {
  id: string; // Unique identifier for the group
  memberIds: Set<number>; // Phone IDs in this potential group
  confirmedIds: Set<number>; // Phone IDs that have confirmed
}

interface ConfirmedGroup {
  id: string; // Unique identifier for the group
  memberIds: Set<number>; // Phone IDs in this confirmed group
}

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
  const [zoom, setZoom] = useState(0.5);
  const [tool, setTool] = useState<Tool>('move');
  const [confirmedPhones, setConfirmedPhones] = useState<Set<number>>(new Set());
  const [groupSearchOpenPhones, setGroupSearchOpenPhones] = useState<Set<number>>(new Set());
  const [potentialGroups, setPotentialGroups] = useState<Map<string, PotentialGroup>>(new Map());
  const [confirmedGroups, setConfirmedGroups] = useState<Map<string, ConfirmedGroup>>(new Map());
  // Track phones that were recently removed to suppress notifications
  const [recentlyRemovedPhones, setRecentlyRemovedPhones] = useState<Set<number>>(new Set());
  const recentlyRemovedPhonesRef = useRef<Set<number>>(new Set());
  const [showDebugMenu, setShowDebugMenu] = useState(true);
  const nextGroupIdRef = useRef(1);
  const nextConfirmedGroupIdRef = useRef(1);
  const potentialGroupsRef = useRef<Map<string, PotentialGroup>>(new Map());
  const confirmedGroupsRef = useRef<Map<string, ConfirmedGroup>>(new Map());
  
  // Keep refs in sync with state
  useEffect(() => {
    potentialGroupsRef.current = potentialGroups;
  }, [potentialGroups]);
  
  useEffect(() => {
    confirmedGroupsRef.current = confirmedGroups;
  }, [confirmedGroups]);
  
  useEffect(() => {
    recentlyRemovedPhonesRef.current = recentlyRemovedPhones;
  }, [recentlyRemovedPhones]);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [patternOffsetX, setPatternOffsetX] = useState(0);
  const [patternOffsetY, setPatternOffsetY] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const bodiesRef = useRef<RigidBody[]>([]);
  const frameCountRef = useRef(0);
  
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
  const nextIdRef = useRef(3);
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

  // Initialize default phones (2 phones)
  useEffect(() => {
    if (bodiesRef.current.length === 0) {
      const viewportWidth = window.innerWidth / zoom;
      const viewportHeight = window.innerHeight / zoom;
      
      // First phone - centered
      const initialBody1: RigidBody = {
        id: 1,
        x: viewportWidth / 2 - phoneWidth / 2 - 200,
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
      
      // Second phone - offset to the right
      const initialBody2: RigidBody = {
        id: 2,
        x: viewportWidth / 2 - phoneWidth / 2 + 200,
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
        profileImage: profileImages[2 % profileImages.length]
      };
      
      bodiesRef.current.push(initialBody1);
      bodiesRef.current.push(initialBody2);
      forceUpdate(prev => prev + 1); // Force re-render after adding initial phones
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Get all phone IDs that are in confirmed groups (should not adjust based on proximity)
  const getPhonesInConfirmedGroups = (): Set<number> => {
    const phonesInConfirmedGroups = new Set<number>();
    confirmedGroupsRef.current.forEach(group => {
      group.memberIds.forEach(id => phonesInConfirmedGroups.add(id));
    });
    return phonesInConfirmedGroups;
  };

  // Clear "recently removed" flag when users move AWAY from proximity
  // This allows notifications to reappear when they come back into proximity
  // This function is called from the physics loop to check proximity frequently
  const clearRecentlyRemovedFlagsOnProximity = () => {
    if (recentlyRemovedPhonesRef.current.size === 0) return;
    
    const phonesToClear = new Set<number>();
    const phonesInConfirmedGroups = getPhonesInConfirmedGroups();
    const PROXIMITY_THRESHOLD_CM = 8.5;
    
    recentlyRemovedPhonesRef.current.forEach(phoneId => {
      const phone = bodiesRef.current.find(b => b.id === phoneId);
      if (!phone) {
        // If phone doesn't exist anymore, clear the flag
        phonesToClear.add(phoneId);
        return;
      }
      
      // Skip if phone is in a confirmed group
      if (phonesInConfirmedGroups.has(phoneId)) {
        return;
      }
      
      // Check if this recently removed phone is NO LONGER in proximity with any non-recently-removed phone
      // We need to calculate this manually since calculateProximityData filters out recently removed phones
      const centerX = phone.x + phone.width / 2;
      const centerY = phone.y + phone.height / 2;
      
      let hasNearbyNonRemovedPhone = false;
      
      for (const otherBody of bodiesRef.current) {
        if (otherBody.id === phoneId) continue;
        
        // Skip phones that are in confirmed groups
        if (phonesInConfirmedGroups.has(otherBody.id)) continue;
        
        // Skip other recently removed phones - we want to detect proximity with non-removed phones
        if (recentlyRemovedPhonesRef.current.has(otherBody.id)) continue;
        
        const otherCenterX = otherBody.x + otherBody.width / 2;
        const otherCenterY = otherBody.y + otherBody.height / 2;
        
        const dx = otherCenterX - centerX;
        const dy = otherCenterY - centerY;
        const distancePx = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate edge-to-edge distance
        const edgeDistancePx = Math.max(0, distancePx - (phone.width / 2) - (otherBody.width / 2));
        const rawDistanceCm = edgeDistancePx * 0.0125;
        const distanceCm = Math.max(2, rawDistanceCm);
        
        // If this recently removed phone is still in proximity with a non-removed phone, keep the flag
        if (distanceCm <= PROXIMITY_THRESHOLD_CM) {
          hasNearbyNonRemovedPhone = true;
          break;
        }
      }
      
      // Clear the flag when they move AWAY from proximity (no longer near any non-removed phones)
      // This allows notifications to reappear when they come back into proximity
      if (!hasNearbyNonRemovedPhone) {
        phonesToClear.add(phoneId);
      }
    });
    
    if (phonesToClear.size > 0) {
      setRecentlyRemovedPhones(prev => {
        const next = new Set(prev);
        phonesToClear.forEach(phoneId => next.delete(phoneId));
        recentlyRemovedPhonesRef.current = next; // Update ref immediately
        console.log('🧹 Cleared from recentlyRemovedPhones (moved away):', Array.from(phonesToClear));
        return next;
      });
    }
  };

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
      
      // Update potential groups based on current proximity (throttled to every 10 frames)
      frameCountRef.current++;
      if (frameCountRef.current % 10 === 0) {
        updatePotentialGroups();
        // Also check if recently removed phones have come back into proximity
        clearRecentlyRemovedFlagsOnProximity();
      }
      
      forceUpdate(prev => prev + 1);
    };
    
    const interval = setInterval(physicsLoop, 1000 / 60); // 60 FPS
    
    return () => clearInterval(interval);
  }, [zoom]);
  
  // Also clear "recently removed" flags when all potential groups are deleted AND all users have moved away
  // This ensures that when all users exit GroupDrop (move away from each other),
  // all flags are cleared so notifications can reappear when they return
  // IMPORTANT: Don't clear immediately when groups are deleted due to removal - only clear when users actually move away
  useEffect(() => {
    // If there are no potential groups and there are recently removed phones,
    // check if any phones are actually in proximity
    // Only clear flags if NO phones are in proximity (all users have moved away)
    if (potentialGroups.size === 0 && recentlyRemovedPhones.size > 0) {
      // Check if ANY phones (not just recently removed ones) are in proximity with each other
      // If no phones are in proximity, clear all flags
      let anyInProximity = false;
      
      // Check all phones, not just recently removed ones
      for (const body of bodiesRef.current) {
        const proximityData = calculateProximityData(body);
        const hasNearby = proximityData.some(data => data.distanceCm <= 8.5);
        if (hasNearby) {
          anyInProximity = true;
          break;
        }
      }
      
      // Only clear flags if NO phones are in proximity (all users have moved away from each other)
      // Don't clear if phones are still in proximity (they were just removed from groups)
      if (!anyInProximity) {
        setRecentlyRemovedPhones(new Set());
        recentlyRemovedPhonesRef.current = new Set();
        console.log('🧹 Cleared all recentlyRemovedPhones (all users moved away)');
      }
    }
  }, [potentialGroups, recentlyRemovedPhones, forceUpdate]);

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
    // Get center of viewport in screen coordinates
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Convert screen center to world/canvas coordinates
    const worldCenterX = (centerX - panX) / zoom;
    const worldCenterY = (centerY - panY) / zoom;
    
    // Spawn at center with small random offset
    const x = worldCenterX - phoneWidth / 2 + (Math.random() - 0.5) * 200;
    const y = worldCenterY - phoneHeight / 2 + (Math.random() - 0.5) * 200;
    
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
    
    // Add to confirmedIds in potential groups that contain this phone
    setPotentialGroups(prev => {
      const next = new Map(prev);
      next.forEach((group, groupId) => {
        if (group.memberIds.has(phoneId)) {
          next.set(groupId, {
            ...group,
            confirmedIds: new Set([...group.confirmedIds, phoneId]),
          });
        }
      });
      return next;
    });
  };

  // Handle phone un-confirmation (back button or swipe home)
  const handleUnconfirm = (phoneId: number) => {
    // Prevent unconfirming if phone is in any confirmed group
    const phonesInConfirmedGroups = getPhonesInConfirmedGroups();
    if (phonesInConfirmedGroups.has(phoneId)) {
      return; // Cannot unconfirm from confirmed groups
    }
    
    setConfirmedPhones(prev => {
      const next = new Set(prev);
      next.delete(phoneId);
      return next;
    });
    
    // Remove from confirmedIds in potential groups
    setPotentialGroups(prev => {
      const next = new Map(prev);
      next.forEach((group, groupId) => {
        if (group.confirmedIds.has(phoneId)) {
          const newConfirmedIds = new Set(group.confirmedIds);
          newConfirmedIds.delete(phoneId);
          next.set(groupId, {
            ...group,
            confirmedIds: newConfirmedIds,
          });
        }
      });
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

  // Handle removing a user from a potential group
  // Works for groups of any size (2, 3, 4, etc.)
  // Any user can remove any other user from the group
  const handleRemoveUser = (removerPhoneId: number, targetPhoneId: number) => {
    // Don't allow removing yourself
    if (removerPhoneId === targetPhoneId) return;
    
    console.log('🗑️ REMOVING USER:', { removerPhoneId, targetPhoneId });
    
    // First, mark the removed user to suppress notifications temporarily
    // This flag will be cleared when they move away from proximity
    // IMPORTANT: Set this BEFORE resetting view state to prevent notification from showing
    // IMPORTANT: Update the ref immediately so updatePotentialGroups can see it
    setRecentlyRemovedPhones(prev => {
      const next = new Set(prev);
      next.add(targetPhoneId);
      recentlyRemovedPhonesRef.current = next; // Update ref immediately
      console.log('✅ Added to recentlyRemovedPhones:', Array.from(next));
      return next;
    });
    
    // Then unconfirm the target user and close their group search
    // This will reset their device to home screen
    // By setting isRecentlyRemoved first, notifications will be suppressed when view state resets
    handleUnconfirm(targetPhoneId);
    handleGroupSearchStateChange(targetPhoneId, false);
    
    // Then remove from potential groups - do this synchronously
    // This works for groups of any size:
    // - If group has 3+ members, it will continue to exist with remaining members
    // - If group has only 2 members, it will be deleted (both users lose the group)
    // IMPORTANT: Remove the target user from ALL groups, not just groups containing the remover
    // This prevents the removed user from appearing in any groups
    let groupWasDeleted = false;
    let originalGroupSize = 0;
    setPotentialGroups(prev => {
      const next = new Map(prev);
      next.forEach((group, groupId) => {
        // Check if target is in this group (regardless of whether remover is also in it)
        if (group.memberIds.has(targetPhoneId)) {
          // Store original group size if both remover and target are in the group
          if (group.memberIds.has(removerPhoneId) && group.memberIds.has(targetPhoneId)) {
            originalGroupSize = group.memberIds.size;
          }
          
          // Remove target from memberIds
          const newMemberIds = new Set(group.memberIds);
          newMemberIds.delete(targetPhoneId);
          
          // Also remove from confirmedIds if present
          const newConfirmedIds = new Set(group.confirmedIds);
          newConfirmedIds.delete(targetPhoneId);
          
          // If group would have less than 2 members, delete it
          // When a group is deleted, both the remover and any remaining users should return to home screen
          // Otherwise, keep the group with remaining members (works for 3+ member groups)
          if (newMemberIds.size < 2) {
            next.delete(groupId);
            // Only mark as deleted if this was the group containing both remover and target
            if (group.memberIds.has(removerPhoneId)) {
              groupWasDeleted = true;
            }
          } else {
            // Group continues to exist with remaining members
            // All other users in the group remain in their current state
            next.set(groupId, {
              ...group,
              memberIds: newMemberIds,
              confirmedIds: newConfirmedIds,
            });
          }
        }
      });
      // Update the ref immediately
      potentialGroupsRef.current = next;
      return next;
    });
    
    // If group was deleted OR if the original group had exactly 2 members,
    // both the remover and removed user should return to home screen
    // The removed user is already unconfirmed and their group search is closed above
    // Now we need to ensure the remover also returns to home screen
    if (groupWasDeleted || originalGroupSize === 2) {
      // Unconfirm the remover and close their group search
      // This will return them to home screen
      handleUnconfirm(removerPhoneId);
      handleGroupSearchStateChange(removerPhoneId, false);
      
      // Only the removed user (targetPhoneId) should be marked as recently removed
      // The remover should return to home screen but can still see notifications when coming back into proximity
      // The targetPhoneId is already marked as recently removed above, so no need to add it again
    } else {
      // Group still exists (3+ members), keep remover in groupSearch if they're still in proximity
      const removerBody = bodiesRef.current.find(b => b.id === removerPhoneId);
      if (removerBody) {
        const removerProximityData = calculateProximityData(removerBody);
        const removerHasNearby = removerProximityData.some(data => data.distanceCm <= 8.5);
        if (removerHasNearby) {
          // Keep the remover in groupSearch state
          handleGroupSearchStateChange(removerPhoneId, true);
        }
      }
    }
  };

  // Update potential groups based on current proximity
  // This runs in the physics loop to get real-time updates
  const updatePotentialGroups = () => {
    // Include all phones in proximity detection (phones in confirmed groups can join new groups)
    // But exclude recently removed phones
    const activeBodies = bodiesRef.current.filter(body => 
      !recentlyRemovedPhonesRef.current.has(body.id)
    );
    
    if (activeBodies.length < 2) {
      // Clean up all potential groups if there are less than 2 phones
      setPotentialGroups(prev => {
        const next = new Map(prev);
        next.clear();
        return next;
      });
      return;
    }

    const PROXIMITY_THRESHOLD_CM = 8.5;
    
    // Calculate distances between all active phones
    // Exclude recently removed phones from proximity calculations
    const proximityMap = new Map<number, number[]>(); // phoneId -> array of nearby phoneIds
    
    for (let i = 0; i < activeBodies.length; i++) {
      const body1 = activeBodies[i];
      // Skip if this body is recently removed
      if (recentlyRemovedPhonesRef.current.has(body1.id)) continue;
      
      const nearby: number[] = [];
      
      for (let j = 0; j < activeBodies.length; j++) {
        if (i === j) continue;
        const body2 = activeBodies[j];
        // Skip if the other body is recently removed
        if (recentlyRemovedPhonesRef.current.has(body2.id)) continue;
        
        const centerX1 = body1.x + body1.width / 2;
        const centerY1 = body1.y + body1.height / 2;
        const centerX2 = body2.x + body2.width / 2;
        const centerY2 = body2.y + body2.height / 2;
        
        const dx = centerX2 - centerX1;
        const dy = centerY2 - centerY1;
        const distancePx = Math.sqrt(dx * dx + dy * dy);
        // Calculate edge-to-edge distance by subtracting both phone widths
        // This ensures symmetric distance calculation
        const edgeDistancePx = Math.max(0, distancePx - (body1.width / 2) - (body2.width / 2));
        const rawDistanceCm = edgeDistancePx * 0.0125;
        const distanceCm = Math.max(2, rawDistanceCm);
        
        if (distanceCm <= PROXIMITY_THRESHOLD_CM) {
          nearby.push(body2.id);
        }
      }
      
      if (nearby.length > 0) {
        proximityMap.set(body1.id, nearby);
      }
    }
    
    // Find connected components (groups of phones that are all within proximity)
    const visited = new Set<number>();
    const newPotentialGroups = new Map<string, PotentialGroup>();
    
    const findConnectedComponent = (startId: number): Set<number> => {
      const component = new Set<number>();
      const queue = [startId];
      const localVisited = new Set<number>();
      localVisited.add(startId);
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        component.add(currentId);
        
        const nearby = proximityMap.get(currentId) || [];
        for (const nearbyId of nearby) {
          // Add to component if not already visited in this BFS
          if (!localVisited.has(nearbyId)) {
            localVisited.add(nearbyId);
            visited.add(nearbyId); // Mark as visited globally too
            component.add(nearbyId);
            queue.push(nearbyId);
          }
        }
      }
      
      return component;
    };
    
    // Helper function to check if all members of a group are still within proximity
    const areMembersInProximity = (memberIds: Set<number>): boolean => {
      const memberArray = Array.from(memberIds);
      if (memberArray.length < 2) return false;
      
      // Check if all members are still in the proximity map
      for (const memberId of memberArray) {
        if (!proximityMap.has(memberId)) {
          return false;
        }
      }
      
      // Check if all members form a connected component
      const memberSet = new Set(memberArray);
      const visitedForCheck = new Set<number>();
      const queue = [memberArray[0]];
      visitedForCheck.add(memberArray[0]);
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const nearby = proximityMap.get(currentId) || [];
        
        for (const nearbyId of nearby) {
          if (memberSet.has(nearbyId) && !visitedForCheck.has(nearbyId)) {
            visitedForCheck.add(nearbyId);
            queue.push(nearbyId);
          }
        }
      }
      
      // All members must be reachable from each other
      return visitedForCheck.size === memberArray.length;
    };
    
    // Helper function to check if exact members already exist in a confirmed group
    const areMembersInConfirmedGroup = (memberIds: Set<number>): boolean => {
      const memberArray = Array.from(memberIds).sort((a, b) => a - b);
      const memberKey = memberArray.join(',');
      
      for (const confirmedGroup of confirmedGroupsRef.current.values()) {
        const confirmedMembers = Array.from(confirmedGroup.memberIds).sort((a, b) => a - b);
        const confirmedKey = confirmedMembers.join(',');
        if (confirmedKey === memberKey) {
          return true;
        }
      }
      return false;
    };
    
    // Find all connected components and create/update groups
    const newGroups = new Map<string, PotentialGroup>();
    for (const body of activeBodies) {
      if (!visited.has(body.id) && proximityMap.has(body.id)) {
        const component = findConnectedComponent(body.id);
        // Filter out recently removed phones from the component
        const filteredComponent = new Set(
          Array.from(component).filter(id => !recentlyRemovedPhonesRef.current.has(id))
        );
        
        if (filteredComponent.size >= 2) {
          // Skip creating potential group if these exact members are already in a confirmed group
          if (areMembersInConfirmedGroup(filteredComponent)) {
            continue;
          }
          
          // Create or update potential group
          const memberIds = Array.from(filteredComponent).sort((a, b) => a - b);
          const groupKey = memberIds.join(',');
          
          // Try to find existing group with same members
          let existingGroupId: string | null = null;
          potentialGroupsRef.current.forEach((group, groupId) => {
            const existingMembers = Array.from(group.memberIds).sort((a, b) => a - b);
            if (existingMembers.join(',') === groupKey) {
              existingGroupId = groupId;
            }
          });
          
          const groupId = existingGroupId || `potential-${nextGroupIdRef.current++}`;
          const existingGroup = potentialGroupsRef.current.get(groupId);
          
<<<<<<< HEAD
          // Only preserve confirmedIds if exact same members are still in proximity AND member set hasn't changed
          // Also filter out recently removed phones from confirmedIds
          const memberSetUnchanged = existingGroup && 
            existingGroup.memberIds.size === filteredComponent.size &&
            Array.from(existingGroup.memberIds).every(id => filteredComponent.has(id));
          
          const cleanConfirmedIds = existingGroup && memberSetUnchanged && areMembersInProximity(existingGroup.memberIds)
            ? new Set(
                Array.from(existingGroup.confirmedIds).filter(id => !recentlyRemovedPhonesRef.current.has(id))
              )
            : new Set();
          
          newGroups.set(groupId, {
            id: groupId,
            memberIds: new Set(filteredComponent),
            confirmedIds: cleanConfirmedIds,
          });
        }
      }
    }
    
    // Clean up: verify all existing potential groups still have members in proximity
    // Also remove recently removed phones from existing groups
    setPotentialGroups(prev => {
      const next = new Map(prev);
      
      // First, update/add groups from current proximity detection
      newGroups.forEach((group, groupId) => {
        next.set(groupId, group);
      });
      
      // Then, verify all groups still meet proximity requirements
      // Only check groups that weren't just created/updated (newly created ones are already verified)
      next.forEach((group, groupId) => {
        // Remove recently removed phones from the group
        const membersWithoutRemoved = Array.from(group.memberIds).filter(id => 
          !recentlyRemovedPhonesRef.current.has(id)
        );
        
        if (!newGroups.has(groupId)) {
          // Check if all members are still in proximity
          if (!areMembersInProximity(new Set(membersWithoutRemoved))) {
            next.delete(groupId);
            return;
          }
        }
        
        // Update the group to remove recently removed phones
        if (membersWithoutRemoved.length < 2) {
          next.delete(groupId);
        } else if (membersWithoutRemoved.length !== group.memberIds.size) {
          // Only update if we actually removed some members
          const newMemberIds = new Set(membersWithoutRemoved);
          const newConfirmedIds = new Set(
            Array.from(group.confirmedIds).filter(id => !recentlyRemovedPhonesRef.current.has(id))
          );
          next.set(groupId, {
            ...group,
            memberIds: newMemberIds,
            confirmedIds: newConfirmedIds,
          });
        }
        
        // Also remove any potential groups that match existing confirmed groups
        // (this handles cases where a potential group was created before confirmation)
        if (areMembersInConfirmedGroup(group.memberIds)) {
          next.delete(groupId);
        }
      });
      
      return next;
    });
  };

  // Check if all members of a potential group have confirmed, then move to confirmed groups
  useEffect(() => {
    potentialGroups.forEach((group, groupId) => {
      const allConfirmed = Array.from(group.memberIds).every(id => group.confirmedIds.has(id));
      
      if (allConfirmed && group.memberIds.size >= 2) {
        // Generate a new sequential ID for confirmed groups (e.g., "1", "2", "3")
        const confirmedGroupId = String(nextConfirmedGroupIdRef.current++);
        
        // Move to confirmed groups with new sequential ID
        setConfirmedGroups(prev => {
          const next = new Map(prev);
          next.set(confirmedGroupId, {
            id: confirmedGroupId,
            memberIds: new Set(group.memberIds),
          });
          return next;
        });
        
        // Remove from potential groups
        setPotentialGroups(prev => {
          const next = new Map(prev);
          next.delete(groupId);
          return next;
        });
      }
    });
  }, [potentialGroups]);

    // Calculate proximity data for a specific phone
  const calculateProximityData = (body: RigidBody): ProximityData[] => {
    const proximityList: ProximityData[] = [];
    
    // Calculate proximity for all phones (phones in confirmed groups can still detect proximity)
    const centerX = body.x + body.width / 2;
    const centerY = body.y + body.height / 2;
    
    for (const otherBody of bodiesRef.current) {
      if (otherBody.id === body.id) continue;
      
      // Skip phones that were recently removed
      if (recentlyRemovedPhonesRef.current.has(otherBody.id)) continue;
      
      const otherCenterX = otherBody.x + otherBody.width / 2;
      const otherCenterY = otherBody.y + otherBody.height / 2;
      
      const dx = otherCenterX - centerX;
      const dy = otherCenterY - centerY;
      const distancePx = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate edge-to-edge distance instead of center-to-center
      // Subtract the approximate radius of each phone (half width from each)
      // This ensures symmetric distance calculation matching updatePotentialGroups
      const edgeDistancePx = Math.max(0, distancePx - (body.width / 2) - (otherBody.width / 2));
      
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
      {/* Debug Menu - Top Left - Fixed outside zoom transform */}
      {showDebugMenu && (
        <div className="absolute top-4 left-4 z-50 pointer-events-none">
          <div 
            className="bg-white shadow-lg max-w-md max-h-[80vh] overflow-auto pointer-events-auto" 
            style={{ 
              maxWidth: '400px',
              borderRadius: '16px',
              padding: '12px',
              backgroundColor: '#ffffff'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#000000' }}>Groups</h3>
              <button
                onClick={() => setShowDebugMenu(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close debug menu"
                tabIndex={0}
                style={{ 
                  fontSize: '18px',
                  lineHeight: 1,
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Potential Groups */}
              <div>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: 700, 
                  color: '#000000',
                  marginBottom: '8px'
                }}>
                  Potential Groups
                </h4>
                {potentialGroups.size === 0 ? (
                  <p className="text-sm text-gray-400">No potential groups</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Array.from(potentialGroups.entries()).map(([groupId, group]) => (
                      <div 
                        key={groupId} 
                        style={{
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                      >
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: 700, 
                          color: '#000000',
                          marginBottom: '8px'
                        }}>
                          Group{groupId}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '12px 12px',
                          rowGap: '4px'
                        }}>
                          {Array.from(group.memberIds).map((phoneId) => (
                            <span 
                              key={phoneId} 
                              style={{ 
                                fontSize: '13px',
                                fontWeight: 400,
                                color: '#737373'
                              }}
                            >
                              Phone{phoneId} ✓
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Confirmed Groups */}
              <div>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: 700, 
                  color: '#000000',
                  marginBottom: '8px'
                }}>
                  Confirmed Groups
                </h4>
                {confirmedGroups.size === 0 ? (
                  <p className="text-sm text-gray-400">No confirmed groups</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Array.from(confirmedGroups.entries()).map(([groupId, group]) => (
                      <div 
                        key={groupId} 
                        style={{
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                      >
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: 700, 
                          color: '#000000',
                          marginBottom: '8px'
                        }}>
                          Group {groupId}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '12px 12px',
                          rowGap: '4px'
                        }}>
                          {Array.from(group.memberIds).map((phoneId) => (
                            <span 
                              key={phoneId} 
                              style={{ 
                                fontSize: '13px',
                                fontWeight: 400,
                                color: '#737373'
                              }}
                            >
                              Phone{phoneId} ✓
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Individual Confirmed Phones */}
              <div>
                <h4 className="font-semibold text-base text-gray-900 mb-3">
                  Confirmed Phones
                  <span className="ml-2 font-normal text-sm text-gray-500">({confirmedPhones.size})</span>
                </h4>
                {confirmedPhones.size === 0 ? (
                  <p className="text-sm text-gray-400">No confirmed phones</p>
                ) : (
                  <div className="text-sm text-gray-700">
                    {Array.from(confirmedPhones).join(', ')}
                  </div>
                )}
              </div>
              
              {/* Recently Removed Phones */}
              <div>
                <h4 className="font-semibold text-base text-gray-900 mb-3">
                  Recently Removed Phones
                  <span className="ml-2 font-normal text-sm text-gray-500">({recentlyRemovedPhones.size})</span>
                </h4>
                {recentlyRemovedPhones.size === 0 ? (
                  <p className="text-sm text-gray-400">No recently removed phones</p>
                ) : (
                  <div className="bg-red-50 border border-red-300 rounded-md p-3">
                    <div className="text-sm text-gray-700 space-y-1">
                      <div><span className="font-medium">Phone IDs:</span> {Array.from(recentlyRemovedPhones).join(', ')}</div>
                      {Array.from(recentlyRemovedPhones).map(phoneId => {
                        const phone = bodiesRef.current.find(b => b.id === phoneId);
                        if (phone) {
                          const proximityData = calculateProximityData(phone);
                          const hasNearby = proximityData.some(data => data.distanceCm <= 6.5);
                          const nearestDistance = proximityData.length > 0 
                            ? Math.min(...proximityData.map(d => d.distanceCm)).toFixed(2)
                            : 'N/A';
                          return (
                            <div key={phoneId} className="mt-2 pt-2 border-t border-red-200 text-xs">
                              <div><span className="font-medium">Phone {phoneId}:</span></div>
                              <div className="ml-2">Has nearby (≤6.5cm): {hasNearby ? 'Yes' : 'No'}</div>
                              <div className="ml-2">Nearest distance: {nearestDistance}cm</div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug Menu Toggle Button - Fixed outside zoom transform */}
      {!showDebugMenu && (
        <div className="absolute top-4 left-4 z-50 pointer-events-none">
          <button
            onClick={() => setShowDebugMenu(true)}
            className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 pointer-events-auto"
          >
            Debug
          </button>
        </div>
      )}

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
                confirmedGroups={confirmedGroups}
                potentialGroups={potentialGroups}
                onRemoveUser={handleRemoveUser}
                isRecentlyRemoved={recentlyRemovedPhones.has(body.id)}
                recentlyRemovedPhones={recentlyRemovedPhones}
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