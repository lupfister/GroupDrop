import React, { useState, useRef, useEffect } from "react";
import svgPathsPhone from "../imports/svg-xt55a23x92";
import svgPaths from "../imports/svg-z15fdg36cs";
import imgBezel from "figma:asset/898d6b6326c8696cb62d35eae092fcdb03f4c874.png";
import imgContainer from "figma:asset/a5317ca03420503f743ecd3c4362839a25200ed5.png";
import imgContainer1 from "figma:asset/657112b8561c538adb09c89e9ac53d95cfa5fa37.png";
import imgContainer2 from "figma:asset/327cad5e9939300065ed59e7f94891c19e10157e.png";
import { ProximityData } from "./DraggablePhone";
import { RigidBody } from "../utils/physics";
import HomeScreenIPhone from "../imports/HomeScreenIPhone";
import HomeIndicator from "../imports/HomeIndicator";
import { BackButton } from "./GroupScreen";
import { GroupsHistory } from "./GroupsHistory";

interface ConfirmedGroup {
  id: string;
  memberIds: Set<number>;
}

interface PotentialGroup {
  id: string;
  memberIds: Set<number>;
  confirmedIds: Set<number>;
  representativePhoneId?: number; // Phone ID that is representing an existing group (for debugging)
  representativeGroupId?: string; // Group ID that this potential group represents (for debugging)
  isNew?: boolean; // True if this is a new unique combination that hasn't been seen before
}

interface PhoneWithProximityProps {
  body: RigidBody;
  proximityData: ProximityData[];
  tool: 'move' | 'interact';
  allBodies: RigidBody[]; // Added to map phoneId to profile images
  onConfirm?: (phoneId: number) => void; // Callback when user confirms
  onUnconfirm?: (phoneId: number) => void; // Callback when user cancels confirmation
  confirmedPhones?: Set<number>; // Set of confirmed phone IDs
  groupSearchOpenPhones?: Set<number>; // Phones currently in GroupSearch state
  onGroupSearchStateChange?: (phoneId: number, isInGroupSearch: boolean) => void;
  confirmedGroups?: Map<string, ConfirmedGroup>; // Confirmed groups to get all members when group is confirmed
  potentialGroups?: Map<string, PotentialGroup>; // Potential groups to get unconfirmed members
  onStateChange?: (viewState: 'homeScreen' | 'groupSearch' | 'groupConfirm' | 'groupsHistory', swipeOffset: number) => void;
  onRemoveUser?: (removerPhoneId: number, targetPhoneId: number) => void; // Callback to remove a user from potential group
  isRecentlyRemoved?: boolean; // Flag to suppress notifications for recently removed users
  recentlyRemovedPhones?: Set<number>; // Set of recently removed phone IDs to filter out from display
  onSetRepresentative?: (phoneId: number, groupId: string) => void; // Callback when phone becomes representative of a group
  currentRepresentativeGroupId?: string | null; // Currently selected representative group ID
  onRepresentativeGroupChange?: (phoneId: number, groupId: string | null) => void; // Callback when representative group changes
}

function Container() {
  return <div className="absolute bg-black h-[4.133px] left-[100.11px] rounded-[82.8px] top-[664.53px] w-[110.945px]" data-name="Container" />;
}

function DynamicIslandSpacer() {
  return <div className="absolute h-[8.273px] left-[103.91px] top-[4.97px] w-[102.656px]" data-name="DynamicIslandSpacer" />;
}

