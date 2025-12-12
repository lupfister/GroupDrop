// Rigid body physics engine

export interface RigidBody {
  id: number;
  // Position
  x: number;
  y: number;
  rotation: number; // radians
  
  // Velocity
  vx: number;
  vy: number;
  angularVelocity: number; // radians per second
  
  // Physical properties
  mass: number;
  momentOfInertia: number;
  restitution: number; // bounciness (0-1)
  friction: number; // (0-1)
  
  // Dimensions
  width: number;
  height: number;
  
  // State
  isDragging: boolean;
  
  // Profile
  profileImage: string;
}

// Get center of mass (bottom middle of the phone)
export function getCenterOfMass(body: RigidBody): { x: number; y: number } {
  return {
    x: body.x + body.width / 2,
    y: body.y + body.height
  };
}

// Calculate moment of inertia for a rectangle with center of mass at bottom middle
// Uses parallel axis theorem: I = I_cm + m*d^2
// where I_cm is moment of inertia about geometric center, and d is distance from geometric center to COM
export function calculateMomentOfInertia(mass: number, width: number, height: number): number {
  // Moment of inertia about geometric center
  const I_cm = (mass * (width * width + height * height)) / 12;
  // Distance from geometric center to bottom middle (COM)
  const d = height / 2;
  // Parallel axis theorem
  return I_cm + mass * d * d;
}

// Rotate a point around origin
function rotatePoint(x: number, y: number, angle: number): { x: number; y: number } {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos
  };
}

// Get corners of a rotated rectangle
// Rotation happens around the center of mass (bottom middle)
function getRectCorners(body: RigidBody): { x: number; y: number }[] {
  const hw = body.width / 2;
  const hh = body.height;
  // Center of mass is at bottom middle
  const comX = body.x + body.width / 2;
  const comY = body.y + body.height;
  
  // Corners relative to center of mass (bottom middle)
  const corners = [
    { x: -hw, y: -hh }, // top-left relative to COM
    { x: hw, y: -hh },  // top-right relative to COM
    { x: hw, y: 0 },    // bottom-right relative to COM
    { x: -hw, y: 0 }    // bottom-left relative to COM
  ];
  
  return corners.map(corner => {
    const rotated = rotatePoint(corner.x, corner.y, body.rotation);
    return {
      x: rotated.x + comX,
      y: rotated.y + comY
    };
  });
}

// Project corners onto an axis
function projectOntoAxis(corners: { x: number; y: number }[], axis: { x: number; y: number }): { min: number; max: number } {
  const projections = corners.map(c => c.x * axis.x + c.y * axis.y);
  return {
    min: Math.min(...projections),
    max: Math.max(...projections)
  };
}

// Separating Axis Theorem (SAT) collision detection
export function checkCollision(body1: RigidBody, body2: RigidBody): {
  hasCollision: boolean;
  normal?: { x: number; y: number };
  penetration?: number;
  contactPoint?: { x: number; y: number };
} {
  const corners1 = getRectCorners(body1);
  const corners2 = getRectCorners(body2);
  
  const axes: { x: number; y: number }[] = [];
  
  // Get axes from both bodies (perpendicular to edges)
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    
    // Body 1 axes
    const edge1 = {
      x: corners1[j].x - corners1[i].x,
      y: corners1[j].y - corners1[i].y
    };
    const len1 = Math.sqrt(edge1.x * edge1.x + edge1.y * edge1.y);
    if (len1 > 0) {
      axes.push({ x: -edge1.y / len1, y: edge1.x / len1 });
    }
    
    // Body 2 axes
    const edge2 = {
      x: corners2[j].x - corners2[i].x,
      y: corners2[j].y - corners2[i].y
    };
    const len2 = Math.sqrt(edge2.x * edge2.x + edge2.y * edge2.y);
    if (len2 > 0) {
      axes.push({ x: -edge2.y / len2, y: edge2.x / len2 });
    }
  }
  
  let minOverlap = Infinity;
  let collisionAxis = { x: 0, y: 0 };
  
  // Test each axis
  for (const axis of axes) {
    const proj1 = projectOntoAxis(corners1, axis);
    const proj2 = projectOntoAxis(corners2, axis);
    
    // Check for separation
    if (proj1.max < proj2.min || proj2.max < proj1.min) {
      return { hasCollision: false };
    }
    
    // Calculate overlap
    const overlap = Math.min(proj1.max - proj2.min, proj2.max - proj1.min);
    if (overlap < minOverlap) {
      minOverlap = overlap;
      collisionAxis = axis;
    }
  }
  
  // Calculate centers of mass (bottom middle)
  const com1 = getCenterOfMass(body1);
  const com2 = getCenterOfMass(body2);
  
  // Make sure normal points from body2 to body1
  const dirX = com1.x - com2.x;
  const dirY = com1.y - com2.y;
  const dot = dirX * collisionAxis.x + dirY * collisionAxis.y;
  if (dot < 0) {
    collisionAxis.x = -collisionAxis.x;
    collisionAxis.y = -collisionAxis.y;
  }
  
  // Contact point (approximate as center between bodies)
  const contactPoint = {
    x: (com1.x + com2.x) / 2,
    y: (com1.y + com2.y) / 2
  };
  
  return {
    hasCollision: true,
    normal: collisionAxis,
    penetration: minOverlap,
    contactPoint
  };
}

