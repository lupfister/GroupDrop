import { useRef, useEffect, useCallback, useState } from "react";
import React from "react";
import { RigidBody, getCenterOfMass } from "../utils/physics";

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
  const lastPointerWorldRef = useRef({ x: 0, y: 0 }); // Track last pointer position for rotation
  const cumulativeRotationRef = useRef(0); // Track cumulative rotation to avoid wrapping issues
  const virtualHandleRadiusRef = useRef(50); // Fixed radius for virtual rotation handle (pixels)
  
  // Pendulum physics: handle offset from phone center (in phone-local coordinates)
  // Handle is positioned 72px above center, horizontally centered
  const handleOffsetRef = useRef({ x: 0, y: -72 }); // Handle offset from phone center
  const initialHandleWorldRef = useRef({ x: 0, y: 0 }); // Initial handle position in world space
  const handleCursorOffsetRef = useRef({ x: 0, y: 0 }); // Offset from cursor to handle when clicked
  const handleToPhoneDistanceRef = useRef(72); // Distance from handle to phone center of mass (pixels)
  
  // Pendulum state for rope physics
  const pendulumAngleRef = useRef(0); // Current pendulum angle (radians, 0 = hanging straight down)
  const pendulumAngularVelocityRef = useRef(0); // Angular velocity of pendulum (for position)
  const lastHandlePosRef = useRef({ x: 0, y: 0 }); // Last handle position for velocity calculation
  const handleVelocityRef = useRef({ x: 0, y: 0 }); // Handle velocity
  const phoneAngularVelocityRef = useRef(0); // Phone rotation angular velocity (physics-based, separate from pendulum)
  
  // Decoupled handle: target position for handle (where handle wants to be)
  const handleTargetRef = useRef({ x: 0, y: 0 }); // Target handle position in world space
  const phoneVelocityRef = useRef({ x: 0, y: 0 }); // Phone's velocity for spring physics
  
  // Use refs to track live position during drag (avoid re-renders)
  const livePosRef = useRef({ x: 0, y: 0 });
  const liveRotationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const springAnimationRef = useRef<number | null>(null);
  const dragPhysicsAnimationRef = useRef<number | null>(null);
  const lastHandleWorldPosRef = useRef({ x: 0, y: 0 }); // Track handle position for continuous physics
  const lastPhysicsUpdateTimeRef = useRef(Date.now()); // Track last physics update time
  
  // Track last position and time for velocity calculation
  const lastMoveTimeRef = useRef(Date.now());
  const lastMovePosRef = useRef({ x: 0, y: 0 });
  
  // Track movement velocity for follow-through effect
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  
  // Velocity history for smoother physics calculation
  const velocityHistoryRef = useRef<Array<{ vx: number; vy: number; time: number }>>([]);
  const maxHistoryLength = 5; // Keep last 5 velocity samples
  
  // Auto-alignment animation
  const alignmentAnimationRef = useRef<number | null>(null);
  
  // Hover state for rotation icons
  const [hoveredCorner, setHoveredCorner] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null);
  const [activeRotationCorner, setActiveRotationCorner] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [cursorAngle, setCursorAngle] = useState<number>(0);
  
  // Generate rotated cursor based on angle from phone center to cursor position
  const generateRotatedCursor = useCallback((angleRad: number) => {
    // Convert angle from radians to degrees for SVG transform
    const angleDegrees = (angleRad * 180) / Math.PI;
    // Create rotated SVG cursor by wrapping the original SVG with a transform
    const rotatedCursorSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(${angleDegrees} 16 16)"><svg x="4" y="4" width="24" height="24" viewBox="0 0 24 24" fill="none"><g clip-path="url(%23clip0_457_452)"><g filter="url(%23filter0_d_457_452)"><path d="M4.49258 12.2242C8.63926 8.0788 15.3611 8.07889 19.5077 12.2246L20.281 12.9951V11.1259C20.281 10.729 20.6028 10.4073 20.9997 10.4072C21.3966 10.4072 21.7183 10.729 21.7183 11.1259V14.7258C21.7183 15.1227 21.3966 15.4444 20.9997 15.4444H17.3998C17.0029 15.4444 16.6811 15.1227 16.6811 14.7258C16.6812 14.3289 17.0029 14.0071 17.3998 14.0071H19.2603L18.4929 13.2425L18.4922 13.2418C14.9066 9.65629 9.09328 9.65629 5.50774 13.2418L5.50669 13.2429L4.73611 14.01H6.59589C6.99275 14.01 7.31448 14.3318 7.31453 14.7286C7.31453 15.1255 6.99279 15.4472 6.59589 15.4472H2.99599C2.59909 15.4472 2.27734 15.1255 2.27734 14.7286V11.1287C2.27734 10.7318 2.59909 10.4101 2.99599 10.4101C3.39289 10.4101 3.71464 10.7318 3.71464 11.1287V12.9987L4.49258 12.2242Z" fill="black"/><path d="M15.9623 14.7255C15.9624 13.932 16.6057 13.2884 17.3995 13.2884V14.0069L17.3262 14.0104C16.9638 14.0472 16.681 14.3534 16.6809 14.7255C16.6809 15.1223 17.0026 15.444 17.3995 15.4441H20.9993C21.3713 15.4441 21.6775 15.1615 21.7144 14.7992L21.7183 14.7255V11.1256C21.7183 10.7287 21.3962 10.4071 20.9993 10.4071C20.6026 10.4072 20.2807 10.7288 20.2807 11.1256V12.9948L19.5076 12.2243C15.3611 8.07869 8.6392 8.07859 4.49252 12.224L3.7143 12.9983V11.1284C3.71426 10.7564 3.4317 10.4506 3.06942 10.4137L2.99573 10.4098C2.59889 10.4098 2.2772 10.7315 2.27716 11.1284V14.7282C2.27716 15.1251 2.59887 15.4467 2.99573 15.4468H6.59559C6.99249 15.4468 7.31416 15.1251 7.31416 14.7282C7.31404 14.3314 6.99242 14.0097 6.59559 14.0097V13.2911C7.38945 13.2911 8.033 13.9347 8.03312 14.7282C8.03312 15.522 7.38938 16.1657 6.59559 16.1657H2.99573C2.20197 16.1657 1.55859 15.522 1.55859 14.7282V11.1284C1.55863 10.3346 2.202 9.69127 2.99573 9.69122C3.7895 9.69122 4.43322 10.3346 4.43326 11.1284V11.2906C8.73024 7.43295 15.2638 7.43181 19.5622 11.287V11.1256C19.5622 10.3318 20.2058 9.68866 20.9993 9.6885L21.0734 9.69005C21.8329 9.72851 22.4368 10.3566 22.4368 11.1256V14.7255C22.4368 15.5193 21.7931 16.1626 20.9993 16.1626H17.3995C16.6306 16.1625 16.0028 15.5589 15.9643 14.7996L15.9623 14.7255ZM5.50741 13.2416C9.09294 9.65603 14.9064 9.65604 18.4919 13.2416L18.4927 13.2423L19.26 14.0069H17.3995V13.2884H17.4841C14.3292 10.5979 9.66602 10.5988 6.51215 13.2911H6.59559V14.0097H4.73581L5.50663 13.2427L5.50741 13.2416Z" fill="white"/></g></g><defs><filter id="filter0_d_457_452" x="0.121301" y="6.95919" width="23.7535" height="10.6441" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="0.718646"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_457_452"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_457_452" result="shape"/></filter><clipPath id="clip0_457_452"><rect width="24" height="24" fill="white"/></clipPath></defs></svg></g></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(rotatedCursorSvg)}") 16 16, auto`;
  }, []);
  
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

  // Calculate cursor rotation angle based on mouse position relative to phone geometric center
  // The cursor should point tangent to the rotation circle (perpendicular to radius)
  const updateCursorAngle = useCallback((worldX: number, worldY: number, rotationCenter?: { x: number; y: number }, corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    // Use provided rotation center if available (during rotation), otherwise calculate geometric center from body
    const phoneCenterX = rotationCenter ? rotationCenter.x : (body.x + body.width / 2);
    const phoneCenterY = rotationCenter ? rotationCenter.y : (body.y + body.height / 2);
    
    // Calculate angle from phone center to cursor (rotation happens around center)
    const vecX = worldX - phoneCenterX;
    const vecY = worldY - phoneCenterY;
    
    // Calculate angle from phone center to cursor
    let angleToCursor = Math.atan2(vecY, vecX);
    
    // For corners, apply innate adjustment by modifying the base angle calculation
    // This accounts for the corner's position relative to the rotation center
    if (corner) {
      // Calculate corner position relative to phone center
      const cornerOffsetX = corner === 'top-left' || corner === 'bottom-left' ? -body.width / 2 : body.width / 2;
      const cornerOffsetY = corner === 'top-left' || corner === 'top-right' ? -body.height / 2 : body.height / 2;
      
      // Calculate angle from center to corner
      const cornerAngle = Math.atan2(cornerOffsetY, cornerOffsetX);
      
      // Adjust the cursor angle based on corner position
      // Top-left and bottom-right: rotate counterclockwise (subtract from angle)
      // Bottom-left and top-right: rotate clockwise (add to angle)
      const adjustment = (corner === 'top-left' || corner === 'bottom-right') 
        ? -Math.PI / 12  // ~15 degrees counterclockwise
        : Math.PI / 12;  // ~15 degrees clockwise
      
      // Apply adjustment to the base angle before calculating tangent
      angleToCursor += adjustment;
    }
    
    // Add π/2 to make cursor tangent to rotation circle (perpendicular to radius)
    // This makes the cursor point in the direction of rotation
    const tangentAngle = angleToCursor + Math.PI / 2;
    
    setCursorAngle(tangentAngle);
  }, [body.x, body.y, body.width, body.height]);

  // Handle drag via the dot handle using pointer events (pendulum physics)
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

    // Store initial phone state
    initialPhonePosRef.current = { x: body.x, y: body.y };
    initialRotationRef.current = body.rotation;
    
    // Calculate where the handle actually is in world coordinates
    // Handle is positioned at top: -72px relative to phone container top
    // Phone container top is at body.y, so handle center is at body.y - 72 - 16 (16 = half handle height)
    // Handle is horizontally centered: body.x + body.width / 2
    const handleCenterY = body.y - 72 - 16; // 72px above top, minus half handle height
    const handleCenterX = body.x + body.width / 2;
    
    // Calculate phone top-center (attachment point where handle connects)
    // Top center is at the top edge, horizontally centered
    const phoneTopCenterX = body.x + body.width / 2;
    const phoneTopCenterY = body.y;
    
    // Calculate distance from handle center to phone top-center (attachment point)
    const dx = phoneTopCenterX - handleCenterX;
    const dy = phoneTopCenterY - handleCenterY;
    handleToPhoneDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
    
    // Store actual handle position for reference
    const actualHandleX = handleCenterX;
    const actualHandleY = handleCenterY;
    
    // Calculate offset from cursor to handle center
    // This offset will be maintained during drag
    handleCursorOffsetRef.current = {
      x: world.x - actualHandleX,
      y: world.y - actualHandleY
    };
    
    // Store initial handle and pointer positions
    initialHandleWorldRef.current = { x: actualHandleX, y: actualHandleY };
    initialPointerWorldRef.current = { x: world.x, y: world.y };
    
    // Store initial handle target for spring animation (if needed)
    handleTargetRef.current = { x: actualHandleX, y: actualHandleY };
    
    // Initialize live position and velocity tracking
    livePosRef.current = { x: body.x, y: body.y };
    liveRotationRef.current = body.rotation;
    lastMovePosRef.current = { x: body.x, y: body.y };
    lastMoveTimeRef.current = Date.now();
    lastPointerPosRef.current = { x: world.x, y: world.y };
    velocityRef.current = { x: 0, y: 0 };
    velocityHistoryRef.current = []; // Clear velocity history on new drag
    
    // Initialize handle target position (where handle wants to be)
    handleTargetRef.current = { x: actualHandleX, y: actualHandleY };
    phoneVelocityRef.current = { x: 0, y: 0 }; // Reset phone velocity for spring physics
    
    // Initialize pendulum state
    // Calculate initial pendulum angle from handle to phone top-center (attachment point)
    const initialPhoneTopCenterX = phoneTopCenterX;
    const initialPhoneTopCenterY = phoneTopCenterY;
    const initialDx = initialPhoneTopCenterX - actualHandleX;
    const initialDy = initialPhoneTopCenterY - actualHandleY;
    const initialRopeAngle = Math.atan2(initialDy, initialDx);
    pendulumAngleRef.current = initialRopeAngle;
    pendulumAngularVelocityRef.current = 0;
    
    // Initialize phone rotation physics (separate from rope angle)
    // Start with current rotation and angular velocity
    phoneAngularVelocityRef.current = body.angularVelocity || 0;
    
    // Initialize handle position and velocity tracking
    lastHandlePosRef.current = { x: actualHandleX, y: actualHandleY };
    lastHandleWorldPosRef.current = { x: actualHandleX, y: actualHandleY };
    handleVelocityRef.current = { x: 0, y: 0 };
    
    // Start continuous physics animation loop
    startDragPhysicsAnimation();

    // Reset velocities
    body.vx = 0;
    body.vy = 0;
    body.angularVelocity = 0;
  }, [body, screenToWorld]);

  // Handle rotation via corner arrows - rotates around geometric center
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
    setActiveRotationCorner(corner);

    // Convert screen coordinates to world coordinates
    const world = screenToWorld(e.clientX, e.clientY);

    // Rotation center is the phone's geometric center
    const phoneCenterX = body.x + body.width / 2;
    const phoneCenterY = body.y + body.height / 2;
    initialRotationCenterRef.current = { x: phoneCenterX, y: phoneCenterY };

    // Calculate initial distance and angle from geometric center to pointer position
    const initialVecX = world.x - phoneCenterX;
    const initialVecY = world.y - phoneCenterY;
    const initialDistance = Math.sqrt(initialVecX * initialVecX + initialVecY * initialVecY);
    
    // Set virtual handle radius: use initial distance if reasonable, otherwise use default
    // This ensures rotation feels natural - if you start far, it stays far; if close, uses minimum
    const minRadius = 30; // Minimum radius for stability
    const maxRadius = 100; // Maximum radius for reasonable feel
    virtualHandleRadiusRef.current = Math.max(minRadius, Math.min(maxRadius, initialDistance || minRadius));
    
    const initialAngle = Math.atan2(initialVecY, initialVecX);

    // Store initial angle (absolute, not relative)
    initialRotationRef.current = body.rotation;
    initialAngleRelativeRef.current = initialAngle; // Store absolute initial angle
    lastPointerWorldRef.current = { x: world.x, y: world.y }; // Initialize last pointer position
    cumulativeRotationRef.current = 0; // Reset cumulative rotation
    
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
  // Rotation happens around phone center
  const updatePhoneTransform = useCallback((x: number, y: number, rotation: number) => {
    body.x = x;
    body.y = y;
    body.rotation = rotation;
    livePosRef.current = { x, y };
    liveRotationRef.current = rotation;
    
    // Update transform directly via DOM for smooth movement
    // Transform origin is at phone center
    if (containerRef.current) {
      containerRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}rad)`;
      containerRef.current.style.transformOrigin = '50% 50%'; // Center of phone
    }
  }, [body]);
  
  // Continuous physics animation loop while dragging
  // Only runs when cursor hasn't moved recently (to avoid conflicts with immediate updates)
  const startDragPhysicsAnimation = useCallback(() => {
    if (dragPhysicsAnimationRef.current !== null) {
      cancelAnimationFrame(dragPhysicsAnimationRef.current);
    }
    
    let lastTime = Date.now();
    lastPhysicsUpdateTimeRef.current = lastTime;
    
    const animate = () => {
      if (!isDraggingRef.current) {
        dragPhysicsAnimationRef.current = null;
        return;
      }
      
      const now = Date.now();
      const timeSinceLastPointerMove = now - lastMoveTimeRef.current;
      
      // Only run physics loop if cursor hasn't moved recently (>30ms = not in same frame as pointer move)
      // This prevents conflicts with immediate pointer move updates
      if (timeSinceLastPointerMove < 30) {
        dragPhysicsAnimationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Use consistent dt for smoother physics
      const rawDt = (now - lastTime) / 1000;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.033); // Clamp between 1ms and 33ms
      lastTime = now;
      lastPhysicsUpdateTimeRef.current = now;
      
      // Use stored handle position (updated by pointer move events)
      const handleWorldX = lastHandleWorldPosRef.current.x;
      const handleWorldY = lastHandleWorldPosRef.current.y;
      
      // Get current phone top-center position (attachment point)
      const currentPhoneTopCenterX = livePosRef.current.x + body.width / 2;
      const currentPhoneTopCenterY = livePosRef.current.y;
      
      // Calculate current rope vector and angle
      const ropeDx = currentPhoneTopCenterX - handleWorldX;
      const ropeDy = currentPhoneTopCenterY - handleWorldY;
      const ropeLength = handleToPhoneDistanceRef.current;
      const currentAngle = Math.atan2(ropeDy, ropeDx);
      
      // Pendulum physics: apply forces based on handle movement
      const gravity = 2000; // Gravity strength (pixels/s²)
      const damping = 0.95; // Angular damping (air resistance)
      
      // Calculate angle relative to vertical (hanging straight down = 0)
      const angleFromVertical = currentAngle - Math.PI / 2;
      
      // Gravity force: pulls pendulum toward vertical (angle = PI/2)
      const gravityTorque = -Math.sin(angleFromVertical) * gravity / ropeLength;
      
      // Handle movement force: use smoothed handle velocity
      const tangentX = -Math.sin(currentAngle);
      const tangentY = Math.cos(currentAngle);
      const handleForceAlongTangent = handleVelocityRef.current.x * tangentX + handleVelocityRef.current.y * tangentY;
      const handleTorque = handleForceAlongTangent / ropeLength * 0.8;
      
      // Apply forces to pendulum angular velocity
      pendulumAngularVelocityRef.current += (gravityTorque + handleTorque) * dt;
      
      // Apply damping to pendulum
      pendulumAngularVelocityRef.current *= damping;
      
      // Update pendulum angle based on angular velocity
      pendulumAngleRef.current += pendulumAngularVelocityRef.current * dt;
      
      // Normalize angle
      while (pendulumAngleRef.current > Math.PI) pendulumAngleRef.current -= Math.PI * 2;
      while (pendulumAngleRef.current < -Math.PI) pendulumAngleRef.current += Math.PI * 2;
      
      // Calculate phone top-center position based on rope angle and length
      const phoneTopCenterX = handleWorldX + Math.cos(pendulumAngleRef.current) * ropeLength;
      const phoneTopCenterY = handleWorldY + Math.sin(pendulumAngleRef.current) * ropeLength;
      
      // PHYSICS-BASED ROTATION - no restoring force, pure physics from movement
      const rotationDamping = 0.94;
      
      const handleSpeed = Math.sqrt(handleVelocityRef.current.x ** 2 + handleVelocityRef.current.y ** 2);
      const rotationTorqueFromHandle = handleSpeed * 0.001;
      
      const pendulumSwingSpeed = Math.abs(pendulumAngularVelocityRef.current);
      const rotationTorqueFromSwing = pendulumSwingSpeed * 0.002;
      
      // No restoring force - rotation is purely from movement forces
      const movementTorque = (rotationTorqueFromHandle + rotationTorqueFromSwing) * Math.sign(pendulumAngularVelocityRef.current || 1);
      phoneAngularVelocityRef.current += movementTorque * dt;
      
      phoneAngularVelocityRef.current *= rotationDamping;
      
      const currentRotation = liveRotationRef.current;
      const newRotation = currentRotation + phoneAngularVelocityRef.current * dt;
      
      // Normalize rotation
      let normalizedRotation = newRotation;
      while (normalizedRotation > Math.PI) normalizedRotation -= Math.PI * 2;
      while (normalizedRotation < -Math.PI) normalizedRotation += Math.PI * 2;
      
      // Convert top-center position to top-left position
      const newX = phoneTopCenterX - body.width / 2;
      const newY = phoneTopCenterY;
      
      // Update phone position and rotation
      updatePhoneTransform(newX, newY, normalizedRotation);
      
      // Decay handle velocity (smooth out when not moving)
      handleVelocityRef.current.x *= 0.9;
      handleVelocityRef.current.y *= 0.9;
      
      // Continue animation
      dragPhysicsAnimationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  }, [body, updatePhoneTransform]);
  
  // Spring physics animation: phone follows handle with lag
  // Using interpolation-based approach for smoother, more responsive feel
  const startSpringAnimation = useCallback(() => {
    if (springAnimationRef.current !== null) {
      cancelAnimationFrame(springAnimationRef.current);
    }
    
    let lastTime = Date.now();
    
    const animate = () => {
      if (!isDraggingRef.current) {
        springAnimationRef.current = null;
        return;
      }
      
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05); // Cap dt to prevent large jumps
      lastTime = now;
      
      // Get current phone center of mass (using live position, not body position)
      const phoneCenterX = livePosRef.current.x + body.width / 2;
      const phoneCenterY = livePosRef.current.y + body.height;
      
      // Calculate where handle currently is (based on phone position)
      const cos = Math.cos(liveRotationRef.current);
      const sin = Math.sin(liveRotationRef.current);
      const rotatedOffsetX = handleOffsetRef.current.x * cos - handleOffsetRef.current.y * sin;
      const rotatedOffsetY = handleOffsetRef.current.x * sin + handleOffsetRef.current.y * cos;
      const currentHandleX = phoneCenterX + rotatedOffsetX;
      const currentHandleY = phoneCenterY + rotatedOffsetY;
      
      // Vector from current handle position to target handle position
      const dx = handleTargetRef.current.x - currentHandleX;
      const dy = handleTargetRef.current.y - currentHandleY;
      
      // Use exponential interpolation for smooth lag effect
      // Higher factor (closer to 1) = faster response, lower = more lag
      const lagFactor = 0.25; // 0.25 means phone moves 25% of the way each frame (at 60fps)
      // Adjust for frame rate to maintain consistent feel
      const adjustedFactor = 1 - Math.pow(1 - lagFactor, dt * 60);
      
      // Calculate desired handle movement
      const desiredHandleX = currentHandleX + dx * adjustedFactor;
      const desiredHandleY = currentHandleY + dy * adjustedFactor;
      
      // Calculate what phone position would give us this handle position
      // We need to solve: desiredHandle = phoneCenter + rotatedOffset
      // So: phoneCenter = desiredHandle - rotatedOffset
      const desiredPhoneCenterX = desiredHandleX - rotatedOffsetX;
      const desiredPhoneCenterY = desiredHandleY - rotatedOffsetY;
      
      // Convert center of mass to top-left position
      const newX = desiredPhoneCenterX - body.width / 2;
      const newY = desiredPhoneCenterY - body.height;
      
      // Track velocity for release momentum
      const deltaX = newX - livePosRef.current.x;
      const deltaY = newY - livePosRef.current.y;
      phoneVelocityRef.current.x = deltaX / dt;
      phoneVelocityRef.current.y = deltaY / dt;
      
      // Keep rotation fixed during drag
      const newRotation = initialRotationRef.current;
      
      // Update phone transform
      updatePhoneTransform(newX, newY, newRotation);
      
      // Continue animation
      springAnimationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  }, [body, updatePhoneTransform]);
  
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
        
        // Update cursor angle based on current pointer position, using rotation center and corner
        updateCursorAngle(world.x, world.y, center, rotationCornerRef.current);
        
        // Calculate vectors from center to current and last pointer positions
        const currentVecX = world.x - center.x;
        const currentVecY = world.y - center.y;
        const currentDistance = Math.sqrt(currentVecX * currentVecX + currentVecY * currentVecY);
        
        const lastVecX = lastPointerWorldRef.current.x - center.x;
        const lastVecY = lastPointerWorldRef.current.y - center.y;
        const lastDistance = Math.sqrt(lastVecX * lastVecX + lastVecY * lastVecY);
        
        // Minimum distance threshold - below this, rotation becomes unstable
        const minDistance = 2; // pixels - very small threshold
        
        // Only calculate rotation if both current and last positions are far enough from center
        // This prevents angle flips when cursor crosses through center
        if (currentDistance > minDistance && lastDistance > minDistance) {
          // Calculate angles from center
          const currentAngle = Math.atan2(currentVecY, currentVecX);
          const lastAngle = Math.atan2(lastVecY, lastVecX);
          
          // Calculate angle delta
          let angleDelta = currentAngle - lastAngle;
          
          // Handle angle wrapping: normalize to [-PI, PI] for shortest rotation path
          while (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
          while (angleDelta < -Math.PI) angleDelta += Math.PI * 2;
          
          // Accumulate the rotation delta
          cumulativeRotationRef.current += angleDelta;
        }
        // If cursor is too close to center, skip rotation update (maintains last rotation)
        // This prevents wild flips when cursor passes through center
        
        // Update last pointer position for next frame
        lastPointerWorldRef.current = { x: world.x, y: world.y };
        
        // Calculate new rotation from initial rotation plus cumulative delta
        const newRotation = initialRotationRef.current + cumulativeRotationRef.current;
        
        // Normalize rotation to [-PI, PI]
        let normalizedRotation = newRotation;
        while (normalizedRotation > Math.PI) normalizedRotation -= Math.PI * 2;
        while (normalizedRotation < -Math.PI) normalizedRotation += Math.PI * 2;
        
        // Phone position stays the same (rotating around center)
        const newX = initialPhonePosRef.current.x;
        const newY = initialPhonePosRef.current.y;
        
        updatePhoneTransform(newX, newY, normalizedRotation);
      } else if (isDraggingRef.current) {
        // Drag mode: phone hangs from handle like a rope/pendulum with physics-based swinging
        // Handle position = cursor position - cursor offset
        const handleWorldX = world.x - handleCursorOffsetRef.current.x;
        const handleWorldY = world.y - handleCursorOffsetRef.current.y;
        
        const now = Date.now();
        // Use consistent dt for smoother physics (cap to prevent jitter from sporadic movement)
        const rawDt = (now - lastMoveTimeRef.current) / 1000;
        const dt = Math.min(Math.max(rawDt, 0.001), 0.033); // Clamp between 1ms and 33ms (30fps min, 1000fps max)
        
        // Calculate handle velocity (for applying forces to pendulum)
        const handleDeltaX = handleWorldX - lastHandlePosRef.current.x;
        const handleDeltaY = handleWorldY - lastHandlePosRef.current.y;
        const handleVx = handleDeltaX / dt;
        const handleVy = handleDeltaY / dt;
        
        // Smooth handle velocity more aggressively to reduce jitter
        const handleVelSmoothing = 0.3; // Reduced from 0.5 for smoother velocity
        handleVelocityRef.current.x = handleVelocityRef.current.x * (1 - handleVelSmoothing) + handleVx * handleVelSmoothing;
        handleVelocityRef.current.y = handleVelocityRef.current.y * (1 - handleVelSmoothing) + handleVy * handleVelSmoothing;
        
        // Update stored handle position (used by continuous physics loop)
        lastHandlePosRef.current = { x: handleWorldX, y: handleWorldY };
        lastHandleWorldPosRef.current = { x: handleWorldX, y: handleWorldY };
        
        // IMMEDIATE UPDATE: Calculate and apply physics immediately for real-time response
        // Get current phone top-center position (attachment point)
        const currentPhoneTopCenterX = livePosRef.current.x + body.width / 2;
        const currentPhoneTopCenterY = livePosRef.current.y;
        
        // Calculate current rope vector and angle
        const ropeDx = currentPhoneTopCenterX - handleWorldX;
        const ropeDy = currentPhoneTopCenterY - handleWorldY;
        const ropeLength = handleToPhoneDistanceRef.current;
        const currentAngle = Math.atan2(ropeDy, ropeDx);
        
        // Pendulum physics: apply forces based on handle movement
        const gravity = 2000; // Gravity strength (pixels/s²)
        const damping = 0.95; // Angular damping (air resistance)
        
        // Calculate angle relative to vertical (hanging straight down = 0)
        const angleFromVertical = currentAngle - Math.PI / 2;
        
        // Gravity force: pulls pendulum toward vertical (angle = PI/2)
        const gravityTorque = -Math.sin(angleFromVertical) * gravity / ropeLength;
        
        // Handle movement force: when handle moves, it applies force to pendulum
        const tangentX = -Math.sin(currentAngle);
        const tangentY = Math.cos(currentAngle);
        const handleForceAlongTangent = handleVelocityRef.current.x * tangentX + handleVelocityRef.current.y * tangentY;
        const handleTorque = handleForceAlongTangent / ropeLength * 0.8;
        
        // Apply forces to pendulum angular velocity
        pendulumAngularVelocityRef.current += (gravityTorque + handleTorque) * dt;
        
        // Apply damping to pendulum
        pendulumAngularVelocityRef.current *= damping;
        
        // Update pendulum angle based on angular velocity
        pendulumAngleRef.current += pendulumAngularVelocityRef.current * dt;
        
        // Normalize angle
        while (pendulumAngleRef.current > Math.PI) pendulumAngleRef.current -= Math.PI * 2;
        while (pendulumAngleRef.current < -Math.PI) pendulumAngleRef.current += Math.PI * 2;
        
        // Calculate phone top-center position based on rope angle and length
        const phoneTopCenterX = handleWorldX + Math.cos(pendulumAngleRef.current) * ropeLength;
        const phoneTopCenterY = handleWorldY + Math.sin(pendulumAngleRef.current) * ropeLength;
        
        // PHYSICS-BASED ROTATION - no restoring force, pure physics from movement
        const rotationDamping = 0.94;
        
        const handleSpeed = Math.sqrt(handleVelocityRef.current.x ** 2 + handleVelocityRef.current.y ** 2);
        const rotationTorqueFromHandle = handleSpeed * 0.001;
        
        const pendulumSwingSpeed = Math.abs(pendulumAngularVelocityRef.current);
        const rotationTorqueFromSwing = pendulumSwingSpeed * 0.002;
        
        // No restoring force - rotation is purely from movement forces
        const movementTorque = (rotationTorqueFromHandle + rotationTorqueFromSwing) * Math.sign(pendulumAngularVelocityRef.current || 1);
        phoneAngularVelocityRef.current += movementTorque * dt;
        
        phoneAngularVelocityRef.current *= rotationDamping;
        
        const currentRotation = liveRotationRef.current;
        const newRotation = currentRotation + phoneAngularVelocityRef.current * dt;
        
        // Normalize rotation
        let normalizedRotation = newRotation;
        while (normalizedRotation > Math.PI) normalizedRotation -= Math.PI * 2;
        while (normalizedRotation < -Math.PI) normalizedRotation += Math.PI * 2;
        
        // Convert top-center position to top-left position
        const newX = phoneTopCenterX - body.width / 2;
        const newY = phoneTopCenterY;
        
        // Update phone position and rotation immediately for real-time response
        updatePhoneTransform(newX, newY, normalizedRotation);
        
        // Update tracking refs
        lastPointerPosRef.current = { x: world.x, y: world.y };
        lastMoveTimeRef.current = now;
        lastMovePosRef.current = { x: livePosRef.current.x, y: livePosRef.current.y };
        
        // Calculate velocity for follow-through effect (for when drag ends)
        // Reuse 'now' and 'dt' from above
        const pointerDeltaX = world.x - lastPointerPosRef.current.x;
        const pointerDeltaY = world.y - lastPointerPosRef.current.y;
        
        // Calculate instantaneous velocity
        const instantVx = pointerDeltaX / dt;
        const instantVy = pointerDeltaY / dt;
        
        // Smooth velocity calculation (exponential moving average)
        const alpha = 0.4;
        velocityRef.current.x = velocityRef.current.x * (1 - alpha) + instantVx * alpha;
        velocityRef.current.y = velocityRef.current.y * (1 - alpha) + instantVy * alpha;
        
        // Store velocity in history for better release calculation
        velocityHistoryRef.current.push({
          vx: instantVx,
          vy: instantVy,
          time: now
        });
        
        // Keep only recent history
        if (velocityHistoryRef.current.length > maxHistoryLength) {
          velocityHistoryRef.current.shift();
        }
        
        // Update tracking refs
        lastPointerPosRef.current = { x: world.x, y: world.y };
        lastMoveTimeRef.current = now;
        lastMovePosRef.current = { x: livePosRef.current.x, y: livePosRef.current.y };
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
        setActiveRotationCorner(null);
        
        // Release pointer capture
        if (e.target instanceof HTMLElement && e.target.hasPointerCapture(e.pointerId)) {
          e.target.releasePointerCapture(e.pointerId);
        }
        
        if (wasDragging) {
          // Stop continuous physics animation
          if (dragPhysicsAnimationRef.current !== null) {
            cancelAnimationFrame(dragPhysicsAnimationRef.current);
            dragPhysicsAnimationRef.current = null;
          }
          
          // Stop spring animation (if any)
          if (springAnimationRef.current !== null) {
            cancelAnimationFrame(springAnimationRef.current);
            springAnimationRef.current = null;
          }
          
        // Calculate velocity from pendulum physics when released
        // Convert angular velocity to linear velocity
        const ropeLength = handleToPhoneDistanceRef.current;
        const currentAngle = pendulumAngleRef.current;
        const angularVel = pendulumAngularVelocityRef.current;
        
        // Linear velocity is perpendicular to rope direction (tangent to swing arc)
        const tangentX = -Math.sin(currentAngle); // Perpendicular to rope
        const tangentY = Math.cos(currentAngle);
        
        // Velocity magnitude = angular velocity * radius
        const velocityMagnitude = angularVel * ropeLength;
        body.vx = tangentX * velocityMagnitude;
        body.vy = tangentY * velocityMagnitude;
        
        // Also add handle velocity component (for momentum from handle movement)
        const handleVx = handleVelocityRef.current.x;
        const handleVy = handleVelocityRef.current.y;
        
        // Project handle velocity onto phone's tangent direction
        const handleComponent = handleVx * tangentX + handleVy * tangentY;
        body.vx += handleComponent * tangentX * 0.3; // Add component along swing direction
        body.vy += handleComponent * tangentY * 0.3;
        
        // Apply momentum scaling to preserve swing energy
        const momentumScale = 1.0; // Preserve all swing energy for more sliding
        body.vx *= momentumScale;
        body.vy *= momentumScale;
        
          // Angular velocity from phone rotation physics
          // Preserve the physics-based rotation angular velocity
          body.angularVelocity = phoneAngularVelocityRef.current;
        } else {
          // Reset velocities for rotation
          body.vx = 0;
          body.vy = 0;
          body.angularVelocity = 0;
        }
        
        // Sync final position
        body.x = livePosRef.current.x;
        body.y = livePosRef.current.y;
        body.rotation = liveRotationRef.current;
        
        // Start auto-alignment animation to face forward (only after movement via corner rotation, not handle drag)
        // When dragging via handle, phone hangs naturally so no auto-alignment needed
        if (wasRotating) {
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
      if (dragPhysicsAnimationRef.current !== null) {
        cancelAnimationFrame(dragPhysicsAnimationRef.current);
        dragPhysicsAnimationRef.current = null;
      }
      if (springAnimationRef.current !== null) {
        cancelAnimationFrame(springAnimationRef.current);
        springAnimationRef.current = null;
      }
      if (alignmentAnimationRef.current !== null) {
        cancelAnimationFrame(alignmentAnimationRef.current);
        alignmentAnimationRef.current = null;
      }
    };
  }, [body, zoom, onUpdate, screenToWorld, updatePhoneTransform, realignPhone, updateCursorAngle, startSpringAnimation, startDragPhysicsAnimation]);

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
      className="select-none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: `${body.width}px`,
        height: `${body.height}px`,
        transform: `translate(${body.x}px, ${body.y}px) rotate(${body.rotation}rad)`,
        transformOrigin: '50% 50%', // Rotate around center of phone
        cursor: 'default',
        willChange: "transform",
        transition: body.isDragging || alignmentAnimationRef.current !== null ? 'none' : 'transform 0.12s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: 'none',
        userSelect: 'none',
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
      {/* Top-left corner hover zone */}
      <div
        onMouseEnter={() => setHoveredCorner('top-left')}
        onMouseLeave={() => {
          setHoveredCorner(null);
          setMousePosition(null);
        }}
        onMouseMove={(e) => {
          const world = screenToWorld(e.clientX, e.clientY);
          updateCursorAngle(world.x, world.y, undefined, 'top-left');
        }}
        onPointerDown={(e) => handleCornerRotationDown(e, 'top-left')}
        className="absolute select-none"
        data-name="RotationHandle-TopLeft"
        style={{
          left: '-60px',
          top: '-60px',
          width: '120px',
          height: '120px',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          cursor: (activeRotationCorner === 'top-left' || hoveredCorner === 'top-left') 
            ? generateRotatedCursor(cursorAngle)
            : 'default',
          zIndex: 9999,
        }}
      />

      {/* Top-right corner hover zone */}
      <div
        onMouseEnter={() => setHoveredCorner('top-right')}
        onMouseLeave={() => {
          setHoveredCorner(null);
          setMousePosition(null);
        }}
        onMouseMove={(e) => {
          const world = screenToWorld(e.clientX, e.clientY);
          updateCursorAngle(world.x, world.y, undefined, 'top-right');
        }}
        onPointerDown={(e) => handleCornerRotationDown(e, 'top-right')}
        className="absolute select-none"
        data-name="RotationHandle-TopRight"
        style={{
          right: '-60px',
          top: '-60px',
          width: '120px',
          height: '120px',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          cursor: (activeRotationCorner === 'top-right' || hoveredCorner === 'top-right')
            ? generateRotatedCursor(cursorAngle)
            : 'default',
          zIndex: 9999,
        }}
      />

      {/* Bottom-left corner hover zone */}
      <div
        onMouseEnter={() => setHoveredCorner('bottom-left')}
        onMouseLeave={() => {
          setHoveredCorner(null);
          setMousePosition(null);
        }}
        onMouseMove={(e) => {
          const world = screenToWorld(e.clientX, e.clientY);
          updateCursorAngle(world.x, world.y, undefined, 'bottom-left');
        }}
        onPointerDown={(e) => handleCornerRotationDown(e, 'bottom-left')}
        className="absolute select-none"
        data-name="RotationHandle-BottomLeft"
        style={{
          left: '-60px',
          bottom: '-60px',
          width: '120px',
          height: '120px',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          cursor: (activeRotationCorner === 'bottom-left' || hoveredCorner === 'bottom-left')
            ? generateRotatedCursor(cursorAngle)
            : 'default',
          zIndex: 9999,
        }}
      />

      {/* Bottom-right corner hover zone */}
      <div
        onMouseEnter={() => setHoveredCorner('bottom-right')}
        onMouseLeave={() => {
          setHoveredCorner(null);
          setMousePosition(null);
        }}
        onMouseMove={(e) => {
          const world = screenToWorld(e.clientX, e.clientY);
          updateCursorAngle(world.x, world.y, undefined, 'bottom-right');
        }}
        onPointerDown={(e) => handleCornerRotationDown(e, 'bottom-right')}
        className="absolute select-none"
        data-name="RotationHandle-BottomRight"
        style={{
          right: '-60px',
          bottom: '-60px',
          width: '120px',
          height: '120px',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          cursor: (activeRotationCorner === 'bottom-right' || hoveredCorner === 'bottom-right')
            ? generateRotatedCursor(cursorAngle)
            : 'default',
          zIndex: 9999,
        }}
      />
      {children}
    </div>
  );
}