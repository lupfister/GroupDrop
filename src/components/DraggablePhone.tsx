import { useRef, useEffect, useCallback } from "react";
import React from "react";
import { RigidBody } from "../utils/physics";

export interface ProximityData {
  phoneId: number;
  distanceCm: number;
  direction: string;
  degrees: number;
  relativeX: number; // Relative X position in pixels
  relativeY: number; // Relative Y position in pixels
}

interface DraggablePhoneProps {
  children: React.ReactElement;
  body: RigidBody;
  zoom: number;
  onUpdate?: () => void;
  proximityData?: ProximityData[];
  tool: 'move' | 'interact';
}

export function DraggablePhone({
  children,
  body,
  zoom,
  onUpdate,
  proximityData = [],
  tool,
}: DraggablePhoneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  
  // Store initial positions for smooth delta-based dragging
  const initialPointerWorldRef = useRef({ x: 0, y: 0 });
  const initialPhonePosRef = useRef({ x: 0, y: 0 });
  const initialRotationRef = useRef(0);
  
  // Use refs to track live position during drag (avoid re-renders)
  const livePosRef = useRef({ x: 0, y: 0 });
  const liveRotationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  
  // Track last position and time for velocity calculation
  const lastMoveTimeRef = useRef(Date.now());
  const lastMovePosRef = useRef({ x: 0, y: 0 });
  
  // Track movement velocity for follow-through effect
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  
  // Auto-alignment animation
  const alignmentAnimationRef = useRef<number | null>(null);
  
  // Calculate radar position and size for a phone based on proximity data
  const calculateRadarPosition = (data: ProximityData) => {
    // Max detection range in cm (phones beyond this won't appear)
    const maxRangeCm = 30;
    
    if (data.distanceCm > maxRangeCm) return null;
    
    // Radar display area (circular area in the center of screen)
    const radarRadius = 80; // pixels from center
    
    // Convert distance to radius position (0 = center, 1 = edge of radar)
    const normalizedDistance = Math.min(data.distanceCm / maxRangeCm, 1);
    const radiusPosition = normalizedDistance * radarRadius;
    
    // Convert degrees to radians directly (0° = East/right, 90° = South/bottom, 180° = West/left, 270° = North/top)
    const angleRad = (data.degrees * Math.PI) / 180;
    
    // Calculate x, y position relative to radar center
    const x = Math.cos(angleRad) * radiusPosition;
    const y = Math.sin(angleRad) * radiusPosition;
    
    // Calculate circle size (closer = bigger, max 20px, min 4px)
    const maxSize = 20;
    const minSize = 4;
    const size = maxSize - (normalizedDistance * (maxSize - minSize));
    
    return { x, y, size };
  };

  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      // Screen coordinates to world coordinates
      // The canvas is already scaled, so we need to account for:
      // 1. Canvas is centered and offset
      // 2. Canvas is scaled by zoom

      const canvasElement = containerRef.current?.parentElement;
      if (!canvasElement) return { x: screenX, y: screenY };

      const rect = canvasElement.getBoundingClientRect();

      // Convert screen coordinates to canvas-relative coordinates
      const canvasX = screenX - rect.left;
      const canvasY = screenY - rect.top;

      // Scale from visual size to actual size (undo the scale transform)
      const worldX = canvasX / zoom;
      const worldY = canvasY / zoom;

      return { x: worldX, y: worldY };
    },
    [zoom],
  );

  // Handle drag via the handle using pointer events
  const handleHandlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const pointerId = e.pointerId;
    activePointerIdRef.current = pointerId;
    
    // Set pointer capture to track movement even outside the element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.setPointerCapture(pointerId);
    }

    isDraggingRef.current = true;
    body.isDragging = true;

    // Convert screen coordinates to world coordinates
    const world = screenToWorld(e.clientX, e.clientY);

    // Store initial pointer position (in world space)
    initialPointerWorldRef.current = { x: world.x, y: world.y };
    
    // Store initial phone position and rotation
    initialPhonePosRef.current = { x: body.x, y: body.y };
    initialRotationRef.current = body.rotation;
    
    // Initialize live position and velocity tracking
    livePosRef.current = { x: body.x, y: body.y };
    liveRotationRef.current = body.rotation;
    lastMovePosRef.current = { x: body.x, y: body.y };
    lastMoveTimeRef.current = Date.now();
    lastPointerPosRef.current = { x: world.x, y: world.y };
    velocityRef.current = { x: 0, y: 0 };

    // Reset velocities
    body.vx = 0;
    body.vy = 0;
    body.angularVelocity = 0;
  }, [body, screenToWorld]);

  // Update phone position and rotation directly (avoid re-renders during drag)
  const updatePhoneTransform = useCallback((x: number, y: number, rotation: number) => {
    body.x = x;
    body.y = y;
    body.rotation = rotation;
    livePosRef.current = { x, y };
    liveRotationRef.current = rotation;
    
    // Update transform directly via DOM for smooth movement
    if (containerRef.current) {
      containerRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}rad)`;
    }
  }, [body]);
  
  // Smoothly realign phone to face forward (rotation = 0)
  const realignPhone = useCallback(() => {
    if (alignmentAnimationRef.current !== null) {
      cancelAnimationFrame(alignmentAnimationRef.current);
    }
    
    const startRotation = liveRotationRef.current;
    const targetRotation = 0;
    const startTime = Date.now();
    const duration = 400; // 400ms animation
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = startRotation + (targetRotation - startRotation) * eased;
      
      // Normalize rotation to [-PI, PI]
      let normalizedRotation = currentRotation;
      while (normalizedRotation > Math.PI) normalizedRotation -= Math.PI * 2;
      while (normalizedRotation < -Math.PI) normalizedRotation += Math.PI * 2;
      
      // Update rotation while keeping position
      updatePhoneTransform(livePosRef.current.x, livePosRef.current.y, normalizedRotation);
      
      if (progress < 1) {
        alignmentAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // Finalize
        body.rotation = 0;
        liveRotationRef.current = 0;
        alignmentAnimationRef.current = null;
        if (onUpdate) onUpdate();
      }
    };
    
    animate();
  }, [body, updatePhoneTransform, onUpdate]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Global pointer move handler - uses delta-based movement
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;

      e.preventDefault();

      // Convert screen to world coordinates
      const world = screenToWorld(e.clientX, e.clientY);
      
      // Calculate delta from initial pointer position
      const deltaX = world.x - initialPointerWorldRef.current.x;
      const deltaY = world.y - initialPointerWorldRef.current.y;
      
      // Apply delta to initial phone position
      // Phone leads from the top (handle position), so movement is direct
      const newX = initialPhonePosRef.current.x + deltaX;
      const newY = initialPhonePosRef.current.y + deltaY;
      
      // Calculate velocity for follow-through effect
      const now = Date.now();
      const dt = Math.max((now - lastMoveTimeRef.current) / 1000, 0.001);
      const pointerDeltaX = world.x - lastPointerPosRef.current.x;
      const pointerDeltaY = world.y - lastPointerPosRef.current.y;
      
      // Smooth velocity calculation (exponential moving average)
      const alpha = 0.3; // Smoothing factor
      velocityRef.current.x = velocityRef.current.x * (1 - alpha) + (pointerDeltaX / dt) * alpha;
      velocityRef.current.y = velocityRef.current.y * (1 - alpha) + (pointerDeltaY / dt) * alpha;
      
      // Calculate rotation based on movement direction for natural follow-through
      // Top leads, bottom follows - phone tilts in direction of movement
      const movementDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocityMagnitude = Math.sqrt(velocityRef.current.x * velocityRef.current.x + velocityRef.current.y * velocityRef.current.y);
      
      let targetRotation = initialRotationRef.current;
      
      if (movementDistance > 5 && velocityMagnitude > 10) {
        // Calculate movement direction
        const movementAngle = Math.atan2(deltaY, deltaX);
        
        // For natural follow-through: phone tilts perpendicular to movement direction
        // When moving right, phone tilts slightly clockwise (positive rotation)
        // When moving left, phone tilts slightly counter-clockwise (negative rotation)
        // Rotation is based on horizontal component of movement
        const horizontalComponent = Math.cos(movementAngle);
        
        // Scale rotation based on velocity (stronger movement = more tilt)
        // Max rotation ~0.15 radians (~8.6 degrees) for strong movements
        const rotationScale = Math.min(velocityMagnitude / 300, 1);
        const maxRotation = 0.15;
        targetRotation = initialRotationRef.current + horizontalComponent * maxRotation * rotationScale;
        
        // Normalize rotation
        while (targetRotation > Math.PI) targetRotation -= Math.PI * 2;
        while (targetRotation < -Math.PI) targetRotation += Math.PI * 2;
      }
      
      // Update position and rotation
      updatePhoneTransform(newX, newY, targetRotation);
      
      // Update tracking refs
      lastPointerPosRef.current = { x: world.x, y: world.y };
      lastMoveTimeRef.current = now;
      
      // Track position for velocity calculation on release
      lastMovePosRef.current = { x: newX, y: newY };
    };
    
    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;
      
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        body.isDragging = false;
        activePointerIdRef.current = null;
        
        // Release pointer capture
        if (e.target instanceof HTMLElement && e.target.hasPointerCapture(e.pointerId)) {
          e.target.releasePointerCapture(e.pointerId);
        }
        
        // Calculate final velocity from last movement
        const now = Date.now();
        const dt = (now - lastMoveTimeRef.current) / 1000;
        if (dt > 0 && dt < 0.1) {
          body.vx = (livePosRef.current.x - lastMovePosRef.current.x) / dt;
          body.vy = (livePosRef.current.y - lastMovePosRef.current.y) / dt;
        }
        
        // Apply momentum damping
        const scale = 0.3;
        body.vx *= scale;
        body.vy *= scale;
        
        // Sync final position
        body.x = livePosRef.current.x;
        body.y = livePosRef.current.y;
        body.rotation = liveRotationRef.current;
        
        // Start auto-alignment animation to face forward
        realignPhone();
      }
    };
    
    window.addEventListener("pointermove", handleGlobalPointerMove, { passive: false });
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
      
      // Cancel any pending animation frames
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (alignmentAnimationRef.current !== null) {
        cancelAnimationFrame(alignmentAnimationRef.current);
        alignmentAnimationRef.current = null;
      }
    };
  }, [body, zoom, onUpdate, screenToWorld, updatePhoneTransform, realignPhone]);

  // Sync live position with body position when not dragging and not aligning
  useEffect(() => {
    if (!body.isDragging && alignmentAnimationRef.current === null && containerRef.current) {
      containerRef.current.style.transform = `translate(${body.x}px, ${body.y}px) rotate(${body.rotation}rad)`;
      livePosRef.current = { x: body.x, y: body.y };
      liveRotationRef.current = body.rotation;
    }
  }, [body.x, body.y, body.rotation, body.isDragging]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: `${body.width}px`,
        height: `${body.height}px`,
        transform: `translate(${body.x}px, ${body.y}px) rotate(${body.rotation}rad)`,
        transformOrigin: 'center center',
        cursor: 'default',
        willChange: "transform",
        transition: body.isDragging || alignmentAnimationRef.current !== null ? 'none' : 'transform 0.12s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: 'none',
      }}
    >
      {/* Drag handle positioned above phone, outside bezel */}
      <div
        onPointerDown={handleHandlePointerDown}
        className="absolute left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
        data-name="DragHandle"
        style={{
          width: '56px',
          height: '56px',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          zIndex: 10000,
          top: '-98px', // Position above the bezel with ~24px gap (bezel extends to -17.76px, handle is 56px tall, so handle bottom at -42px, gap = 24px)
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Up arrow */}
          <path
            d="M14 4L9 9H11V13H17V9H19L14 4Z"
            fill="rgba(70, 70, 70, 0.85)"
          />
          {/* Down arrow */}
          <path
            d="M14 24L19 19H17V15H11V19H9L14 24Z"
            fill="rgba(70, 70, 70, 0.85)"
          />
          {/* Left arrow */}
          <path
            d="M4 14L9 9V11H13V17H9V19L4 14Z"
            fill="rgba(70, 70, 70, 0.85)"
          />
          {/* Right arrow */}
          <path
            d="M24 14L19 19V17H15V11H19V9L24 14Z"
            fill="rgba(70, 70, 70, 0.85)"
          />
        </svg>
      </div>
      {children}
    </div>
  );
}