// Resolve collision between two bodies
export function resolveCollision(body1: RigidBody, body2: RigidBody, collision: {
  normal: { x: number; y: number };
  penetration: number;
  contactPoint: { x: number; y: number };
}): void {
  const { normal, penetration, contactPoint } = collision;
  
  // Calculate centers of mass (bottom middle)
  const com1 = getCenterOfMass(body1);
  const com2 = getCenterOfMass(body2);
  
  // Vectors from centers of mass to contact point
  const r1 = { x: contactPoint.x - com1.x, y: contactPoint.y - com1.y };
  const r2 = { x: contactPoint.x - com2.x, y: contactPoint.y - com2.y };
  
  // Velocity at contact point
  const v1 = {
    x: body1.vx - body1.angularVelocity * r1.y,
    y: body1.vy + body1.angularVelocity * r1.x
  };
  
  const v2 = {
    x: body2.vx - body2.angularVelocity * r2.y,
    y: body2.vy + body2.angularVelocity * r2.x
  };
  
  // Relative velocity
  const relVel = {
    x: v1.x - v2.x,
    y: v1.y - v2.y
  };
  
  // Velocity along normal
  const velAlongNormal = relVel.x * normal.x + relVel.y * normal.y;
  
  // Don't resolve if separating
  if (velAlongNormal > 0) return;
  
  // Calculate restitution
  const e = Math.min(body1.restitution, body2.restitution);
  
  // Calculate impulse
  const r1CrossN = r1.x * normal.y - r1.y * normal.x;
  const r2CrossN = r2.x * normal.y - r2.y * normal.x;
  
  const invMass1 = body1.isDragging ? 0 : 1 / body1.mass;
  const invMass2 = body2.isDragging ? 0 : 1 / body2.mass;
  const invI1 = body1.isDragging ? 0 : 1 / body1.momentOfInertia;
  const invI2 = body2.isDragging ? 0 : 1 / body2.momentOfInertia;
  
  const denominator = invMass1 + invMass2 + 
    r1CrossN * r1CrossN * invI1 + 
    r2CrossN * r2CrossN * invI2;
  
  const j = -(1 + e) * velAlongNormal / denominator;
  
  // Apply impulse
  const impulseX = j * normal.x;
  const impulseY = j * normal.y;
  
  if (!body1.isDragging) {
    body1.vx += impulseX * invMass1;
    body1.vy += impulseY * invMass1;
    body1.angularVelocity += r1CrossN * j * invI1;
  }
  
  if (!body2.isDragging) {
    body2.vx -= impulseX * invMass2;
    body2.vy -= impulseY * invMass2;
    body2.angularVelocity -= r2CrossN * j * invI2;
  }
  
  // Apply friction
  const tangent = { x: -normal.y, y: normal.x };
  const velAlongTangent = relVel.x * tangent.x + relVel.y * tangent.y;
  
  const r1CrossT = r1.x * tangent.y - r1.y * tangent.x;
  const r2CrossT = r2.x * tangent.y - r2.y * tangent.x;
  
  const frictionDenom = invMass1 + invMass2 + 
    r1CrossT * r1CrossT * invI1 + 
    r2CrossT * r2CrossT * invI2;
  
  const mu = Math.min(body1.friction, body2.friction);
  let jt = -velAlongTangent / frictionDenom;
  
  // Coulomb's law
  jt = Math.max(-Math.abs(j) * mu, Math.min(jt, Math.abs(j) * mu));
  
  const frictionX = jt * tangent.x;
  const frictionY = jt * tangent.y;
  
  if (!body1.isDragging) {
    body1.vx += frictionX * invMass1;
    body1.vy += frictionY * invMass1;
    body1.angularVelocity += r1CrossT * jt * invI1;
  }
  
  if (!body2.isDragging) {
    body2.vx -= frictionX * invMass2;
    body2.vy -= frictionY * invMass2;
    body2.angularVelocity -= r2CrossT * jt * invI2;
  }
  
  // Positional correction
  const percent = 0.8;
  const slop = 0.01;
  const correctionMag = Math.max(penetration - slop, 0) / (invMass1 + invMass2) * percent;
  const correctionX = correctionMag * normal.x;
  const correctionY = correctionMag * normal.y;
  
  if (!body1.isDragging) {
    body1.x += correctionX * invMass1;
    body1.y += correctionY * invMass1;
  }
  
  if (!body2.isDragging) {
    body2.x -= correctionX * invMass2;
    body2.y -= correctionY * invMass2;
  }
}