function Time() {
  return (
    <div className="absolute h-[18.211px] left-[41px] top-0 w-[30.188px]" data-name="Time">
      <p className="absolute font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[18.214px] left-[15.5px] text-[14.075px] text-center text-nowrap text-white top-[0.5px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        9:41
      </p>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[10.117px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[7.98%] left-0 right-[0.65%] top-0" data-name="Cellular Connection">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 10">
          <path clipRule="evenodd" d={svgPathsPhone.p3a3b3180} fill="var(--fill-0, white)" fillRule="evenodd" id="Cellular Connection" />
        </svg>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[10.117px] items-start left-[15.67px] top-[0.32px] w-[15.891px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[10.203px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[7.21%] left-0 right-[5.39%] top-0" data-name="Wifi">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 10">
          <path clipRule="evenodd" d={svgPathsPhone.p3a610b80} fill="var(--fill-0, white)" fillRule="evenodd" id="Wifi" />
        </svg>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col h-[10.203px] items-start left-[37.35px] top-[0.27px] w-[14.188px]" data-name="Container">
      <Icon1 />
    </div>
  );
}

function Battery() {
  return (
    <div className="absolute contents inset-[3.76%_1.62%_5.92%_1.8%]" data-name="Battery">
      <div className="absolute inset-[3.76%_11.81%_5.92%_1.8%]" data-name="Border">
        <div className="absolute inset-[-4.18%_-2.08%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11">
            <path d={svgPathsPhone.p1caeca00} id="Border" opacity="0.35" stroke="var(--stroke-0, white)" strokeWidth="0.812051" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[35.98%_1.62%_33.34%_93.59%]" data-name="Cap">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 4">
          <path d={svgPathsPhone.p8622700} fill="var(--fill-0, white)" id="Cap" opacity="0.4" />
        </svg>
      </div>
      <div className="absolute inset-[15.05%_17.21%_17.21%_7.2%]" data-name="Capacity">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 8">
          <path d={svgPathsPhone.p26eb7e40} fill="var(--fill-0, white)" id="Capacity" />
        </svg>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[10.758px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Battery />
    </div>
  );
}

function Battery1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[10.758px] items-start left-[57.33px] top-0 w-[22.625px]" data-name="Battery">
      <Icon2 />
    </div>
  );
}

function Levels() {
  return (
    <div className="absolute h-[10.758px] left-[206.56px] top-[3.73px] w-[103.906px]" data-name="Levels">
      <Container1 />
      <Container2 />
      <Battery1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute h-[18.211px] left-[-0.66px] top-[19px] w-[310.469px]" data-name="Frame">
      <DynamicIslandSpacer />
      <Time />
      <Levels />
    </div>
  );
}

function Screen({
  body,
  proximityData,
  tool,
  allBodies,
  onConfirm,
  onUnconfirm,
  confirmedPhones,
  groupSearchOpenPhones,
  onGroupSearchStateChange,
  confirmedGroups,
  potentialGroups,
  onStateChange,
  onRemoveUser,
  isRecentlyRemoved,
  recentlyRemovedPhones,
  onSetRepresentative,
  currentRepresentativeGroupId,
  onRepresentativeGroupChange,
}: {
  body: RigidBody;
  proximityData: ProximityData[];
  tool: 'move' | 'interact';
  allBodies: RigidBody[];
  onConfirm?: (phoneId: number) => void;
  onUnconfirm?: (phoneId: number) => void;
  confirmedPhones?: Set<number>;
  groupSearchOpenPhones?: Set<number>;
  onGroupSearchStateChange?: (phoneId: number, isInGroupSearch: boolean) => void;
  confirmedGroups?: Map<string, ConfirmedGroup>;
  potentialGroups?: Map<string, PotentialGroup>;
  onStateChange?: (viewState: 'homeScreen' | 'groupSearch' | 'groupConfirm' | 'groupsHistory', swipeOffset: number) => void;
  onRemoveUser?: (removerPhoneId: number, targetPhoneId: number) => void;
  isRecentlyRemoved?: boolean;
  recentlyRemovedPhones?: Set<number>;
  onSetRepresentative?: (phoneId: number, groupId: string) => void;
  currentRepresentativeGroupId?: string | null;
  onRepresentativeGroupChange?: (phoneId: number, groupId: string | null) => void;
}) {
  // Proximity thresholds
  const PROXIMITY_THRESHOLD_CM = 8.5;
  const INDIRECT_PROXIMITY_THRESHOLD_CM = PROXIMITY_THRESHOLD_CM * 2; // Allow indirect phones up to 2x the direct threshold
  
  // Helper function to check if proximity data should be shown
  // Direct phones: <= 8.5cm, Indirect phones: <= 17cm
  const isWithinProximityRange = (data: ProximityData): boolean => {
    if (data.isIndirect) {
      return data.distanceCm <= INDIRECT_PROXIMITY_THRESHOLD_CM;
    }
    return data.distanceCm <= PROXIMITY_THRESHOLD_CM;
  };
  
  // homeScreen  -> zero state
  // groupSearch -> opened notification / scanning state
  // groupConfirm -> confirmation / group screen state
  // groupsHistory -> view all groups user has been in
  const [viewState, setViewState] = useState<'homeScreen' | 'groupSearch' | 'groupConfirm' | 'groupsHistory'>('homeScreen');
  // Track which group's screen is currently being viewed (each group has its own unique screen)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  // Store member IDs of the active potential group to detect transition to confirmed
  const activePotentialGroupMembersRef = useRef<Set<number> | null>(null);
  const swipeStartRef = useRef<{ y: number; time: number; x: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const currentSwipeDistanceRef = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [confirmSwipeOffset, setConfirmSwipeOffset] = useState(0);
  const [isConfirmSwiping, setIsConfirmSwiping] = useState(false);
  const [isRepresentativeDropdownOpen, setIsRepresentativeDropdownOpen] = useState(false);
  const representativeDropdownRef = useRef<HTMLDivElement>(null);
  const springCurve = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const springDuration = '0.45s';
  const enterDuration = '0.3s'; // Faster for entering
  const exitDuration = '0.4s'; // Slower for exiting to make it smoother
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (representativeDropdownRef.current && !representativeDropdownRef.current.contains(event.target as Node)) {
        setIsRepresentativeDropdownOpen(false);
      }
    };
    
    if (isRepresentativeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isRepresentativeDropdownOpen]);
  
  // Swipe-to-remove state
  const [swipedUser, setSwipedUser] = useState<number | null>(null);
  const [swipeRemoveOffset, setSwipeRemoveOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const swipeRemoveStartRef = useRef<{ x: number; y: number; targetUserId: number } | null>(null);
  const currentSwipeRemoveDistanceRef = useRef(0);
  
  // Track previous proximity phoneIds to detect enter/exit animations
  const previousProximityPhoneIdsRef = useRef<Set<number>>(new Set());
  const [exitingPhoneIds, setExitingPhoneIds] = useState<Set<number>>(new Set());
  const [enteringPhoneIds, setEnteringPhoneIds] = useState<Set<number>>(new Set());
  // Store last known proximity data for exiting users so we can animate them out
  const lastProximityDataRef = useRef<Map<number, ProximityData>>(new Map());
  // Track which exiting users should actually animate (after initial render at scale 1)
  const [exitingAnimatingIds, setExitingAnimatingIds] = useState<Set<number>>(new Set());
  // Track which entering users should animate from 0 to 1 (after initial render at scale 0)
  const [enteringAnimatingIds, setEnteringAnimatingIds] = useState<Set<number>>(new Set());

  const updateViewState = (nextState: 'homeScreen' | 'groupSearch' | 'groupConfirm' | 'groupsHistory', groupId?: string | null) => {
    setViewState(nextState);
    // Update active group ID when entering a group screen
    if (nextState === 'groupConfirm') {
      // Always update activeGroupId for groupConfirm - set to groupId if provided, otherwise clear to null
      setActiveGroupId(groupId || null);
    } else if (nextState === 'homeScreen' || nextState === 'groupsHistory') {
      // Clear active group when going home or viewing history (allows forming new groups)
      setActiveGroupId(null);
    } else if (nextState === 'groupSearch') {
      // Always update activeGroupId for groupSearch - set to groupId if provided, otherwise clear to null
      setActiveGroupId(groupId || null);
    }
    if (onGroupSearchStateChange) {
      onGroupSearchStateChange(body.id, nextState === 'groupSearch');
    }
    // Notify parent of state changes
    if (onStateChange) {
      onStateChange(nextState, swipeOffset);
    }
  };

  // Notify parent when swipeOffset changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(viewState, swipeOffset);
    }
  }, [swipeOffset, viewState, onStateChange]);
  
  // Track entering/exiting users for animation
  useEffect(() => {
    const currentPhoneIds = new Set(
      proximityData
        .filter(data => isWithinProximityRange(data))
        .map(data => data.phoneId)
    );
    
    const previousPhoneIds = previousProximityPhoneIdsRef.current;
    
    // Store current proximity data for all users (so we can use it for exiting users)
    proximityData
      .filter(data => isWithinProximityRange(data))
      .forEach(data => {
        lastProximityDataRef.current.set(data.phoneId, data);
      });
    
    // Find entering users (in current, not in previous)
    const entering = new Set<number>();
    currentPhoneIds.forEach(phoneId => {
      if (!previousPhoneIds.has(phoneId)) {
        entering.add(phoneId);
      }
    });
    
    // Find exiting users (were in previous, not in current)
    const exiting = new Set<number>();
    previousPhoneIds.forEach(phoneId => {
      if (!currentPhoneIds.has(phoneId)) {
        exiting.add(phoneId);
      }
    });
    
    // Update entering state - trigger animation immediately (no delay)
    if (entering.size > 0) {
      // Add to entering state immediately
      setEnteringPhoneIds(prev => {
        const updated = new Set(prev);
        entering.forEach(id => updated.add(id));
        return updated;
      });
      // Start animation after element is rendered at scale 0 (use double RAF for immediate start)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnteringAnimatingIds(prev => {
            const updated = new Set(prev);
            entering.forEach(id => updated.add(id));
            return updated;
          });
        });
      });
      // Clear entering state after animation completes (scale from 0 to 1)
      setTimeout(() => {
        setEnteringPhoneIds(prev => {
          const updated = new Set(prev);
          entering.forEach(id => updated.delete(id));
          return updated;
        });
        setEnteringAnimatingIds(prev => {
          const updated = new Set(prev);
          entering.forEach(id => updated.delete(id));
          return updated;
        });
      }, 300); // Match enterDuration (300ms)
    }
    
    // Update exiting state
    if (exiting.size > 0) {
      setExitingPhoneIds(exiting);
      // Start exit animation after a brief delay to ensure element is rendered at scale 1 first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setExitingAnimatingIds(prev => {
            const updated = new Set(prev);
            exiting.forEach(id => updated.add(id));
            return updated;
          });
        });
      });
      // Clear exiting state and remove last proximity data after animation completes
      setTimeout(() => {
        setExitingPhoneIds(prev => {
          const updated = new Set(prev);
          exiting.forEach(id => {
            updated.delete(id);
            lastProximityDataRef.current.delete(id);
          });
          return updated;
        });
        setExitingAnimatingIds(prev => {
          const updated = new Set(prev);
          exiting.forEach(id => updated.delete(id));
          return updated;
        });
      }, 400); // Match exitDuration (400ms)
    }
    
    // Update previous ref
    previousProximityPhoneIdsRef.current = currentPhoneIds;
  }, [proximityData]);
  
  
  // Check if any phones are within proximity range (direct or indirect)
  // Suppress notifications if this user was recently removed
  const hasNearbyPhones = proximityData.some(data => isWithinProximityRange(data));
  const showProximityView = hasNearbyPhones && viewState === 'groupSearch';
  // showNotification will be calculated later after group variables are defined
  let showNotification = false;
  
  // Handle message icon click to open groups history
  const handleMessageIconClick = () => {
    if (tool !== 'interact') return; // Prevent clicks in move mode
    
    const navigateToGroupsHistory = () => {
      updateViewState('groupsHistory');
    };
    
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(navigateToGroupsHistory);
    } else {
      navigateToGroupsHistory();
    }
  };
  const swipeProgress = (viewState === 'groupSearch' || viewState === 'groupConfirm' || viewState === 'groupsHistory') ? Math.min(swipeOffset / 180, 1) : 0;
  const swipeTranslation = (viewState === 'groupSearch' || viewState === 'groupConfirm' || viewState === 'groupsHistory') 
    ? -Math.min(swipeOffset, 240) * 0.35 
    : 0;
  const proximityBorderRadius = viewState === 'homeScreen' ? '36px' : `${38 - swipeProgress * 10}px`;
  const confirmMaxVisualOffset = 140;
  const confirmSwipeProgress = Math.min(confirmSwipeOffset / confirmMaxVisualOffset, 1);
  const confirmCircleScale = 1 - confirmSwipeProgress * 0.18; // subtle shrink for gray circle container
  
  // Handle notification click to expand to full view
  const handleNotificationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Expanding notification to full view');
    
    // Open GroupSearch state - use potential group ID if available
    const currentPotentialGroup = potentialGroups 
      ? Array.from(potentialGroups.values()).find(group => group.memberIds.has(body.id))
      : undefined;
    updateViewState('groupSearch', currentPotentialGroup?.id || null);
  };
  
  // Handle swipe up gesture on home bar - use global mouse tracking
  const handleSwipeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isTransitioning) return;
    e.stopPropagation();
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    swipeStartRef.current = { y: clientY, time: Date.now(), x: clientX };
    setSwipeOffset(0);
    currentSwipeDistanceRef.current = 0;
    setIsSwiping(true);
    console.log('🟢 SWIPE STARTED at X:', clientX, 'Y:', clientY);
    
    // Add global listeners for mouse move and up
    if ('touches' in e) {
      window.addEventListener('touchmove', handleGlobalMove as any);
      window.addEventListener('touchend', handleGlobalEnd as any);
    } else {
      window.addEventListener('mousemove', handleGlobalMove as any);
      window.addEventListener('mouseup', handleGlobalEnd as any);
    }
  };
  
  const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
    if (!swipeStartRef.current || isTransitioning) return;
    
    e.stopPropagation();
    e.preventDefault();
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    
    // Calculate screen-space delta
    const screenDeltaX = clientX - swipeStartRef.current.x;
    const screenDeltaY = clientY - swipeStartRef.current.y;
    
    // Transform delta to phone-local space using phone's rotation
    const rotation = body.rotation;
    const cos = Math.cos(-rotation); // Negative because we're transforming FROM screen TO phone
    const sin = Math.sin(-rotation);
    
    // Rotate the delta vector
    const localDeltaX = screenDeltaX * cos - screenDeltaY * sin;
    const localDeltaY = screenDeltaX * sin + screenDeltaY * cos;
    
    // In phone-local space, "up" is negative Y
    const swipeUpDistance = -localDeltaY; // Positive = swipe up in phone space
    
    // Update offset for visual feedback
    if (swipeUpDistance > 0) {
      const newOffset = Math.min(swipeUpDistance, 676);
      setSwipeOffset(newOffset);
      currentSwipeDistanceRef.current = swipeUpDistance;
    }
  };
  
  const handleGlobalEnd = (e: MouseEvent | TouchEvent) => {
    if (isTransitioning) return;
    e.stopPropagation();
    e.preventDefault();
    
    // Remove global listeners
    window.removeEventListener('mousemove', handleGlobalMove as any);
    window.removeEventListener('mouseup', handleGlobalEnd as any);
    window.removeEventListener('touchmove', handleGlobalMove as any);
    window.removeEventListener('touchend', handleGlobalEnd as any);
    
    const finalSwipeDistance = currentSwipeDistanceRef.current;
    console.log('🔴 SWIPE ENDED. Final distance:', finalSwipeDistance.toFixed(0), 'px');
    
    // If swiped up past 150px threshold, morph to notification state
    if (finalSwipeDistance > 150) {
      console.log('✅ THRESHOLD MET! Morphing to notification state...');
      setIsTransitioning(true);
      
      const goToNotification = () => {
        // Only unconfirm if not in a confirmed group (can't leave confirmed groups)
        // Find which confirmed group this phone belongs to (if any)
        const phoneConfirmedGroup = confirmedGroups 
          ? Array.from(confirmedGroups.values()).find(group => group.memberIds.has(body.id))
          : undefined;
        
        // Only unconfirm if we're leaving GroupSearch view and not in a confirmed group
        if (viewState === 'groupSearch' && !phoneConfirmedGroup && onUnconfirm) {
          onUnconfirm(body.id);
        }
        // If in groupConfirm, groupsHistory view or in a confirmed group, don't unconfirm - just go home
        updateViewState('homeScreen');
        setSwipeOffset(0);
        setIsTransitioning(false);
      };
      
      if ('startViewTransition' in document) {
        (document as any).startViewTransition(goToNotification);
      } else {
        goToNotification();
      }
    } else {
      // Bounce back if not enough swipe
      console.log('❌ Only swiped', finalSwipeDistance.toFixed(0), 'px (need >150px). Bouncing back.');
      setSwipeOffset(0);
    }
    
    swipeStartRef.current = null;
    currentSwipeDistanceRef.current = 0;
    setIsSwiping(false);
  };
  
  // Handle swipe on "Swipe to Confirm" area to go to group screen
  const confirmSwipeStartRef = useRef<{ y: number; time: number; x: number } | null>(null);
  const currentConfirmSwipeDistanceRef = useRef(0);
  
  const handleConfirmSwipeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isTransitioning) return;
    e.stopPropagation();
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    confirmSwipeStartRef.current = { y: clientY, time: Date.now(), x: clientX };
    currentConfirmSwipeDistanceRef.current = 0;
    setConfirmSwipeOffset(0);
    setIsConfirmSwiping(true);
    console.log('🟢 CONFIRM SWIPE STARTED at X:', clientX, 'Y:', clientY);
    
    // Add global listeners
    if ('touches' in e) {
      window.addEventListener('touchmove', handleConfirmGlobalMove as any);
      window.addEventListener('touchend', handleConfirmGlobalEnd as any);
    } else {
      window.addEventListener('mousemove', handleConfirmGlobalMove as any);
      window.addEventListener('mouseup', handleConfirmGlobalEnd as any);
    }
  };
  
  const handleConfirmGlobalMove = (e: MouseEvent | TouchEvent) => {
    if (!confirmSwipeStartRef.current || isTransitioning) return;
    
    e.stopPropagation();
    e.preventDefault();
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    
    // Calculate screen-space delta
    const screenDeltaX = clientX - confirmSwipeStartRef.current.x;
    const screenDeltaY = clientY - confirmSwipeStartRef.current.y;
    
    // Transform delta to phone-local space using phone's rotation
    const rotation = body.rotation;
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    
    // Rotate the delta vector
    const localDeltaX = screenDeltaX * cos - screenDeltaY * sin;
    const localDeltaY = screenDeltaX * sin + screenDeltaY * cos;
    
    // In phone-local space, "up" is negative Y
    const swipeUpDistance = -localDeltaY;
    
    // Track swipe distance for threshold detection
    currentConfirmSwipeDistanceRef.current = swipeUpDistance;
    
    // Update visual offset for "Swipe up to confirm" guidance
    if (swipeUpDistance > 0) {
      const maxVisualOffset = 140;
      const newOffset = Math.min(swipeUpDistance, maxVisualOffset);
      setConfirmSwipeOffset(newOffset);
    } else {
      // Allow dragging back down to naturally follow the finger
      setConfirmSwipeOffset(0);
    }
  };
  
  const handleConfirmGlobalEnd = (e: MouseEvent | TouchEvent) => {
    if (isTransitioning) return;
    e.stopPropagation();
    e.preventDefault();
    
    // Remove global listeners
    window.removeEventListener('mousemove', handleConfirmGlobalMove as any);
    window.removeEventListener('mouseup', handleConfirmGlobalEnd as any);
    window.removeEventListener('touchmove', handleConfirmGlobalMove as any);
    window.removeEventListener('touchend', handleConfirmGlobalEnd as any);
    
    const finalSwipeDistance = currentConfirmSwipeDistanceRef.current;
    console.log('🔴 CONFIRM SWIPE ENDED. Final distance:', finalSwipeDistance.toFixed(0), 'px');
    
    // If swiped up past 150px threshold, transition to GroupConfirm screen
    if (finalSwipeDistance > 150) {
      console.log('✅ CONFIRM THRESHOLD MET! Marking as confirmed and transitioning to GroupConfirm...');
      setIsTransitioning(true);
      
      // Mark this phone as confirmed
      if (onConfirm) {
        onConfirm(body.id);
      }
      
      // Transition to GroupConfirm state - use potential group ID (the group being confirmed)
      const currentPotentialGroup = potentialGroups 
        ? Array.from(potentialGroups.values()).find(group => group.memberIds.has(body.id))
        : undefined;
      updateViewState('groupConfirm', currentPotentialGroup?.id || null);
      setIsTransitioning(false);
      
      // Reset visual offset once transition is done
      setConfirmSwipeOffset(0);
    }
    
    // If threshold is not met, ease the swipe indicator back down
    if (finalSwipeDistance <= 150) {
      setConfirmSwipeOffset(0);
    }
    
    confirmSwipeStartRef.current = null;
    currentConfirmSwipeDistanceRef.current = 0;
    setIsConfirmSwiping(false);
  };
  
  // Handle swipe-to-remove gesture on user icons
  const handleUserSwipeStart = (e: React.MouseEvent | React.TouchEvent, targetUserId: number) => {
    // Only allow on "swipe to confirm" screen (groupSearch view)
    if (isTransitioning || tool !== 'interact' || viewState !== 'groupSearch') return;
    // Don't allow removing yourself
    if (targetUserId === body.id) return;
    // Don't allow removing confirmed users
    if (confirmedPhones?.has(targetUserId)) return;
    
    e.stopPropagation();
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    swipeRemoveStartRef.current = { x: clientX, y: clientY, targetUserId };
    setSwipedUser(targetUserId);
    setSwipeRemoveOffset({ x: 0, y: 0 });
    currentSwipeRemoveDistanceRef.current = 0;
    
    // Add global listeners
    if ('touches' in e) {
      window.addEventListener('touchmove', handleUserSwipeMove as any);
      window.addEventListener('touchend', handleUserSwipeEnd as any);
    } else {
      window.addEventListener('mousemove', handleUserSwipeMove as any);
      window.addEventListener('mouseup', handleUserSwipeEnd as any);
    }
  };
  
  const handleUserSwipeMove = (e: MouseEvent | TouchEvent) => {
    if (!swipeRemoveStartRef.current || isTransitioning) return;
    
    e.stopPropagation();
    e.preventDefault();
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    
    // Calculate screen-space delta
    const screenDeltaX = clientX - swipeRemoveStartRef.current.x;
    const screenDeltaY = clientY - swipeRemoveStartRef.current.y;
    
    // Transform delta to phone-local space using phone's rotation
    const rotation = body.rotation;
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    
    // Rotate the delta vector
    const localDeltaX = screenDeltaX * cos - screenDeltaY * sin;
    const localDeltaY = screenDeltaX * sin + screenDeltaY * cos;
    
    // Update visual offset
    setSwipeRemoveOffset({ x: localDeltaX, y: localDeltaY });
    
    // Calculate distance for threshold
    const distance = Math.sqrt(localDeltaX * localDeltaX + localDeltaY * localDeltaY);
    currentSwipeRemoveDistanceRef.current = distance;
  };
  
  const handleUserSwipeEnd = (e: MouseEvent | TouchEvent) => {
    if (isTransitioning) return;
    e.stopPropagation();
    e.preventDefault();
    
    // Remove global listeners
    window.removeEventListener('mousemove', handleUserSwipeMove as any);
    window.removeEventListener('mouseup', handleUserSwipeEnd as any);
    window.removeEventListener('touchmove', handleUserSwipeMove as any);
    window.removeEventListener('touchend', handleUserSwipeEnd as any);
    
    const finalDistance = currentSwipeRemoveDistanceRef.current;
    const targetUserId = swipeRemoveStartRef.current?.targetUserId;
    
    // If swiped past 30px threshold, remove the user (reduced for easier removal within screen)
    if (finalDistance > 30 && targetUserId && onRemoveUser) {
      onRemoveUser(body.id, targetUserId);
    }
    
    // Reset state
    swipeRemoveStartRef.current = null;
    setSwipedUser(null);
    setSwipeRemoveOffset({ x: 0, y: 0 });
    currentSwipeRemoveDistanceRef.current = 0;
  };
  
  // Get nearby phones within range (including indirect/daisy-chained)
  // Filter out recently removed users to ensure they don't appear anywhere
  const nearbyPhones = proximityData
    .filter(data => isWithinProximityRange(data) && !recentlyRemovedPhones?.has(data.phoneId))
    .map(data => allBodies.find(b => b.id === data.phoneId))
    .filter((phone): phone is RigidBody => phone !== undefined);
  
  // Split into confirmed and unconfirmed
  const confirmedNearbyPhones = nearbyPhones.filter(phone => confirmedPhones?.has(phone.id));
  
  // Find which confirmed group this phone belongs to (if any) - check this first
  const phoneConfirmedGroup = confirmedGroups 
    ? Array.from(confirmedGroups.values()).find(group => group.memberIds.has(body.id))
    : undefined;
  
  // Find which potential group this phone belongs to (if any)
  // This should find the potential group that contains this phone OR corresponds to the confirmed group
  // The potential group will still exist as long as not all members have confirmed
  const phonePotentialGroup = potentialGroups 
    ? Array.from(potentialGroups.values()).find(group => {
        // First check: is this phone directly in the potential group?
        if (group.memberIds.has(body.id)) return true;
        
        // Second check: if we're in a confirmed group, find the potential group that contains all confirmed members
        // This is the same group, just with some members now confirmed
        if (phoneConfirmedGroup) {
          const potentialMemberIds = Array.from(group.memberIds);
          const confirmedMemberIds = Array.from(phoneConfirmedGroup.memberIds);
          // If all confirmed members are in this potential group, it's the same group
          // (the potential group should have the same or more members)
          return confirmedMemberIds.every(id => potentialMemberIds.includes(id));
        }
        
        return false;
      })
    : undefined;
  
  // Priority logic: Each group has its own unique screen instance
  // 1. If viewing a specific confirmed group's screen (activeGroupId matches): lock to that confirmed group view
  // 2. If viewing a specific potential group's screen (activeGroupId matches): show that potential group view
  // 3. If in a potential group that phone has confirmed in (and not viewing another group): show potential group state
  // 4. Otherwise, if in a confirmed group (and not viewing another group): show confirmed group state
  // 5. Otherwise: use proximity-based state
  
  // Find which confirmed group matches the active group ID being viewed
  // IMPORTANT: Search directly by activeGroupId, not via phoneConfirmedGroup
  // This ensures we get the correct group even if the phone is in multiple groups
  const activeConfirmedGroup = activeGroupId && confirmedGroups
    ? confirmedGroups.get(activeGroupId) || null
    : null;
  
  // Find which potential group matches the active group ID being viewed
  // IMPORTANT: Search directly by activeGroupId, not via phonePotentialGroup
  // This ensures we get the correct group even if the phone is in multiple groups
  const activePotentialGroup = activeGroupId && potentialGroups
    ? potentialGroups.get(activeGroupId) || null
    : null;

  // Store member IDs when viewing a potential group (for Bug 2 fix)
  useEffect(() => {
    if (activePotentialGroup) {
      // Store member IDs when actively viewing a potential group
      activePotentialGroupMembersRef.current = new Set(activePotentialGroup.memberIds);
    } else if (activeGroupId && activeGroupId.startsWith('potential-')) {
      // We're viewing a potential group by ID, but it's not in the potentialGroups map anymore
      // Keep the stored members so we can find the matching confirmed group
      // Don't clear here - let the transition useEffect handle it after finding the confirmed group
    } else if (!activeGroupId || !activeGroupId.startsWith('potential-')) {
      // Not viewing a potential group (or viewing a confirmed group) - clear stored members
      activePotentialGroupMembersRef.current = null;
    }
  }, [activePotentialGroup, activeGroupId]);
  
  // Check if currently viewing a specific group's screen
  const isViewingSpecificGroup = activeGroupId !== null;
  const isViewingConfirmedGroupScreen = isViewingSpecificGroup && activeConfirmedGroup !== null;
  const isViewingPotentialGroupScreen = isViewingSpecificGroup && activePotentialGroup !== null;
  
  // Calculate if there are new potential group members (phones not already in current group)
  const hasNewPotentialGroupMembers = (() => {
    if (!hasNearbyPhones) return false;
    
    // Get all nearby phone IDs (including indirect/daisy-chained)
    const nearbyPhoneIds = new Set(
      proximityData
        .filter(data => isWithinProximityRange(data) && !recentlyRemovedPhones?.has(data.phoneId))
        .map(data => data.phoneId)
    );
    
    // Special case: If viewing a confirmed group screen, check if nearby phones form a NEW potential group
    // (i.e., phones that are NOT in the current confirmed group being viewed)
    if (isViewingConfirmedGroupScreen && activeConfirmedGroup) {
      // Check if any nearby phones are NOT in the active confirmed group
      // This indicates a new potential group is forming
      return Array.from(nearbyPhoneIds).some(phoneId => !activeConfirmedGroup.memberIds.has(phoneId));
    }
    
    // If viewing a specific potential group, check if any nearby phones are NOT in that group
    if (isViewingPotentialGroupScreen && activePotentialGroup) {
      // Check if any nearby phones are not in the potential group
      return Array.from(nearbyPhoneIds).some(phoneId => !activePotentialGroup.memberIds.has(phoneId));
    }
    
    // If not viewing a specific group, check if any nearby phones are not already in any potential group this phone is part of
    if (phonePotentialGroup) {
      return Array.from(nearbyPhoneIds).some(phoneId => !phonePotentialGroup.memberIds.has(phoneId));
    }
    
    // If in a confirmed group (but not viewing that group's screen), check if any nearby phones are NOT in that confirmed group
    if (phoneConfirmedGroup) {
      // Check if any nearby phones are not in the confirmed group
      // If all nearby phones are already in the confirmed group, don't show notification
      return Array.from(nearbyPhoneIds).some(phoneId => !phoneConfirmedGroup.memberIds.has(phoneId));
    }
    
    // If no current group, any nearby phone is a new potential member
    return nearbyPhoneIds.size > 0;
  })();
  
  // Check if phone has confirmed in a potential group (new group being formed)
  const hasConfirmedInPotentialGroup = phonePotentialGroup && phonePotentialGroup.confirmedIds.has(body.id);
  
  // Check if there are new potential groups (different from the current one being confirmed)
  // A new potential group is one that:
  // 1. Contains this phone and is marked as a new unique combination (isNew: true), OR
  // 2. Contains this phone but is different from phonePotentialGroup, OR
  // 3. Contains phones that are NOT in the current potential/confirmed group
  const hasNewPotentialGroups = (() => {
    if (!potentialGroups || potentialGroups.size === 0) {
      return false;
    }
    
    // First, check if there are any groups marked as new (new unique combination) that contain this phone
    for (const [groupId, potentialGroup] of potentialGroups) {
      if (potentialGroup.isNew && potentialGroup.memberIds.has(body.id)) {
        return true; // This is a new unique combination - show notification
      }
    }
    
    // If phone is in a potential group, check for other potential groups
    if (phonePotentialGroup) {
      const currentGroupMemberIds = phonePotentialGroup.memberIds;
      
      // Check if there are other potential groups that are different from the current one
      for (const [groupId, potentialGroup] of potentialGroups) {
        // Skip the current potential group
        if (groupId === phonePotentialGroup.id) {
          continue;
        }
        
        // Check if this group contains this phone (different group with this phone)
        if (potentialGroup.memberIds.has(body.id)) {
          return true;
        }
        
        // Check if this group contains phones that are NOT in the current group
        // This indicates a new potential group forming nearby
        const hasNewMembers = Array.from(potentialGroup.memberIds).some(
          id => !currentGroupMemberIds.has(id)
        );
        
        if (hasNewMembers) {
          // Check if any of those new members are actually nearby (in proximity)
          const newMemberIds = Array.from(potentialGroup.memberIds).filter(
            id => !currentGroupMemberIds.has(id)
          );
          const nearbyPhoneIds = new Set(proximityData
            .filter(data => isWithinProximityRange(data))
            .map(data => data.phoneId)
          );
          
          const hasNearbyNewMembers = newMemberIds.some(id => nearbyPhoneIds.has(id));
          if (hasNearbyNewMembers) {
            return true;
          }
        }
      }
    }
    
    // If phone is in a confirmed group but NOT in a potential group, check for any potential groups
    // that contain phones not in the confirmed group
    if (phoneConfirmedGroup && !phonePotentialGroup) {
      const confirmedGroupMemberIds = phoneConfirmedGroup.memberIds;
      
      for (const [groupId, potentialGroup] of potentialGroups) {
        // Check if this potential group contains phones that are NOT in the confirmed group
        const hasNewMembers = Array.from(potentialGroup.memberIds).some(
          id => !confirmedGroupMemberIds.has(id)
        );
        
        if (hasNewMembers) {
          // Check if any of those new members are actually nearby (in proximity)
          const newMemberIds = Array.from(potentialGroup.memberIds).filter(
            id => !confirmedGroupMemberIds.has(id)
          );
          const nearbyPhoneIds = new Set(proximityData
            .filter(data => isWithinProximityRange(data))
            .map(data => data.phoneId)
          );
          
          const hasNearbyNewMembers = newMemberIds.some(id => nearbyPhoneIds.has(id));
          if (hasNearbyNewMembers) {
            return true;
          }
        }
      }
    }
    
    return false;
  })();
  
  // Check if phone is in "confirmed but waiting for others" state
  // This happens when: phone has confirmed AND there are unconfirmed members waiting
  // We need to calculate unconfirmedNearbyPhones first to check this, but we'll do a quick check here
  const isWaitingForOthers = (() => {
    if (!hasConfirmedInPotentialGroup || !phonePotentialGroup) {
      return false;
    }
    
    // Quick check: are there any unconfirmed members in the current potential group?
    const unconfirmedCount = Array.from(phonePotentialGroup.memberIds).filter(
      id => !phonePotentialGroup.confirmedIds.has(id) && id !== body.id
    ).length;
    
    return unconfirmedCount > 0;
  })();
  
  // Update showNotification to show whenever phones are in proximity (not just new members)
  // BUT: Don't show if phone has confirmed and is waiting for others UNLESS there are new potential groups
  // Also: Don't show if phone is in a confirmed group (but not in a potential group) UNLESS there are new potential groups
  // This ensures the dynamic island is always expanded when phones are nearby, except when waiting or in confirmed groups
  const shouldShowNotificationBase = hasNearbyPhones && (viewState === 'homeScreen' || viewState === 'groupConfirm' || viewState === 'groupsHistory') && !isRecentlyRemoved;
  
  // Check if phone is in a confirmed group but NOT in a potential group
  const isInConfirmedGroupOnly = phoneConfirmedGroup && !phonePotentialGroup;
  
  // If waiting for others OR in confirmed group only, only show notification if there are new potential groups
  // This prevents the notification from showing when:
  // 1. Just waiting for others to confirm in a potential group
  // 2. In a confirmed group with no potential group activity
  // but allows it to show when there are new potential groups forming nearby
  showNotification = (isWaitingForOthers || isInConfirmedGroupOnly)
    ? hasNewPotentialGroups && shouldShowNotificationBase
    : shouldShowNotificationBase;
  
  // Get all confirmed phones: show based on which group's screen is active
  // IMPORTANT: For confirmed groups, always use locked-in members regardless of proximity
  const allConfirmedPhones = isViewingConfirmedGroupScreen
    ? Array.from(activeConfirmedGroup.memberIds)
        .map(id => allBodies.find(b => b.id === id))
        .filter((phone): phone is RigidBody => phone !== undefined)
    : isViewingPotentialGroupScreen
      ? Array.from(activePotentialGroup.memberIds)
          .filter(id => activePotentialGroup.confirmedIds.has(id))
          .map(id => allBodies.find(b => b.id === id))
          .filter((phone): phone is RigidBody => phone !== undefined)
      : hasConfirmedInPotentialGroup && !isViewingSpecificGroup
        ? Array.from(phonePotentialGroup.memberIds)
            .filter(id => phonePotentialGroup.confirmedIds.has(id))
            .map(id => allBodies.find(b => b.id === id))
            .filter((phone): phone is RigidBody => phone !== undefined)
        : phonePotentialGroup && !isViewingSpecificGroup
          ? Array.from(phonePotentialGroup.memberIds)
              .filter(id => phonePotentialGroup.confirmedIds.has(id))
              .map(id => allBodies.find(b => b.id === id))
              .filter((phone): phone is RigidBody => phone !== undefined)
          : phoneConfirmedGroup
            ? // If in a confirmed group, always use locked-in members (ignore proximity)
              Array.from(phoneConfirmedGroup.memberIds)
                .map(id => allBodies.find(b => b.id === id))
                .filter((phone): phone is RigidBody => phone !== undefined)
            : confirmedPhones?.has(body.id) 
              ? [body, ...confirmedNearbyPhones] 
              : confirmedNearbyPhones;
  
  // Filter out recently removed phones from allConfirmedPhones
  const allConfirmedPhonesFiltered = allConfirmedPhones.filter(phone => !recentlyRemovedPhones?.has(phone.id));
  
  // Get unconfirmed phones: ALWAYS show ALL unconfirmed members from the potential group
  // This should work regardless of whether we're in a potential group, confirmed group, or groupConfirm state
  // The key is to find the potential group that contains this phone or corresponds to the confirmed group
  // and show ALL unconfirmed members from it simultaneously
  // But also respect the viewing-specific-group logic from HEAD
  const unconfirmedNearbyPhones = (() => {
    // If viewing a confirmed group screen, there are no unconfirmed members
    // Confirmed groups are complete - all members have already confirmed
    // The screen is a snapshot and should not show updates from other groups
    if (isViewingConfirmedGroupScreen) {
      return [];
    }
    
    // Helper function to get all unconfirmed members from a potential group
    const getUnconfirmedFromGroup = (potentialGroup: PotentialGroup): RigidBody[] => {
      return Array.from(potentialGroup.memberIds)
        .filter(id => {
          // Include if: not confirmed, not this phone, not recently removed, and exists in allBodies
          return !potentialGroup.confirmedIds.has(id) && 
                 id !== body.id && 
                 !recentlyRemovedPhones?.has(id) &&
                 allBodies.some(b => b.id === id);
        })
        .map(id => allBodies.find(b => b.id === id))
        .filter((phone): phone is RigidBody => phone !== undefined);
    };
    
    // Strategy 1: If we found a potential group for this phone, use it directly
    if (phonePotentialGroup) {
      return getUnconfirmedFromGroup(phonePotentialGroup);
    }
    
    // Strategy 2: If we're in groupConfirm or groupSearch state, aggressively find the potential group
    // This ensures we show all unconfirmed members even if phonePotentialGroup wasn't found initially
    if ((viewState === 'groupConfirm' || viewState === 'groupSearch') && potentialGroups) {
      // First, try to find a potential group that contains this phone
      for (const [groupId, potentialGroup] of potentialGroups) {
        if (potentialGroup.memberIds.has(body.id)) {
          const unconfirmed = getUnconfirmedFromGroup(potentialGroup);
          if (unconfirmed.length > 0) {
            return unconfirmed;
          }
        }
      }
      
      // Second, if in a confirmed group, find the potential group that corresponds to it
      // The potential group should contain all the confirmed members (it's the same group before confirmation)
      if (phoneConfirmedGroup) {
        const confirmedMemberIds = Array.from(phoneConfirmedGroup.memberIds);
        
        for (const [groupId, potentialGroup] of potentialGroups) {
          const potentialMemberIds = Array.from(potentialGroup.memberIds);
          
          // Check if this potential group contains all confirmed members
          // This means it's the same group, just with some members now confirmed
          const containsAllConfirmed = confirmedMemberIds.every(id => potentialMemberIds.includes(id));
          
          if (containsAllConfirmed) {
            const unconfirmed = getUnconfirmedFromGroup(potentialGroup);
            if (unconfirmed.length > 0) {
              return unconfirmed;
            }
          }
        }
      }
    }
    
    // Strategy 3: If in a confirmed group (but not in groupConfirm/groupSearch), still try to find potential group
    if (phoneConfirmedGroup && potentialGroups) {
      const confirmedMemberIds = Array.from(phoneConfirmedGroup.memberIds);
      
      for (const [groupId, potentialGroup] of potentialGroups) {
        const potentialMemberIds = Array.from(potentialGroup.memberIds);
        
        // Check if this potential group contains all confirmed members
        const containsAllConfirmed = confirmedMemberIds.every(id => potentialMemberIds.includes(id));
        
        if (containsAllConfirmed) {
          const unconfirmed = getUnconfirmedFromGroup(potentialGroup);
          if (unconfirmed.length > 0) {
            return unconfirmed;
          }
        }
      }
    }
    
    // Last resort: use proximity-based unconfirmed phones (only if not in groupConfirm/groupSearch)
    // This should rarely be used since we should always have potential group data
    if (viewState !== 'groupConfirm' && viewState !== 'groupSearch') {
      return nearbyPhones.filter(phone => {
        const isConfirmed = confirmedPhones?.has(phone.id);
        const isInGroupSearch = groupSearchOpenPhones?.has(phone.id) ?? false;
        const isRemoved = recentlyRemovedPhones?.has(phone.id);
        return !isConfirmed && isInGroupSearch && !isRemoved;
      });
    }
    
    // If we couldn't find any unconfirmed members, return empty
    return [];
  })();
  
  // Show unified view if there are nearby phones OR if we're in groupConfirm/groupSearch state with a potential/confirmed group
  // But hide it completely if user was recently removed (they should be in zero state with no notification)
  // Explicitly check that isRecentlyRemoved is not true to ensure the notification overlay is completely removed
  // Always keep notification mounted in homeScreen so it can shrink to pill form
  const [notificationMounted, setNotificationMounted] = useState(true);
  const [notificationVisible, setNotificationVisible] = useState(showNotification);
  const notificationAnimDurationMs = 450; // matches springDuration

  useEffect(() => {
    // In non-home states, keep the surface mounted/visible so other views work
    if (viewState !== 'homeScreen') {
      setNotificationMounted(true);
      setNotificationVisible(true);
      return;
    }

    // In homeScreen, always keep mounted but control expansion state
    setNotificationMounted(true);
    if (showNotification) {
      // Expand to full notification
      requestAnimationFrame(() => setNotificationVisible(true));
    } else {
      // Shrink back to pill form (but stay visible)
      setNotificationVisible(false);
    }
  }, [showNotification, viewState]);

  const shouldShowUnifiedView = (isRecentlyRemoved !== true) && (
    (viewState === 'homeScreen' ? notificationMounted : hasNearbyPhones) ||
    phonePotentialGroup ||
    phoneConfirmedGroup ||
    (viewState === 'groupConfirm' && (phonePotentialGroup || phoneConfirmedGroup)) ||
    (viewState === 'groupSearch' && phonePotentialGroup)
  );
  const extraConfirmedPhones = allConfirmedPhonesFiltered.filter(phone => phone.id !== body.id);
  const unconfirmedPlaced: { x: number; y: number; r: number }[] = [];
  const notificationHeight = '140px';
  const isHomeNotification = viewState === 'homeScreen';
  const groupTitleTop = isHomeNotification ? 24 : 74;
  const groupTitleFontSize = isHomeNotification ? 18 : 28;
  // Dynamic Island dimensions (starting state)
  const dynamicIslandWidth = 100;
  const dynamicIslandHeight = 28;
  const dynamicIslandBorderRadius = 14;
  
  // Notification dimensions (expanded state)
  const notificationWidth = 290; // 312 - 11px left - 11px right
  const notificationFullHeight = 140;
  
  // Calculate animation values for homeScreen notification
  const notificationScale = viewState === 'homeScreen' 
    ? (notificationVisible ? 1 : 0) 
    : 1;
  
  const notificationWidthAnimated = viewState === 'homeScreen'
    ? dynamicIslandWidth + (notificationWidth - dynamicIslandWidth) * notificationScale
    : notificationWidth;
  
  const notificationHeightAnimated = viewState === 'homeScreen'
    ? dynamicIslandHeight + (notificationFullHeight - dynamicIslandHeight) * notificationScale
    : notificationFullHeight;
  
  const notificationBorderRadiusAnimated = viewState === 'homeScreen'
    ? dynamicIslandBorderRadius + (36 - dynamicIslandBorderRadius) * notificationScale
    : 36;
  
  // Center the Dynamic Island horizontally, then expand
  const notificationLeft = viewState === 'homeScreen'
    ? `${(312 - notificationWidthAnimated) / 2}px` // Center horizontally
    : '11px';
  
  const notificationTop = viewState === 'homeScreen'
    ? '12px' // Start at top
    : '12px';

  // Control visibility and exit animation of "Waiting for Others..." pill
  const [showUnconfirmedPill, setShowUnconfirmedPill] = useState(unconfirmedNearbyPhones.length > 0);
  const [isUnconfirmedExiting, setIsUnconfirmedExiting] = useState(false);
  const prevHasUnconfirmedRef = useRef(unconfirmedNearbyPhones.length > 0);

  useEffect(() => {
    const hasUnconfirmed = unconfirmedNearbyPhones.length > 0;
    const prevHasUnconfirmed = prevHasUnconfirmedRef.current;
    prevHasUnconfirmedRef.current = hasUnconfirmed;

    // If viewing a confirmed group screen, never show the pill (confirmed groups are complete)
    if (isViewingConfirmedGroupScreen) {
      setShowUnconfirmedPill(false);
      setIsUnconfirmedExiting(false);
      return;
    }

    // Outside groupConfirm, just follow presence (no special exit animation)
    if (viewState !== 'groupConfirm') {
      setShowUnconfirmedPill(hasUnconfirmed);
      setIsUnconfirmedExiting(false);
      return;
    }

    // While there are unconfirmed users, ensure pill is visible and in "enter" state
    if (hasUnconfirmed) {
      setShowUnconfirmedPill(true);
      setIsUnconfirmedExiting(false);
      return;
    }

    // Transitioned from some unconfirmed -> none while in groupConfirm: play reverse animation
    if (prevHasUnconfirmed && !hasUnconfirmed) {
      setIsUnconfirmedExiting(true);
      setShowUnconfirmedPill(true);

      const timeout = setTimeout(() => {
        setShowUnconfirmedPill(false);
        setIsUnconfirmedExiting(false);
      }, 450); // matches springDuration "0.45s"

      return () => clearTimeout(timeout);
    }
  }, [unconfirmedNearbyPhones.length, viewState, isViewingConfirmedGroupScreen]);

  // Bug 2 Fix: Update activeGroupId when a potential group transitions to confirmed
  // When a potential group becomes confirmed, it gets a new sequential ID (e.g., "potential-1" -> "1")
  // We need to update activeGroupId to match the new confirmed group ID
  useEffect(() => {
    // Only check if we're currently viewing a potential group (by ID pattern) and have stored member IDs
    if (!activeGroupId || !activeGroupId.startsWith('potential-') || !activePotentialGroupMembersRef.current) {
      return;
    }

    // Check if the potential group we're viewing still exists
    const potentialGroupStillExists = potentialGroups?.has(activeGroupId);
    
    // If the potential group no longer exists, it may have transitioned to confirmed
    if (!potentialGroupStillExists && confirmedGroups) {
      // Find a confirmed group with the same members as the potential group we were viewing
      const potentialGroupMembers = activePotentialGroupMembersRef.current;
      
      for (const [confirmedGroupId, confirmedGroup] of confirmedGroups.entries()) {
        // Check if members match (same size and all members present)
        if (
          confirmedGroup.memberIds.size === potentialGroupMembers.size &&
          Array.from(potentialGroupMembers).every(id => confirmedGroup.memberIds.has(id))
        ) {
          // Found matching confirmed group - update activeGroupId
          setActiveGroupId(confirmedGroupId);
          // Clear the stored member IDs since we've transitioned to confirmed
          activePotentialGroupMembersRef.current = null;
          break;
        }
      }
    }
  }, [activeGroupId, potentialGroups, confirmedGroups]);
  
  // Detect when phone is removed from a potential group and reset to home screen
  const prevInPotentialGroupRef = useRef(!!phonePotentialGroup);
  const prevHasNearbyPhonesRef = useRef(hasNearbyPhones);
  
  // Track previous isRecentlyRemoved to detect when it becomes true
  const prevIsRecentlyRemovedRef = useRef(isRecentlyRemoved);
  
  // Sync viewState with groupSearchOpenPhones - if removed from groupSearchOpenPhones, reset to homeScreen
  // This ensures that when a user is removed, their view state resets immediately
  const prevInGroupSearchRef = useRef(groupSearchOpenPhones?.has(body.id) ?? false);
  useEffect(() => {
    const isInGroupSearch = groupSearchOpenPhones?.has(body.id) ?? false;
    const wasInGroupSearch = prevInGroupSearchRef.current;
    prevInGroupSearchRef.current = isInGroupSearch;
    
    // Check if user has confirmed (is in confirmedPhones or has confirmed in potential group)
    const isConfirmed = confirmedPhones?.has(body.id) || phonePotentialGroup?.confirmedIds.has(body.id);
    
    // Don't reset viewState if user is in groupConfirm state and has confirmed
    // This prevents the swipe-to-confirm transition from being interrupted
    if (viewState === 'groupConfirm' && isConfirmed) {
      return;
    }
    
    // If user is removed from groupSearchOpenPhones and they're not in a confirmed group,
    // reset to home screen (unless they're already there)
    // This helps ensure the removed user returns to zero state immediately
    if (wasInGroupSearch && !isInGroupSearch && !phoneConfirmedGroup && viewState !== 'homeScreen') {
      // Only reset if we're not already at homeScreen
      if (viewState === 'groupSearch' || viewState === 'groupConfirm') {
        updateViewState('homeScreen');
      }
    }
  }, [groupSearchOpenPhones, phoneConfirmedGroup, viewState, body.id, confirmedPhones, phonePotentialGroup]);
  
  useEffect(() => {
    const wasInPotentialGroup = prevInPotentialGroupRef.current;
    const isInPotentialGroup = !!phonePotentialGroup;
    prevInPotentialGroupRef.current = isInPotentialGroup;
    
    // Check if user has confirmed (is in confirmedPhones or has confirmed in potential group)
    const isConfirmed = confirmedPhones?.has(body.id) || phonePotentialGroup?.confirmedIds.has(body.id);
    
    // Don't reset viewState if user is in groupConfirm state and has confirmed
    // This prevents the swipe-to-confirm transition from being interrupted
    if (viewState === 'groupConfirm' && isConfirmed) {
      return;
    }
    
    // If phone was in a potential group but is no longer, and they're not in a confirmed group,
    // reset to home screen (unless they're already there)
    // IMPORTANT: If this user was recently removed, always reset to home screen
    // If the group was completely deleted (only one user remains), both users return to home screen
    if (wasInPotentialGroup && !isInPotentialGroup && !phoneConfirmedGroup && viewState !== 'homeScreen') {
      // Both removed users and removers should return to home screen when group is deleted
      updateViewState('homeScreen');
    }
    
    // Also ensure that if user is recently removed and not in a potential group, they're at home screen
    // This handles the case where the group is deleted and the removed user needs to reset
    if (isRecentlyRemoved && !isInPotentialGroup && !phoneConfirmedGroup && viewState !== 'homeScreen') {
      updateViewState('homeScreen');
    }
    
    // If user just became recently removed, immediately reset to home screen
    // This ensures the removed user returns to zero state right away
    // Reset regardless of current view state to ensure they're at home screen
    const wasRecentlyRemoved = prevIsRecentlyRemovedRef.current;
    prevIsRecentlyRemovedRef.current = isRecentlyRemoved;
    
    if (!wasRecentlyRemoved && isRecentlyRemoved && !phoneConfirmedGroup) {
      // Always reset to home screen when user becomes recently removed
      // This ensures the removed user returns to zero state immediately
      updateViewState('homeScreen');
    }
    
    // Also ensure that if user is currently recently removed, they stay at home screen
    // This handles any edge cases where the view state might not have reset
    if (isRecentlyRemoved && !phoneConfirmedGroup && viewState !== 'homeScreen') {
      updateViewState('homeScreen');
    }
  }, [phonePotentialGroup, phoneConfirmedGroup, viewState, isRecentlyRemoved, confirmedPhones, body.id]);
  
  // Clear "recently removed" flag when user moves away from proximity
  // This allows them to see notifications again when they return
  useEffect(() => {
    const hadNearbyPhones = prevHasNearbyPhonesRef.current;
    prevHasNearbyPhonesRef.current = hasNearbyPhones;
    
    // If user was in proximity but is no longer, clear the recently removed flag
    // This happens when they move away, allowing notifications to show again when they return
    if (hadNearbyPhones && !hasNearbyPhones && isRecentlyRemoved && onGroupSearchStateChange) {
      // The flag will be cleared by the parent component when proximity is lost
      // For now, we rely on the timeout in Desktop1.tsx
    }
  }, [hasNearbyPhones, isRecentlyRemoved, onGroupSearchStateChange]);
  
  return (
    <div 
      className="absolute rounded-[29.303px]" 
      data-name="Screen"
      style={{ 
        pointerEvents: 'auto', 
        zIndex: 1,
        top: 0,
        left: 0,
        width: 312,
        height: 680,
        overflow: 'hidden',
        backgroundColor: 'black',
        transform: (viewState === 'groupSearch' || viewState === 'groupConfirm' || viewState === 'groupsHistory') ? `translateY(${swipeTranslation}px)` : 'none',
        transition: (isSwiping || isTransitioning || viewState === 'homeScreen') ? 'none' : `transform ${springDuration} ${springCurve}, background-color ${springDuration} ${springCurve}`,
        willChange: 'transform',
      }}
    >
      {/* Homescreen - shown when viewState is homeScreen (non-animated, for proper click handling) */}
      {viewState === 'homeScreen' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'auto' }}>
          <HomeScreenIPhone onMessageIconClick={handleMessageIconClick} />
        </div>
      )}
      
      {/* Groups History Screen */}
      {viewState === 'groupsHistory' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 15 }}>
          <GroupsHistory
            confirmedGroups={confirmedGroups || new Map()}
            allBodies={allBodies}
            onBack={() => {
              const navigateToHomeScreen = () => {
                updateViewState('homeScreen');
              };
              
              if ('startViewTransition' in document) {
                (document as any).startViewTransition(navigateToHomeScreen);
              } else {
                navigateToHomeScreen();
              }
            }}
            tool={tool}
            recentlyRemovedPhones={recentlyRemovedPhones}
            onGroupClick={(groupId) => {
              const navigateToGroupScreen = () => {
                updateViewState('groupConfirm', groupId);
              };
              
              if ('startViewTransition' in document) {
                (document as any).startViewTransition(navigateToGroupScreen);
              } else {
                navigateToGroupScreen();
              }
            }}
          />
        </div>
      )}
      
      {/* Swipeable home bar for groupsHistory - positioned outside transformed container */}
      {viewState === 'groupsHistory' && (
        <div
          onMouseDown={handleSwipeStart}
          onTouchStart={handleSwipeStart}
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '40px',
            cursor: 'grab',
            pointerEvents: 'auto',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '6px',
          }}
        >
          <div style={{ width: '110px', height: '3.5px' }}>
            <HomeIndicator />
          </div>
        </div>
      )}
      
      {/* Unified view that morphs between homeScreen notification, groupSearch, and groupConfirm */}
      {/* This is hidden when isRecentlyRemoved is true (handled in shouldShowUnifiedView condition) */}
      {shouldShowUnifiedView && (
        <div
          onClick={viewState === 'homeScreen' ? handleNotificationClick : undefined}
          style={{
            position: 'absolute',
            top: viewState === 'homeScreen' ? notificationTop : '-1px',
            left: viewState === 'homeScreen' ? notificationLeft : '-1px',
            right: viewState === 'homeScreen' ? 'auto' : '-1px',
            bottom: viewState === 'homeScreen' ? 'auto' : '-1px',
            width: viewState === 'homeScreen' ? `${notificationWidthAnimated}px` : 'auto',
            height: viewState === 'homeScreen' 
              ? `${notificationHeightAnimated}px` 
              : 'calc(100% + 2px)',
            backgroundColor: viewState === 'homeScreen' ? '#000000' : '#000000',
            backdropFilter: viewState === 'homeScreen' ? 'blur(20px)' : 'none',
            borderRadius: viewState === 'homeScreen' 
              ? `${notificationBorderRadiusAnimated}px` 
              : proximityBorderRadius,
            border: viewState === 'homeScreen' ? '1px solid #333333' : 'none',
            cursor: viewState === 'homeScreen' ? 'pointer' : 'default',
            pointerEvents: viewState === 'groupConfirm' ? 'none' : 'auto',
            boxShadow: 'none',
            zIndex:
              viewState === 'groupSearch'
                ? 10
                : viewState === 'groupConfirm'
                  ? 1
                  : 2,
            overflow: 'hidden',
            willChange: 'width, height, border-radius, top, left',
            transition:
              isSwiping || isTransitioning
                ? 'none'
                : `top ${springDuration} ${springCurve},
                   left ${springDuration} ${springCurve},
                   bottom ${springDuration} ${springCurve},
                   width ${springDuration} ${springCurve},
                   height ${springDuration} ${springCurve},
                   background-color ${springDuration} ${springCurve},
                   border-radius ${springDuration} ${springCurve},
                   backdrop-filter ${springDuration} ${springCurve}`,
          }}
        >
          {/* Shared cluster circle/profile - morphs across homeScreen, groupSearch, groupConfirm */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top:
                viewState === 'homeScreen'
                  ? '60%'
                  : viewState === 'groupSearch'
                    ? 'calc(50% - 18px)'
                    : '60.26px', // slightly above "New Group" pill
              transform:
                viewState === 'homeScreen'
                  ? 'translate(-50%, -50%)'
                  : viewState === 'groupSearch'
                    ? `translate(-50%, -50%) scale(${confirmCircleScale})`
                    : 'translateX(-50%)',
              width:
                viewState === 'homeScreen'
                  ? '24px'
                  : viewState === 'groupSearch'
                    ? '400px'
                    : '48px',
              height:
                viewState === 'homeScreen'
                  ? '24px'
                  : viewState === 'groupSearch'
                    ? '400px'
                    : '48px',
              borderRadius:
                viewState === 'homeScreen'
                  ? '50%'
                  : viewState === 'groupSearch'
                    ? '400px'
                    : '24px',
              backgroundColor: viewState === 'homeScreen' ? 'transparent' : '#222222',
              willChange: 'transform, width, height, border-radius',
              // Use snappier spring when entering groupConfirm (shrink),
              // but keep a longer, softer easing for all other transitions
              // (e.g. growing back out of groupConfirm).
              transition:
                viewState === 'groupConfirm'
                  ? `all ${springDuration} ${springCurve}`
                  : 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
              overflow: 'visible',
            }}
          >
            {/* Center profile picture - this phone - always visible */}
            {((viewState !== 'groupConfirm') || (viewState === 'groupConfirm' && hasNewPotentialGroups)) && notificationVisible && (
              <div
                className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]"
                style={{
                  // Make the primary user's bubble more prominent in notification view
                  width: viewState === 'homeScreen' ? '44px' : '80px',
                  height: viewState === 'homeScreen' ? '44px' : '80px',
                  borderRadius: '50%',
                  willChange: 'transform, width, height',
                  transition: `all ${springDuration} ${springCurve}`,
                  overflow: 'hidden',
                }}
              >
                <img
                  alt=""
                  className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
                  style={{ borderRadius: 'inherit' }}
                  src={body.profileImage}
                />
              </div>
            )}

              {/* All confirmed users filling the gray circle in groupConfirm */}
              {viewState === 'groupConfirm' &&
                (() => {
                  // Show up to 7 users in the group icon
                  // If there are more than 7 users total, exclude the device's own user and show up to 7 other users
                  let usersToDisplay: RigidBody[];
                  
                  if (allConfirmedPhonesFiltered.length <= 7) {
                    // 7 or fewer users: show all (including device's own user)
                    usersToDisplay = allConfirmedPhonesFiltered;
                  } else {
                    // More than 7 users: exclude device's own user and show up to 7 other users
                    const otherUsers = allConfirmedPhonesFiltered.filter(phone => phone.id !== body.id);
                    usersToDisplay = otherUsers.slice(0, 7);
                  }
                  
                  return usersToDisplay.map((user, index) => {
                    const totalCircles = usersToDisplay.length;
                    const centerX = 24; // center of 48px container
                    const centerY = 24;
                    const containerRadius = 24;
                    const margin = 0.25;

                    // Dynamic layout radius based on number of circles
                    // For more circles, use a larger radius to spread them out
                    let layoutRadius: number;
                    if (totalCircles === 1) {
                      layoutRadius = 0;
                    } else if (totalCircles === 2) {
                      layoutRadius = 8;
                    } else if (totalCircles === 3) {
                      layoutRadius = 10;
                    } else if (totalCircles === 4) {
                      layoutRadius = 11;
                    } else if (totalCircles === 5) {
                      layoutRadius = 12;
                    } else if (totalCircles === 6) {
                      layoutRadius = 13;
                    } else {
                      // 7 circles
                      layoutRadius = 14;
                    }

                    // Base size constraints - adjust based on number of circles
                    const baseDiameter = totalCircles <= 3 ? 24 : totalCircles <= 5 ? 18 : 14;
                    const minDiameter = 8;

                    let circleSize = baseDiameter;

                    if (totalCircles > 1) {
                      const neighborDist =
                        2 * layoutRadius * Math.sin(Math.PI / totalCircles);
                      const maxDiameterFromNeighbors = neighborDist - 2 * margin;
                      circleSize = Math.min(circleSize, maxDiameterFromNeighbors);
                    }

                    // Ensure we stay inside container
                    const maxDiameterFromContainer =
                      2 * (containerRadius - layoutRadius - margin);
                    circleSize = Math.min(circleSize, maxDiameterFromContainer);
                    circleSize = Math.max(minDiameter, circleSize);

                    const r = circleSize / 2;

                    const angle =
                      totalCircles === 1
                        ? 0
                        : (2 * Math.PI * index) / totalCircles;

                    const x = centerX + layoutRadius * Math.cos(angle);
                    const y = centerY + layoutRadius * Math.sin(angle);

                    const left = x - r;
                    const top = y - r;

                    return (
                      <div
                        key={user.id}
                        className="absolute overflow-hidden"
                        style={{
                          left,
                          top,
                          width: circleSize,
                          height: circleSize,
                          borderRadius: circleSize / 2,
                          boxShadow: '0 0 6px rgba(0,0,0,0.45)',
                        }}
                      >
                        <img
                          alt=""
                          className="absolute inset-0 max-w-none object-cover size-full pointer-events-none"
                          src={user.profileImage}
                        />
                      </div>
                    );
                  });
                })()}
          </div>
          
          {/* Nearby phone profiles - positioned based on proximity data.
              Hidden in groupConfirm when waiting for others (unless there are new potential groups).
              When waiting for others, only show phones from new potential groups.
              Also hidden when notification is in pill form. */}
          {((viewState !== 'groupConfirm') || (viewState === 'groupConfirm' && hasNewPotentialGroups)) && notificationVisible && (() => {
            // Filter out recently removed users immediately to ensure they don't appear on any device
            let nearbyWithinRange = proximityData
              .filter(data => isWithinProximityRange(data))
              .filter(data => !recentlyRemovedPhones?.has(data.phoneId));
            
            // If waiting for others OR in confirmed group only, filter to only show phones from new potential groups
            // This ensures we only show new potential groups, not the current group being confirmed or the confirmed group
            if ((isWaitingForOthers || isInConfirmedGroupOnly) && potentialGroups) {
              const currentGroupMemberIds = phonePotentialGroup 
                ? phonePotentialGroup.memberIds 
                : (phoneConfirmedGroup ? phoneConfirmedGroup.memberIds : new Set<number>());
              const newPotentialGroupMemberIds = new Set<number>();
              
              // Collect all member IDs from new potential groups
              for (const [groupId, potentialGroup] of potentialGroups) {
                // Skip the current potential group if we're waiting for others
                if (isWaitingForOthers && phonePotentialGroup && groupId === phonePotentialGroup.id) {
                  continue;
                }
                
                // If this group contains this phone or has new members, include all its members
                if (potentialGroup.memberIds.has(body.id)) {
                  // This phone is in a different potential group
                  potentialGroup.memberIds.forEach(id => newPotentialGroupMemberIds.add(id));
                } else {
                  // Check if this group has members not in the current group
                  const hasNewMembers = Array.from(potentialGroup.memberIds).some(
                    id => !currentGroupMemberIds.has(id)
                  );
                  if (hasNewMembers) {
                    // Include only the new members (not already in current group)
                    potentialGroup.memberIds.forEach(id => {
                      if (!currentGroupMemberIds.has(id)) {
                        newPotentialGroupMemberIds.add(id);
                      }
                    });
                  }
                }
              }
              
              // Filter to only show phones from new potential groups
              nearbyWithinRange = nearbyWithinRange.filter(data => 
                newPotentialGroupMemberIds.has(data.phoneId)
              );
            }
            
            // In groupSearch view, show all nearby users who are in proximity
            // The group membership filter was too restrictive - it prevented new users
            // (like a third phone) from appearing even when they're in proximity
            // The updatePotentialGroups function will add all nearby users to the group,
            // so we should show all users in proximity, not just those already in the group
            // Removed users are filtered out here to ensure they don't appear on any device

            // Add exiting users with their last known proximity data so they can animate out
            exitingPhoneIds.forEach(phoneId => {
              const lastData = lastProximityDataRef.current.get(phoneId);
              if (lastData && !recentlyRemovedPhones?.has(phoneId)) {
                nearbyWithinRange.push(lastData);
              }
            });

            if (nearbyWithinRange.length === 0) return null;

            // Shared constants for layout and sizing
            // Notification view: exaggerate distances slightly so positions feel more "spread out"
            const notificationMaxDisplayRadius = 100;
            const notificationMinDisplayRadius = 35;
            const notificationMaxRangeCm = 8.5;
            const notificationSize = 40; // Fixed size in notification state

            const fullViewMaxDisplayRadius = 200;
            const fullViewMinDisplayRadius = 50;
            const fullViewMaxRangeCm = 8.5;
            const fullViewMinSize = 48;
            const fullViewMaxSize = 75;

            type LayoutEntry = {
              phoneId: number;
              angleDeg: number;
              notificationRadius: number;
              fullViewRadius: number;
              fullViewSize: number;
              profileImage: string;
            };

            const layoutEntries: LayoutEntry[] = nearbyWithinRange.map(data => {
              // Slightly non-linear scaling in notification view to push farther phones further out
              const notificationNormalized = Math.min(
                Math.max(data.distanceCm / notificationMaxRangeCm, 0),
                1,
              );
              const notificationRadius =
                notificationMinDisplayRadius +
                Math.pow(notificationNormalized, 1.2) *
                  (notificationMaxDisplayRadius - notificationMinDisplayRadius);

              const fullViewRadius =
                fullViewMinDisplayRadius +
                (data.distanceCm / fullViewMaxRangeCm) *
                  (fullViewMaxDisplayRadius - fullViewMinDisplayRadius);

              const fullViewSize =
                fullViewMaxSize -
                (data.distanceCm / fullViewMaxRangeCm) *
                  (fullViewMaxSize - fullViewMinSize);

              const nearbyPhone = allBodies.find(b => b.id === data.phoneId);
              const profileImage = nearbyPhone?.profileImage || imgContainer1;

              return {
                phoneId: data.phoneId,
                angleDeg: data.degrees,
                notificationRadius,
                fullViewRadius,
                fullViewSize,
                profileImage,
              };
            });

            const toCartesian = (radius: number, angleDeg: number) => {
              const angleRad = (angleDeg * Math.PI) / 180;
              return {
                x: Math.cos(angleRad) * radius,
                y: Math.sin(angleRad) * radius,
              };
            };

            const resolveOverlaps2D = (
              xs: number[],
              ys: number[],
              sizes: number[],
              margin: number,
            ) => {
              const iterations = 8;
              const count = xs.length;

              for (let it = 0; it < iterations; it++) {
                for (let i = 0; i < count; i++) {
                  for (let j = i + 1; j < count; j++) {
                    const dx = xs[j] - xs[i];
                    const dy = ys[j] - ys[i];
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = sizes[i] / 2 + sizes[j] / 2 + margin;

                    if (dist < 1e-4) {
                      // Prevent degenerate zero-distance cases
                      dist = 1e-4;
                    }

                    if (dist < minDist) {
                      const overlap = minDist - dist;
                      const nx = dx / dist;
                      const ny = dy / dist;
                      const shift = overlap / 2;

                      xs[i] -= nx * shift;
                      ys[i] -= ny * shift;
                      xs[j] += nx * shift;
                      ys[j] += ny * shift;
                    }
                  }
                }
              }
            };

            // Notification positions (smaller radii and fixed size)
            const notifXs: number[] = [];
            const notifYs: number[] = [];
            const notifSizes: number[] = [];

            layoutEntries.forEach(entry => {
              const { x, y } = toCartesian(entry.notificationRadius, entry.angleDeg);
              notifXs.push(x);
              notifYs.push(y);
              notifSizes.push(notificationSize);
            });

            resolveOverlaps2D(notifXs, notifYs, notifSizes, 4);

            // Full-view positions (larger radii and variable sizes)
            const fullXs: number[] = [];
            const fullYs: number[] = [];
            const fullSizes: number[] = [];

            layoutEntries.forEach(entry => {
              const { x, y } = toCartesian(entry.fullViewRadius, entry.angleDeg);
              fullXs.push(x);
              fullYs.push(y);
              fullSizes.push(entry.fullViewSize);
            });

            resolveOverlaps2D(fullXs, fullYs, fullSizes, 6);

            const topOffset =
              viewState === 'homeScreen' ? '60%' : 'calc(50% - 18px)';

            return layoutEntries.map((entry, index) => {
              const isHome = viewState === 'homeScreen';
              const isGroupSearch = viewState === 'groupSearch';
              const x = isHome ? notifXs[index] : fullXs[index];
              const y = isHome ? notifYs[index] : fullYs[index];
              const size = isHome ? notificationSize : fullSizes[index];
              
              // Check if this user is confirmed (should not be swipeable)
              const isConfirmed = confirmedPhones?.has(entry.phoneId);
              const isBeingSwiped = swipedUser === entry.phoneId;
              const swipeOffsetForUser = isBeingSwiped ? swipeRemoveOffset : { x: 0, y: 0 };
              const opacity = isBeingSwiped ? Math.max(0, 1 - currentSwipeRemoveDistanceRef.current / 100) : 1;
              
              // Only allow swiping unconfirmed users in groupSearch view
              const isSwipeable = isGroupSearch && !isConfirmed && tool === 'interact';

              // Check if user is entering or exiting
              // A user is entering if they're newly appearing (not in previous proximity ref but currently in proximity)
              // This check happens immediately on render, no state delay
              const isNewlyAppearing = !previousProximityPhoneIdsRef.current.has(entry.phoneId);
              const isEntering = isNewlyAppearing || enteringPhoneIds.has(entry.phoneId);
              const isExiting = exitingPhoneIds.has(entry.phoneId);
              
              // Calculate scale: entering starts at 0 (animates to 1 immediately), exiting starts at 1 (animates to 0), otherwise 1
              let scale = 1;
              if (isExiting) {
                // Only animate to 0 if we've triggered the animation (after initial render at scale 1)
                const isAnimatingExit = exitingAnimatingIds.has(entry.phoneId);
                scale = isAnimatingExit ? 0 : 1;
              } else if (isEntering) {
                // Start at 0, then animate to 1 when enteringAnimatingIds is set
                const isAnimatingEnter = enteringAnimatingIds.has(entry.phoneId);
                scale = isAnimatingEnter ? 1 : 0;
              }
              
              // Override with swipe scale if being swiped
              const swipeScale = isBeingSwiped ? Math.max(0.5, 1 - currentSwipeRemoveDistanceRef.current / 200) : 1;
              scale = isBeingSwiped ? swipeScale : scale;
              
              // Determine transition duration based on animation type
              const transitionDuration = isExiting ? exitDuration : (isEntering ? enterDuration : springDuration);
              
              const transformValue = `translate(-50%, -50%) translate(${x + swipeOffsetForUser.x}px, ${y + swipeOffsetForUser.y}px) scale(${scale})`;

              return (
                <div
                  key={entry.phoneId}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: topOffset,
                    transform: transformValue,
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: isHome ? '50%' : `${size / 2}px`,
                    willChange: 'transform, width, height, opacity',
                    transition: isBeingSwiped ? 'none' : `width ${springDuration} ${springCurve}, height ${springDuration} ${springCurve}, border-radius ${springDuration} ${springCurve}, transform ${transitionDuration} ${springCurve}, opacity ${springDuration} ${springCurve}`,
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    opacity,
                    cursor: isSwipeable ? 'grab' : 'default',
                    pointerEvents: 'auto',
                    zIndex: isBeingSwiped ? 10 : 1,
                  }}
                  onMouseDown={isSwipeable ? (e) => handleUserSwipeStart(e, entry.phoneId) : undefined}
                  onTouchStart={isSwipeable ? (e) => handleUserSwipeStart(e, entry.phoneId) : undefined}
                >
                  <img
                    alt=""
                    className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
                    style={{ borderRadius: 'inherit' }}
                    src={entry.profileImage}
                  />
                </div>
              );
            });
          })()}
          
          {/* Swipe to Confirm with arrow - only visible in full view */}
          <div 
            className="absolute h-[577.625px] left-[calc(50%+0.5px)] top-[31.19px] translate-x-[-50%] w-[577.626px]"
            onMouseDown={handleConfirmSwipeStart}
            onTouchStart={handleConfirmSwipeStart}
            style={{
              opacity: viewState === 'groupSearch' ? 1 : 0,
              willChange: 'opacity, transform',
              transition: `opacity ${springDuration} ${springCurve}`,
              pointerEvents: viewState === 'groupSearch' ? 'auto' : 'none',
              cursor: viewState === 'groupSearch' ? 'grab' : 'default',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                transform: `translateY(${-confirmSwipeOffset * 0.4}px)`,
                willChange: 'transform',
                transition: (isConfirmSwiping || isTransitioning)
                  ? 'none'
                  : `transform ${springDuration} ${springCurve}`,
              }}
            >
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 578 578">
                <g id="Group 154" style={{ "--fill-0": "white", "--stroke-0": "white" } as React.CSSProperties}>
                  <path d={svgPaths.p282f9e80} fill="var(--fill-0, white)" id="Swipe to Confirm" />
                  {/* Arrow has an ambient bob when idle (no active confirm swipe / transition) */}
                  <path
                    d={svgPaths.p3d304700}
                    id="Vector"
                    stroke="var(--stroke-0, white)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    style={{
                      transformOrigin: '50% 50%',
                      animation:
                        viewState === 'groupSearch' && !isConfirmSwiping && !isTransitioning
                          ? 'swipeArrowBob 1.6s ease-in-out infinite'
                          : 'none',
                    }}
                  />
                </g>
              </svg>
            </div>
          </div>
          
          {/* GroupDrop title - shrinks into top-left corner in notification view, larger lower title in full view */}
          <p 
            className="absolute font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] left-[24px] text-nowrap text-white tracking-[-0.1504px] whitespace-pre" 
            style={{ 
              fontVariationSettings: "'wdth' 100",
              top: `${groupTitleTop}px`,
              fontSize: `${groupTitleFontSize}px`,
              opacity: (viewState === 'groupConfirm' || (viewState === 'homeScreen' && !notificationVisible)) ? 0 : 1,
              willChange: 'opacity, top, font-size',
              transition: `opacity ${springDuration} ${springCurve}, top ${springDuration} ${springCurve}, font-size ${springDuration} ${springCurve}`,
            }}
          >
            GroupDrop
          </p>
          
          {/* Representative Group Dropdown - only visible in groupSearch when there are nearby phones */}
          {viewState === 'groupSearch' && hasNearbyPhones && onRepresentativeGroupChange && (() => {
            // Get all groups this phone is a member of
            const phoneGroups = confirmedGroups 
              ? Array.from(confirmedGroups.values()).filter(group => group.memberIds.has(body.id))
              : [];
            
            // Always show dropdown (even if phone isn't in any groups - they can select "New Group")
            const selectedGroupId = currentRepresentativeGroupId || null;
            
            return (
              <div 
                ref={representativeDropdownRef}
                className="absolute"
                style={{
                  left: '24px',
                  top: `${groupTitleTop + (isHomeNotification ? 28 : 38)}px`,
                  zIndex: 100,
                  opacity: viewState === 'groupSearch' ? 1 : 0,
                  pointerEvents: viewState === 'groupSearch' && tool === 'interact' ? 'auto' : 'none',
                  transition: `opacity ${springDuration} ${springCurve}`,
                }}
              >
                <button
                  onClick={(e) => {
                    if (tool !== 'interact') return;
                    e.stopPropagation();
                    setIsRepresentativeDropdownOpen(!isRepresentativeDropdownOpen);
                  }}
                  className="bg-[#222222] text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-[#333333] transition-colors"
                  style={{
                    fontFamily: "'SF Pro', sans-serif",
                    fontSize: '12px',
                    minWidth: '120px',
                  }}
                >
                  <span>{selectedGroupId ? `Group ${selectedGroupId}` : 'New Group'}</span>
                  <span style={{ fontSize: '10px' }}>{isRepresentativeDropdownOpen ? '▲' : '▼'}</span>
                </button>
                
                {isRepresentativeDropdownOpen && (
                  <div 
                    className="absolute mt-1 bg-[#222222] rounded-lg shadow-lg overflow-hidden"
                    style={{
                      minWidth: '120px',
                      zIndex: 101,
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRepresentativeGroupChange) {
                          onRepresentativeGroupChange(body.id, null);
                        }
                        setIsRepresentativeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#333333] transition-colors ${
                        selectedGroupId === null ? 'bg-[#333333]' : ''
                      }`}
                      style={{
                        fontFamily: "'SF Pro', sans-serif",
                        color: 'white',
                      }}
                    >
                      New Group
                    </button>
                    {phoneGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRepresentativeGroupChange) {
                            onRepresentativeGroupChange(body.id, group.id);
                          }
                          setIsRepresentativeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-[#333333] transition-colors ${
                          selectedGroupId === group.id ? 'bg-[#333333]' : ''
                        }`}
                        style={{
                          fontFamily: "'SF Pro', sans-serif",
                          color: 'white',
                        }}
                      >
                        Group {group.id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
          
          {/* Scanning for Friends text - only visible in full view */}
          <p 
            className="absolute font-['SF_Pro:Regular',sans-serif] font-normal leading-[normal] left-[24px] text-[#666666] text-[14px] text-nowrap top-[57px] tracking-[-0.1504px] whitespace-pre" 
            style={{ 
              fontVariationSettings: "'wdth' 100",
              opacity: viewState === 'groupSearch' ? 1 : 0,
              willChange: 'opacity',
              transition: `opacity ${springDuration} ${springCurve}`,
            }}
          >
            Scanning for Friends...
          </p>
          
          {/* Swipeable home bar - only visible in full view */}
          {viewState === 'groupSearch' && (
            <div
              onMouseDown={handleSwipeStart}
              onTouchStart={handleSwipeStart}
              style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '40px',
                cursor: 'grab',
                pointerEvents: 'auto',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '6px',
              }}
            >
              <div style={{ width: '110px', height: '3.5px' }}>
                <HomeIndicator />
              </div>
            </div>
          )}
        </div>
      )}

      {/* GroupConfirm-specific UI (inline version of previous GroupScreen layout) */}
      {viewState === 'groupConfirm' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
          }}
        >
          {/* Unconfirmed group members at bottom */}
          {showUnconfirmedPill && (
            <div
              key={isUnconfirmedExiting ? 'unconfirmed-exit' : 'unconfirmed-enter'}
              className="absolute bg-[#222222] left-[calc(50%+0.73px)] overflow-clip rounded-[400px] size-[400px] top-[calc(50%+315.5px)] translate-x-[-50%] translate-y-[-50%]"
              data-name="unconfirmed-groupmembers"
              style={{ 
                zIndex: 5,
                transformOrigin: '50% 100%',
                willChange: 'transform, opacity',
                animation: `fadeInGrowUp ${springDuration} ${springCurve} 0.05s both`,
                animationDirection: isUnconfirmedExiting ? 'reverse' : 'normal',
              }}
            >
              <p
                className="absolute font-['SF_Pro:Regular',sans-serif] font-normal leading-[15.423px] left-[calc(50%-0.5px)] text-[11.567px] text-center text-nowrap text-white top-[calc(50%-44.48px)] tracking-[-0.1774px] translate-x-[-50%] whitespace-pre"
                style={{ 
                  fontVariationSettings: "'wdth' 100",
                  willChange: 'transform, opacity',
                  animation: `fadeInGrowUp ${springDuration} ${springCurve} 0.12s both`,
                  animationDirection: isUnconfirmedExiting ? 'reverse' : 'normal',
                }}
              >
                Waiting for Others...
              </p>
              
              {/* Unconfirmed user avatars - symmetric cluster near the top of the circle */}
              {unconfirmedNearbyPhones.map((user, index) => {
                const count = unconfirmedNearbyPhones.length;
                // Shift cluster a bit further left so it visually centers above the label
                const centerX = 185; // horizontal visual center of cluster
                const centerY = 70;  // vertical center of cluster

                // Predefined symmetric layouts by count (offsets from center in px)
                const layouts: { [key: number]: { x: number; y: number }[] } = {
                  1: [{ x: 0, y: 0 }],
                  2: [
                    { x: -20, y: 0 },
                    { x: 20, y: 0 },
                  ],
                  3: [
                    { x: 0, y: -20 },
                    { x: -22, y: 16 },
                    { x: 22, y: 16 },
                  ],
                  4: [
                    { x: -22, y: -14 },
                    { x: 22, y: -14 },
                    { x: -22, y: 18 },
                    { x: 22, y: 18 },
                  ],
                  5: [
                    { x: 0, y: -24 },
                    { x: -24, y: -4 },
                    { x: 24, y: -4 },
                    { x: -14, y: 22 },
                    { x: 14, y: 22 },
                  ],
                };

                const layout =
                  layouts[count] || layouts[Math.min(count, 5)] || layouts[1];
                const offset = layout[index % layout.length];

                const x = centerX + offset.x;
                const y = centerY + offset.y;

                const baseSize = 34;
                const size =
                  count <= 3 ? baseSize + 6 : count <= 5 ? baseSize : baseSize - 4;
                const r = size / 2;

                unconfirmedPlaced.push({ x, y, r });
                
                return (
                  <div 
                    key={user.id}
                    className="absolute rounded-[77.114px] overflow-hidden"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      width: `${size}px`,
                      height: `${size}px`,
                      willChange: 'transform, opacity',
                      animation: `fadeInScale 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.08}s both`,
                    }}
                  >
                    <img 
                      alt="" 
                      className="absolute inset-0 max-w-none object-cover size-full pointer-events-none" 
                      src={user.profileImage} 
                    />
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Group name badge */}
          <div
            className="absolute bg-[#222222] box-border content-stretch flex gap-[6.169px] items-center justify-center left-[calc(50%-0.01px)] px-[9.254px] py-[6.169px] rounded-[77.114px] shadow-[0px_0px_23.134px_0px_rgba(0,0,0,0.15)] top-[100.26px] translate-x-[-50%]"
            data-name="groupname"
            style={{
              zIndex: 6,
              willChange: 'transform, opacity',
              animation: 'fadeInSlideDown 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both',
            }}
          >
            <p
              className="font-['SF_Pro:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[12.338px] text-nowrap text-white tracking-[-0.116px] whitespace-pre"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              New Group
            </p>
          </div>

          {/* Back button in top-left, matching Figma design - only show when there are unconfirmed users */}
          {/* Hide back button if this phone is in a confirmed group (all users have confirmed) */}
          {(() => {
            // Check if this phone is in a confirmed group
            const isInConfirmedGroup = confirmedGroups
              ? Array.from(confirmedGroups.values()).some(group => group.memberIds.has(body.id))
              : false;
            
            // Show back button only if there are unconfirmed users AND phone is not in a confirmed group
            return unconfirmedNearbyPhones.length > 0 && !isInConfirmedGroup;
          })() && (
            <div
              className="absolute flex items-center justify-center left-[18.51px] size-[33.93px] top-[56.53px]"
              style={{
                zIndex: 7,
                willChange: 'transform, opacity',
                animation: 'fadeInSlideRight 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
              }}
            >
              <div className="flex-none scale-y-[-100%]">
                <BackButton
                  tool={tool}
                  onClick={() => {
                    // Going back from GroupConfirm should clear confirmation
                    // But only if not in a confirmed group (can't leave confirmed groups)
                    const isInConfirmedGroup = confirmedGroups
                      ? Array.from(confirmedGroups.values()).some(group => group.memberIds.has(body.id))
                      : false;
                    
                    if (!isInConfirmedGroup && onUnconfirm) {
                      onUnconfirm(body.id);
                    }
                    // Go back to groupSearch - use potential group ID if available
                    const currentPotentialGroup = potentialGroups 
                      ? Array.from(potentialGroups.values()).find(group => group.memberIds.has(body.id))
                      : undefined;
                    updateViewState('groupSearch', currentPotentialGroup?.id || null);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Swipeable home bar for groupConfirm - positioned outside transformed container */}
      {viewState === 'groupConfirm' && (
        <div
          onMouseDown={handleSwipeStart}
          onTouchStart={handleSwipeStart}
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '40px',
            cursor: 'grab',
            pointerEvents: 'auto',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '6px',
          }}
        >
          <div style={{ width: '110px', height: '3.5px' }}>
            <HomeIndicator />
          </div>
        </div>
      )}

      {/* Proximity notification overlay for groupConfirm screen - show even when viewing confirmed group screen if new potential group */}
      {viewState === 'groupConfirm' && showNotification && (
        <div
          onClick={handleNotificationClick}
          style={{
            position: 'absolute',
            top: '11px',
            left: '11px',
            right: '11px',
            height: notificationHeight,
            backgroundColor: '#000000',
            backdropFilter: 'blur(20px)',
            borderRadius: '36px',
            border: '1px solid #333333',
            cursor: 'pointer',
            pointerEvents: 'auto',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 20,
            overflow: 'hidden',
            willChange: 'opacity, transform',
            animation: 'fadeInScale 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Notification content - similar to homeScreen notification */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '60%',
              transform: 'translate(-50%, -50%)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              overflow: 'visible',
            }}
          >
            {/* Center profile picture */}
            <div
              className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                overflow: 'hidden',
              }}
            >
              <img
                alt=""
                className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
                style={{ borderRadius: 'inherit' }}
                src={body.profileImage}
              />
            </div>

            {/* Nearby phone profiles */}
            {(() => {
              let nearbyWithinRange = proximityData.filter(data => isWithinProximityRange(data));
              
              // Add exiting users with their last known proximity data so they can animate out
              exitingPhoneIds.forEach(phoneId => {
                const lastData = lastProximityDataRef.current.get(phoneId);
                if (lastData) {
                  nearbyWithinRange.push(lastData);
                }
              });
              
              if (nearbyWithinRange.length === 0) return null;

              const notificationMaxDisplayRadius = 100;
              const notificationMinDisplayRadius = 35;
              const notificationMaxRangeCm = 8.5;
              const notificationSize = 40;

              type LayoutEntry = {
                phoneId: number;
                angleDeg: number;
                notificationRadius: number;
                profileImage: string;
              };

              const layoutEntries: LayoutEntry[] = nearbyWithinRange.map(data => {
                const notificationNormalized = Math.min(
                  Math.max(data.distanceCm / notificationMaxRangeCm, 0),
                  1,
                );
                const notificationRadius =
                  notificationMinDisplayRadius +
                  Math.pow(notificationNormalized, 1.2) *
                    (notificationMaxDisplayRadius - notificationMinDisplayRadius);

                const nearbyPhone = allBodies.find(b => b.id === data.phoneId);
                const profileImage = nearbyPhone?.profileImage || imgContainer1;

                return {
                  phoneId: data.phoneId,
                  angleDeg: data.degrees,
                  notificationRadius,
                  profileImage,
                };
              });

              const toCartesian = (radius: number, angleDeg: number) => {
                const angleRad = (angleDeg * Math.PI) / 180;
                return {
                  x: Math.cos(angleRad) * radius,
                  y: Math.sin(angleRad) * radius,
                };
              };

              const resolveOverlaps2D = (
                xs: number[],
                ys: number[],
                sizes: number[],
                margin: number,
              ) => {
                const iterations = 8;
                const count = xs.length;

                for (let it = 0; it < iterations; it++) {
                  for (let i = 0; i < count; i++) {
                    for (let j = i + 1; j < count; j++) {
                      const dx = xs[j] - xs[i];
                      const dy = ys[j] - ys[i];
                      let dist = Math.sqrt(dx * dx + dy * dy);
                      const minDist = sizes[i] / 2 + sizes[j] / 2 + margin;

                      if (dist < 1e-4) {
                        dist = 1e-4;
                      }

                      if (dist < minDist) {
                        const overlap = minDist - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const shift = overlap / 2;

                        xs[i] -= nx * shift;
                        ys[i] -= ny * shift;
                        xs[j] += nx * shift;
                        ys[j] += ny * shift;
                      }
                    }
                  }
                }
              };

              const notifXs: number[] = [];
              const notifYs: number[] = [];
              const notifSizes: number[] = [];

              layoutEntries.forEach(entry => {
                const { x, y } = toCartesian(entry.notificationRadius, entry.angleDeg);
                notifXs.push(x);
                notifYs.push(y);
                notifSizes.push(notificationSize);
              });

              resolveOverlaps2D(notifXs, notifYs, notifSizes, 4);

              return layoutEntries.map((entry, index) => {
                const x = notifXs[index];
                const y = notifYs[index];
                const size = notificationSize;
                
                // Check if user is entering or exiting
                // A user is entering if they're newly appearing (not in previous proximity ref but currently in proximity)
                // This check happens immediately on render, no state delay
                const isNewlyAppearing = !previousProximityPhoneIdsRef.current.has(entry.phoneId);
                const isEntering = isNewlyAppearing || enteringPhoneIds.has(entry.phoneId);
                const isExiting = exitingPhoneIds.has(entry.phoneId);
                
                // Calculate scale: entering starts at 0 (animates to 1 immediately), exiting starts at 1 (animates to 0), otherwise 1
                let scale = 1;
                if (isExiting) {
                  // Only animate to 0 if we've triggered the animation (after initial render at scale 1)
                  const isAnimatingExit = exitingAnimatingIds.has(entry.phoneId);
                  scale = isAnimatingExit ? 0 : 1;
                } else if (isEntering) {
                  // Start at 0, then animate to 1 when enteringAnimatingIds is set
                  const isAnimatingEnter = enteringAnimatingIds.has(entry.phoneId);
                  scale = isAnimatingEnter ? 1 : 0;
                }
                
                // Determine transition duration based on animation type
                const transitionDuration = isExiting ? exitDuration : (isEntering ? enterDuration : springDuration);

                return (
                  <div
                    key={entry.phoneId}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '60%',
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
                      width: `${size}px`,
                      height: `${size}px`,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: 'white',
                      transition: `transform ${transitionDuration} ${springCurve}, width ${springDuration} ${springCurve}, height ${springDuration} ${springCurve}`,
                    }}
                  >
                    <img
                      alt=""
                      className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
                      style={{ borderRadius: 'inherit' }}
                      src={entry.profileImage}
                    />
                  </div>
                );
              });
            })()}
          </div>

          {/* GroupDrop title */}
          <p 
            className="absolute font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] left-[24px] text-nowrap text-white tracking-[-0.1504px] whitespace-pre" 
            style={{ 
              fontVariationSettings: "'wdth' 100",
              top: '24px',
              fontSize: '18px',
            }}
          >
            GroupDrop
          </p>
        </div>
      )}

      {/* Proximity notification overlay for groupsHistory screen - hide when viewing confirmed group screen */}
      {viewState === 'groupsHistory' && !isViewingConfirmedGroupScreen && showNotification && (
        <div
          onClick={handleNotificationClick}
          style={{
            position: 'absolute',
            top: '11px',
            left: '11px',
            right: '11px',
            height: notificationHeight,
            backgroundColor: '#000000',
            backdropFilter: 'blur(20px)',
            borderRadius: '36px',
            border: '1px solid #333333',
            cursor: 'pointer',
            pointerEvents: 'auto',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 20,
            overflow: 'hidden',
            willChange: 'opacity, transform',
            animation: 'fadeInScale 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
            transform: viewState === 'groupsHistory' && swipeTranslation < 0 ? `translateY(${-swipeTranslation}px)` : 'none',
          }}
        >
          {/* Notification content - similar to homeScreen notification */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '60%',
              transform: 'translate(-50%, -50%)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              overflow: 'visible',
            }}
          >
            {/* Center profile picture */}
            <div
              className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                overflow: 'hidden',
              }}
            >
              <img
                alt=""
                className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
                style={{ borderRadius: 'inherit' }}
                src={body.profileImage}
              />
            </div>

            {/* Nearby phone profiles */}
            {(() => {
              let nearbyWithinRange = proximityData.filter(data => isWithinProximityRange(data));
              
              // Add exiting users with their last known proximity data so they can animate out
              exitingPhoneIds.forEach(phoneId => {
                const lastData = lastProximityDataRef.current.get(phoneId);
                if (lastData) {
                  nearbyWithinRange.push(lastData);
                }
              });
              
              if (nearbyWithinRange.length === 0) return null;

              const notificationMaxDisplayRadius = 100;
              const notificationMinDisplayRadius = 35;
              const notificationMaxRangeCm = 8.5;
              const notificationSize = 40;

              type LayoutEntry = {
                phoneId: number;
                angleDeg: number;
                notificationRadius: number;
                profileImage: string;
              };

              const layoutEntries: LayoutEntry[] = nearbyWithinRange.map(data => {
                const notificationNormalized = Math.min(
                  Math.max(data.distanceCm / notificationMaxRangeCm, 0),
                  1,
                );
                const notificationRadius =
                  notificationMinDisplayRadius +
                  Math.pow(notificationNormalized, 1.2) *
                    (notificationMaxDisplayRadius - notificationMinDisplayRadius);

                const nearbyPhone = allBodies.find(b => b.id === data.phoneId);
                const profileImage = nearbyPhone?.profileImage || imgContainer1;

                return {
                  phoneId: data.phoneId,
                  angleDeg: data.degrees,
                  notificationRadius,
                  profileImage,
                };
              });

              const toCartesian = (radius: number, angleDeg: number) => {
                const angleRad = (angleDeg * Math.PI) / 180;
                return {
                  x: Math.cos(angleRad) * radius,
                  y: Math.sin(angleRad) * radius,
                };
              };

              const resolveOverlaps2D = (
                xs: number[],
                ys: number[],
                sizes: number[],
                margin: number,
              ) => {
                const iterations = 8;
                const count = xs.length;

                for (let it = 0; it < iterations; it++) {
                  for (let i = 0; i < count; i++) {
                    for (let j = i + 1; j < count; j++) {
                      const dx = xs[j] - xs[i];
                      const dy = ys[j] - ys[i];
                      let dist = Math.sqrt(dx * dx + dy * dy);
                      const minDist = sizes[i] / 2 + sizes[j] / 2 + margin;

                      if (dist < 1e-4) {
                        dist = 1e-4;
                      }

                      if (dist < minDist) {
                        const overlap = minDist - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const shift = overlap / 2;

                        xs[i] -= nx * shift;
                        ys[i] -= ny * shift;
                        xs[j] += nx * shift;
                        ys[j] += ny * shift;
                      }
                    }
                  }
                }
              };

              const notifXs: number[] = [];
              const notifYs: number[] = [];
              const notifSizes: number[] = [];

              layoutEntries.forEach(entry => {
                const { x, y } = toCartesian(entry.notificationRadius, entry.angleDeg);
                notifXs.push(x);
                notifYs.push(y);
                notifSizes.push(notificationSize);
              });

              resolveOverlaps2D(notifXs, notifYs, notifSizes, 4);

              return layoutEntries.map((entry, index) => {
                const x = notifXs[index];
                const y = notifYs[index];
                const size = notificationSize;
                
                // Check if user is entering or exiting
                // A user is entering if they're newly appearing (not in previous proximity ref but currently in proximity)
                // This check happens immediately on render, no state delay
                const isNewlyAppearing = !previousProximityPhoneIdsRef.current.has(entry.phoneId);
                const isEntering = isNewlyAppearing || enteringPhoneIds.has(entry.phoneId);
                const isExiting = exitingPhoneIds.has(entry.phoneId);
                
                // Calculate scale: entering starts at 0 (animates to 1 immediately), exiting starts at 1 (animates to 0), otherwise 1
                let scale = 1;
                if (isExiting) {
                  // Only animate to 0 if we've triggered the animation (after initial render at scale 1)
                  const isAnimatingExit = exitingAnimatingIds.has(entry.phoneId);
                  scale = isAnimatingExit ? 0 : 1;
                } else if (isEntering) {
                  // Start at 0, then animate to 1 when enteringAnimatingIds is set
                  const isAnimatingEnter = enteringAnimatingIds.has(entry.phoneId);
                  scale = isAnimatingEnter ? 1 : 0;
                }
                
                // Determine transition duration based on animation type
                const transitionDuration = isExiting ? exitDuration : (isEntering ? enterDuration : springDuration);

                return (
                  <div
                    key={entry.phoneId}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '60%',
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
                      width: `${size}px`,
                      height: `${size}px`,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: 'white',
                      transition: `transform ${transitionDuration} ${springCurve}, width ${springDuration} ${springCurve}, height ${springDuration} ${springCurve}`,
                    }}
                  >
                    <img
                      alt=""
                      className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
                      style={{ borderRadius: 'inherit' }}
                      src={entry.profileImage}
                    />
                  </div>
                );
              });
            })()}
          </div>

          {/* GroupDrop title */}
          <p 
            className="absolute font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] left-[24px] text-nowrap text-white tracking-[-0.1504px] whitespace-pre" 
            style={{ 
              fontVariationSettings: "'wdth' 100",
              top: '24px',
              fontSize: '18px',
            }}
          >
            GroupDrop
          </p>
        </div>
      )}
    </div>
  );
}

