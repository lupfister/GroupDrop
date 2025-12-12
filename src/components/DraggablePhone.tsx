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
  isIndirect?: boolean; // True if detected through daisy chaining (via another phone)
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
  const isRotatingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const rotationCornerRef = useRef<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null);
  
  // Store initial positions for smooth delta-based dragging
  const initialPointerWorldRef = useRef({ x: 0, y: 0 });
  const initialPhonePosRef = useRef({ x: 0, y: 0 });
  const initialRotationRef = useRef(0);
  const initialRotationCenterRef = useRef({ x: 0, y: 0 });
  const initialAngleRelativeRef = useRef(0); // Initial angle relative to phone rotation
  
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

  // Handle drag via the dot handle using pointer events (movement only, no rotation)
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
    isRotatingRef.current = false;
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

  // Handle rotation via corner arrows - rotates around phone center
  const handleCornerRotationDown = useCallback((e: React.PointerEvent, corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    e.preventDefault();
    e.stopPropagation();

    const pointerId = e.pointerId;
    activePointerIdRef.current = pointerId;
    rotationCornerRef.current = corner;
    
    // Set pointer capture
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.setPointerCapture(pointerId);
    }

    isRotatingRef.current = true;
    isDraggingRef.current = false;
    body.isDragging = true;

    // Convert screen coordinates to world coordinates
    const world = screenToWorld(e.clientX, e.clientY);

    // Rotation center is the phone's center (not the corner)
    const phoneCenterX = body.x;
    const phoneCenterY = body.y;
    initialRotationCenterRef.current = { x: phoneCenterX, y: phoneCenterY };

    // Calculate initial angle from phone center to pointer position
    const initialAngle = Math.atan2(
      world.y - phoneCenterY,
      world.x - phoneCenterX
    );

    // Store initial angle (absolute, not relative)
    initialRotationRef.current = body.rotation;
    initialAngleRelativeRef.current = initialAngle; // Store absolute initial angle
    
    // Store initial pointer position and phone state
    initialPointerWorldRef.current = { x: world.x, y: world.y };
    initialPhonePosRef.current = { x: body.x, y: body.y };
    
    livePosRef.current = { x: body.x, y: body.y };
    liveRotationRef.current = body.rotation;

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

    // Global pointer move handler - handles both movement and rotation
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current && !isRotatingRef.current) return;
      if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;

      e.preventDefault();

      // Convert screen to world coordinates
      const world = screenToWorld(e.clientX, e.clientY);
      
      if (isRotatingRef.current && rotationCornerRef.current) {
        // Rotation mode: rotate around phone center
        const center = initialRotationCenterRef.current;
        
        // Calculate current angle from phone center to pointer position
        const currentAngle = Math.atan2(
          world.y - center.y,
          world.x - center.x
        );
        
        // Calculate rotation delta: how much the pointer has moved around the center
        // This is simply the difference in absolute angles
        let angleDelta = currentAngle - initialAngleRelativeRef.current;
        
        // Normalize angle delta to [-PI, PI] for shortest rotation path
        while (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
        while (angleDelta < -Math.PI) angleDelta += Math.PI * 2;
        
        // Direct tracking: corner leads the rotation by following pointer exactly
        // No dampening for immediate, responsive feel - corner pulls the phone
        // The corner moves first, phone follows naturally
        const followFactor = 1.0; // Direct 1:1 tracking - corner leads immediately
        angleDelta *= followFactor;
        
        // Calculate new rotation
        const newRotation = initialRotationRef.current + angleDelta;
        
        // Normalize rotation to [-PI, PI]
        let normalizedRotation = newRotation;
        while (normalizedRotation > Math.PI) normalizedRotation -= Math.PI * 2;
        while (normalizedRotation < -Math.PI) normalizedRotation += Math.PI * 2;
        
        // Phone position stays the same (rotating around center)
        const newX = initialPhonePosRef.current.x;
        const newY = initialPhonePosRef.current.y;
        
        updatePhoneTransform(newX, newY, normalizedRotation);
      } else if (isDraggingRef.current) {
        // Movement mode: move phone without rotation
        const deltaX = world.x - initialPointerWorldRef.current.x;
        const deltaY = world.y - initialPointerWorldRef.current.y;
        
        // Apply delta to initial phone position
        const newX = initialPhonePosRef.current.x + deltaX;
        const newY = initialPhonePosRef.current.y + deltaY;
        
        // Calculate velocity for follow-through effect
        const now = Date.now();
        const dt = Math.max((now - lastMoveTimeRef.current) / 1000, 0.001);
        const pointerDeltaX = world.x - lastPointerPosRef.current.x;
        const pointerDeltaY = world.y - lastPointerPosRef.current.y;
        
        // Smooth velocity calculation (exponential moving average)
        const alpha = 0.3;
        velocityRef.current.x = velocityRef.current.x * (1 - alpha) + (pointerDeltaX / dt) * alpha;
        velocityRef.current.y = velocityRef.current.y * (1 - alpha) + (pointerDeltaY / dt) * alpha;
        
        // Keep rotation unchanged when dragging dot handle
        const targetRotation = initialRotationRef.current;
        
        // Update position and rotation
        updatePhoneTransform(newX, newY, targetRotation);
        
        // Update tracking refs
        lastPointerPosRef.current = { x: world.x, y: world.y };
        lastMoveTimeRef.current = now;
        lastMovePosRef.current = { x: newX, y: newY };
      }
    };
    
    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;
      
      const wasDragging = isDraggingRef.current;
      const wasRotating = isRotatingRef.current;
      
      if (wasDragging || wasRotating) {
        isDraggingRef.current = false;
        isRotatingRef.current = false;
        body.isDragging = false;
        rotationCornerRef.current = null;
        activePointerIdRef.current = null;
        
        // Release pointer capture
        if (e.target instanceof HTMLElement && e.target.hasPointerCapture(e.pointerId)) {
          e.target.releasePointerCapture(e.pointerId);
        }
        
        if (wasDragging) {
          // Calculate final velocity from last movement (only for movement, not rotation)
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
        } else {
          // Reset velocities for rotation
          body.vx = 0;
          body.vy = 0;
        }
        
        // Sync final position
        body.x = livePosRef.current.x;
        body.y = livePosRef.current.y;
        body.rotation = liveRotationRef.current;
        
        // Start auto-alignment animation to face forward (only after movement, not rotation)
        if (wasDragging) {
          realignPhone();
        }
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
      {/* Six-dot drag handle positioned above phone, outside bezel */}
      <div
        onPointerDown={handleHandlePointerDown}
        className="absolute left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
        data-name="DragHandle"
        style={{
          width: '48px',
          height: '32px',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          zIndex: 10000,
          top: '-72px', // Position above the bezel with noticeable gap
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        {/* Top row of three dots */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5a5a5a' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5a5a5a' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5a5a5a' }} />
        </div>
        {/* Bottom row of three dots */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5a5a5a' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5a5a5a' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5a5a5a' }} />
        </div>
      </div>

      {/* Corner rotation arrows */}
      {/* Top-left corner - counter-clockwise */}
      <div
        onPointerDown={(e) => handleCornerRotationDown(e, 'top-left')}
        className="absolute cursor-grab active:cursor-grabbing"
        data-name="RotationHandle-TopLeft"
        style={{
          left: '-28px',
          top: '-28px',
          width: '28px',
          height: '28px',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Curved arrow arc */}
          <path
            d="M4 4 Q9 1 14 4"
            stroke="#555555"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Arrowhead */}
          <path
            d="M6 2 L4 4 L7 4"
            stroke="#555555"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Top-right corner - clockwise */}
      <div
        onPointerDown={(e) => handleCornerRotationDown(e, 'top-right')}
        className="absolute cursor-grab active:cursor-grabbing"
        data-name="RotationHandle-TopRight"
        style={{
          right: '-28px',
          top: '-28px',
          width: '28px',
          height: '28px',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Curved arrow arc */}
          <path
            d="M14 4 Q9 1 4 4"
            stroke="#555555"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Arrowhead */}
          <path
            d="M12 2 L14 4 L11 4"
            stroke="#555555"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Bottom-left corner - clockwise */}
      <div
        onPointerDown={(e) => handleCornerRotationDown(e, 'bottom-left')}
        className="absolute cursor-grab active:cursor-grabbing"
        data-name="RotationHandle-BottomLeft"
        style={{
          left: '-28px',
          bottom: '-28px',
          width: '28px',
          height: '28px',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Curved arrow arc */}
          <path
            d="M4 14 Q9 17 14 14"
            stroke="#555555"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Arrowhead */}
          <path
            d="M6 16 L4 14 L7 14"
            stroke="#555555"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Bottom-right corner - counter-clockwise */}
      <div
        onPointerDown={(e) => handleCornerRotationDown(e, 'bottom-right')}
        className="absolute cursor-grab active:cursor-grabbing"
        data-name="RotationHandle-BottomRight"
        style={{
          right: '-28px',
          bottom: '-28px',
          width: '28px',
          height: '28px',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Curved arrow arc */}
          <path
            d="M14 14 Q9 17 4 14"
            stroke="#555555"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Arrowhead */}
          <path
            d="M12 16 L14 14 L11 14"
            stroke="#555555"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {children}
    </div>
  );
}