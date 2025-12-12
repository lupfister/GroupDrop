import { useRef, useEffect, useCallback } from "react";
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
  children: React.ReactNode;
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
  const grabOffsetRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0, time: Date.now() });
  const lastRotationRef = useRef(0);
  const isCornerGrabRef = useRef(false);
  const initialGrabAngleRef = useRef(0); // Store the initial angle when grabbing
  const isPanningRef = useRef(false); // Track if we're in pan mode (2-finger or middle-click)
  const isWheelPanningRef = useRef(false); // Track if we're actively wheel panning this phone
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      // In move mode, use left-click (button 0)
      // In interact mode, use middle-click (button 1) for panning
      const isMoveButton = tool === 'move' ? e.button === 0 : e.button === 1;
      
      if (!isMoveButton) return;

      e.preventDefault();
      e.stopPropagation();

      isPanningRef.current = true;
      isDraggingRef.current = true;
      body.isDragging = true;

      // Convert screen coordinates to world coordinates
      const world = screenToWorld(e.clientX, e.clientY);

      // Calculate offset from center
      const centerX = body.x + body.width / 2;
      const centerY = body.y + body.height / 2;

      grabOffsetRef.current = {
        x: world.x - centerX,
        y: world.y - centerY,
      };

      // Reset velocities
      body.vx = 0;
      body.vy = 0;
      body.angularVelocity = 0;

      lastPosRef.current = {
        x: body.x,
        y: body.y,
        time: Date.now(),
      };
      lastRotationRef.current = body.rotation;
      
      // Check if this is a corner grab (far from center in both dimensions)
      const offset = grabOffsetRef.current;
      const offsetDistance = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
      // Consider it a corner grab if distance is more than 70% of the diagonal
      const maxDistance = Math.sqrt((body.width / 2) ** 2 + (body.height / 2) ** 2);
      isCornerGrabRef.current = offsetDistance > maxDistance * 0.7;
      
      // Store the initial angle when grabbing
      if (isCornerGrabRef.current) {
        const dx = world.x - centerX;
        const dy = world.y - centerY;
        initialGrabAngleRef.current = Math.atan2(dy, dx);
      }
    };
    
    element.addEventListener("mousedown", handleMouseDown);
    // Removed wheel handler - phones should not respond to scroll events

    // Add global mouse move and mouse up handlers so dragging continues even when cursor leaves the phone
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current || !isDraggingRef.current) return;

      e.preventDefault();

      const now = Date.now();
      const dt = (now - lastPosRef.current.time) / 1000;

      // Convert screen to world
      const world = screenToWorld(e.clientX, e.clientY);
      
      // Center of the phone
      const centerX = body.x + body.width / 2;
      const centerY = body.y + body.height / 2;

      if (isCornerGrabRef.current) {
        // CORNER GRAB MODE: Rotate around center, no translation
        // Calculate current angle from center to cursor
        const dx = world.x - centerX;
        const dy = world.y - centerY;
        const currentAngle = Math.atan2(dy, dx);
        
        // Calculate rotation delta from initial grab
        const angleDelta = currentAngle - initialGrabAngleRef.current;
        
        // Apply the rotation delta to the initial rotation
        const newRotation = lastRotationRef.current + angleDelta;
        
        if (dt > 0 && dt < 0.1) {
          // Calculate angular velocity
          let deltaRotation = newRotation - body.rotation;
          // Normalize to [-PI, PI]
          while (deltaRotation > Math.PI) deltaRotation -= Math.PI * 2;
          while (deltaRotation < -Math.PI) deltaRotation += Math.PI * 2;
          
          body.angularVelocity = deltaRotation / dt;
        }
        
        body.rotation = newRotation;
        
        // No linear velocity in corner grab mode
        body.vx = 0;
        body.vy = 0;
      } else {
        // NORMAL DRAG MODE: Translate with rotation based on offset
        const newX = world.x - body.width / 2 - grabOffsetRef.current.x;
        const newY = world.y - body.height / 2 - grabOffsetRef.current.y;

        // Calculate velocity
        if (dt > 0 && dt < 0.1) {
          body.vx = (newX - body.x) / dt;
          body.vy = (newY - body.y) / dt;

          // Calculate angular velocity based on grab offset
          const offset = grabOffsetRef.current;
          const offsetDistance = Math.sqrt(
            offset.x * offset.x + offset.y * offset.y,
          );

          // Only apply rotation if grabbed far from center
          if (offsetDistance > 20) {
            const rotationScale = Math.min(
              (offsetDistance - 20) / 120,
              2,
            );
            // Cross product for rotation
            const crossProduct =
              (offset.x * body.vy - offset.y * body.vx) /
              (offsetDistance * 1000);
            body.angularVelocity = crossProduct * rotationScale;
            body.rotation += body.angularVelocity * dt;
          }
        }

        body.x = newX;
        body.y = newY;
      }

      lastPosRef.current = {
        x: body.x,
        y: body.y,
        time: now,
      };

      if (onUpdate) onUpdate();
    };
    
    const handleGlobalMouseUp = (e: MouseEvent) => {
      const isMoveButton = tool === 'move' ? e.button === 0 : e.button === 1;
      
      if (isMoveButton && isPanningRef.current) {
        isPanningRef.current = false;
        isDraggingRef.current = false;
        body.isDragging = false;
        
        // Apply momentum
        const scale = 0.3;
        body.vx *= scale;
        body.vy *= scale;
        
        if (onUpdate) onUpdate();
      }
    };
    
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [body, zoom, onUpdate, screenToWorld, tool]);

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
        cursor: isDraggingRef.current ? "grabbing" : (tool === 'move' ? "grab" : "default"),
        touchAction: "none",
        userSelect: "none",
        willChange: "transform",
        transition: body.isDragging ? 'none' : 'transform 0.12s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: tool === 'interact' ? 'none' : 'auto',
      }}
      onClick={(e) => {
        // Allow clicks to propagate to children
        // Don't stop propagation here
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        {children}
      </div>
    </div>
  );
}