function Bezel() {
  return (
    <div className="absolute h-[710.523px] left-[-18.54px] top-[-17.76px] w-[347.539px]" data-name="Bezel" style={{ zIndex: 5, pointerEvents: 'none' }}>
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgBezel} />
    </div>
  );
}

export function PhoneWithProximity({
  body,
  proximityData,
  tool,
  allBodies,
  onConfirm,
  onUnconfirm,
  confirmedPhones,
  groupSearchOpenPhones,
  onGroupSearchStateChange,
  confirmedGroups,
  potentialGroups,
  onRemoveUser,
  isRecentlyRemoved,
  recentlyRemovedPhones,
  onSetRepresentative,
  currentRepresentativeGroupId,
  onRepresentativeGroupChange,
}: PhoneWithProximityProps) {
  const [screenViewState, setScreenViewState] = useState<'homeScreen' | 'groupSearch' | 'groupConfirm' | 'groupsHistory'>('homeScreen');
  const [screenSwipeOffset, setScreenSwipeOffset] = useState(0);

  const handleStateChange = (viewState: 'homeScreen' | 'groupSearch' | 'groupConfirm' | 'groupsHistory', swipeOffset: number) => {
    setScreenViewState(viewState);
    setScreenSwipeOffset(swipeOffset);
  };

  // Show underneath home screen only when swiping up (swipeOffset > 0) from non-homeScreen states
  // When in homeScreen state, the home screen is rendered inside Screen component instead
  const shouldShowUnderneathHomeScreen = screenSwipeOffset > 0 && screenViewState !== 'homeScreen';

  return (
    <div 
      className="relative size-full bg-black rounded-[24px]" 
      data-name="PhoneWithProximity"
    >
      {/* Clipping container to prevent content from escaping during swipe */}
      <div
        style={{
          position: 'absolute',
          top: '-2px',
          left: '-1px',
          width: '312px',
          height: '680px',
          overflow: 'hidden',
          borderRadius: '29.303px',
          zIndex: 1,
          pointerEvents: 'none',
          backgroundColor: 'black',
        }}
      >
        {/* Home screen - rendered behind, shows through when Screen translates up during swipe */}
        {shouldShowUnderneathHomeScreen && (
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              zIndex: 0,
              pointerEvents: 'none',
            }}
          >
            <HomeScreenIPhone />
          </div>
        )}
        <Screen
          body={body}
          proximityData={proximityData}
          tool={tool}
          allBodies={allBodies}
          onConfirm={onConfirm}
          onUnconfirm={onUnconfirm}
          confirmedPhones={confirmedPhones}
          groupSearchOpenPhones={groupSearchOpenPhones}
          onGroupSearchStateChange={onGroupSearchStateChange}
          confirmedGroups={confirmedGroups}
          potentialGroups={potentialGroups}
          onStateChange={handleStateChange}
          onRemoveUser={onRemoveUser}
          isRecentlyRemoved={isRecentlyRemoved}
          recentlyRemovedPhones={recentlyRemovedPhones}
          onSetRepresentative={onSetRepresentative}
          currentRepresentativeGroupId={currentRepresentativeGroupId}
          onRepresentativeGroupChange={onRepresentativeGroupChange}
        />
      </div>
      <Bezel />
    </div>
  );
}