// Check and resolve boundary collisions
export function checkBoundaryCollision(body: RigidBody, width: number, height: number): void {
  if (body.isDragging) return;
  
  const minX = 0;
  const maxX = width - body.width;
  const minY = 0;
  const maxY = height - body.height;
  
  // Check X boundaries (using top-left position, not center of mass)
  if (body.x < minX) {
    body.x = minX;
    body.vx = Math.abs(body.vx) * body.restitution;
    // Add rotation from collision
    body.angularVelocity += body.vy * 0.001;
  } else if (body.x > maxX) {
    body.x = maxX;
    body.vx = -Math.abs(body.vx) * body.restitution;
    body.angularVelocity += body.vy * 0.001;
  }
  
  // Check Y boundaries
  if (body.y < minY) {
    body.y = minY;
    body.vy = Math.abs(body.vy) * body.restitution;
    body.angularVelocity -= body.vx * 0.001;
  } else if (body.y > maxY) {
    body.y = maxY;
    body.vy = -Math.abs(body.vy) * body.restitution;
    body.angularVelocity -= body.vx * 0.001;
  }
}

// Update physics
export function updatePhysics(body: RigidBody, dt: number): void {
  if (body.isDragging) return;
  
  // Apply stronger damping for less "air hockey" feel
  const damping = 0.97; // Increased for more sliding
  const angularDamping = 0.97; // Increased for more rotation sliding
  
  // No restoring force for rotation - phone rotates purely based on physics from movement
  // Rotation is not magnetically pulled back to upright
  
  body.vx *= damping;
  body.vy *= damping;
  body.angularVelocity *= angularDamping;
  
  // Stop if moving very slowly
  if (Math.abs(body.vx) < 0.1) body.vx = 0; // Reduced threshold for longer sliding
  if (Math.abs(body.vy) < 0.1) body.vy = 0; // Reduced threshold for longer sliding
  if (Math.abs(body.angularVelocity) < 0.005) body.angularVelocity = 0; // Reduced threshold for longer rotation sliding
  
  // Update position and rotation
  body.x += body.vx * dt;
  body.y += body.vy * dt;
  body.rotation += body.angularVelocity * dt;
  
  // Normalize rotation
  while (body.rotation > Math.PI) body.rotation -= Math.PI * 2;
  while (body.rotation < -Math.PI) body.rotation += Math.PI * 2;
}