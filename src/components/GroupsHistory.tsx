import React, { useEffect, useRef } from "react";
import { RigidBody } from "../utils/physics";
import { BackButton } from "./GroupScreen";
import svgPaths from "../imports/svg-eqjxskh8ti";

interface ConfirmedGroup {
  id: string;
  memberIds: Set<number>;
}

interface GroupsHistoryProps {
  confirmedGroups: Map<string, ConfirmedGroup>;
  allBodies: RigidBody[];
  onBack: () => void;
  tool: 'move' | 'interact';
  recentlyRemovedPhones?: Set<number>;
  onGroupClick?: (groupId: string) => void;
}

function HomeIndicator() {
  return (
    <div className="absolute bottom-[1.23px] h-[25.482px] left-[calc(50%-0.5px)] translate-x-[-50%] w-[309.532px]" data-name="Home Indicator">
      <div className="absolute bottom-[6px] flex h-[3.747px] items-center justify-center left-[calc(50%+0.37px)] translate-x-[-50%] w-[107.924px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-white h-[3.747px] rounded-[74.947px] w-[107.924px]" data-name="Home Indicator" />
        </div>
      </div>
    </div>
  );
}

function Time() {
  return (
    <div className="basis-0 box-border content-stretch flex gap-[7.711px] grow h-[16.965px] items-center justify-center min-h-px min-w-px pb-0 pt-[1.542px] px-0 relative shrink-0" data-name="Time">
      <p className="font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[16.965px] relative shrink-0 text-[13.109px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        9:41
      </p>
    </div>
  );
}

function Battery() {
  return (
    <div className="h-[10.025px] relative shrink-0 w-[21.074px]" data-name="Battery">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 11">
        <g id="Battery">
          <rect height="9.25373" id="Border" opacity="0.35" rx="2.93035" stroke="var(--stroke-0, white)" strokeWidth="0.771144" width="18.5075" x="0.385572" y="0.385572" />
          <path d={svgPaths.pc241080} fill="var(--fill-0, white)" id="Cap" opacity="0.4" />
          <rect fill="var(--fill-0, white)" height="6.9403" id="Capacity" rx="1.92786" width="16.194" x="1.54229" y="1.54229" />
        </g>
      </svg>
    </div>
  );
}

function Levels() {
  return (
    <div className="basis-0 box-border content-stretch flex gap-[5.398px] grow h-[16.965px] items-center justify-center min-h-px min-w-px pb-0 pt-[0.771px] px-0 relative shrink-0" data-name="Levels">
      <div className="h-[9.428px] relative shrink-0 w-[14.806px]" data-name="Cellular Connection">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 10">
          <path clipRule="evenodd" d={svgPaths.p1fc77680} fill="var(--fill-0, white)" fillRule="evenodd" id="Cellular Connection" />
        </svg>
      </div>
      <div className="h-[9.507px] relative shrink-0 w-[13.219px]" data-name="Wifi">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 10">
          <path clipRule="evenodd" d={svgPaths.p9cea70} fill="var(--fill-0, white)" fillRule="evenodd" id="Wifi" />
        </svg>
      </div>
      <Battery />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute box-border content-stretch flex gap-[118.756px] items-center justify-center left-0 pb-[14.652px] pt-[16.194px] px-[12.338px] top-[0.01px] w-[310px]" data-name="Status bar">
      <Time />
      <Levels />
    </div>
  );
}

export function GroupsHistory({ confirmedGroups, allBodies, onBack, tool, recentlyRemovedPhones, onGroupClick }: GroupsHistoryProps) {
  const groupsArray = Array.from(confirmedGroups.values());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Reset scroll position to top when component mounts or groups change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [groupsArray.length]);

  const handleGroupClick = (groupId: string) => {
    if (tool !== 'interact') return; // Prevent clicks in move mode
    if (onGroupClick) {
      onGroupClick(groupId);
    }
  };

  const handleGroupKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, groupId: string) => {
    if (tool !== 'interact') return; // Prevent keyboard interaction in move mode
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleGroupClick(groupId);
    }
  };
  
  return (
    <div className="bg-black overflow-hidden relative size-full" data-name="GroupsHistory" style={{ borderRadius: '24px', willChange: 'opacity, transform', viewTransitionName: 'messages-icon' }}>
      {/* Back button */}
      <div className="absolute flex items-center justify-center left-[18.51px] size-[33.93px] top-[56.53px]" style={{ willChange: 'transform, opacity', animation: 'fadeInSlideRight 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both' }}>
        <div className="flex-none scale-y-[-100%]">
          <BackButton onClick={onBack} tool={tool} />
        </div>
      </div>
      
      {/* Header */}
      <div style={{ 
        position: 'absolute',
        left: 0,
        right: 0,
        top: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'transform, opacity',
        animation: 'fadeInSlideDown 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
        zIndex: 10
      }}>
        <p className="font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] text-[20px] text-center text-white tracking-[-0.2px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Groups
        </p>
      </div>
      
      {/* Groups list */}
      <div 
        ref={scrollContainerRef}
        style={{ 
          position: 'absolute',
          left: 0,
          right: 0,
          top: '120px',
          bottom: 0,
          overflowY: 'auto',
          paddingLeft: '20px',
          paddingRight: '20px',
          zIndex: 5
        }}
      >
        {groupsArray.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '100%' }}>
            <p className="font-['SF_Pro:Regular',sans-serif] font-normal text-[16px] text-center text-white/60" style={{ fontVariationSettings: "'wdth' 100" }}>
              No groups yet
            </p>
            <p className="font-['SF_Pro:Regular',sans-serif] font-normal text-[14px] text-center text-white/40 mt-2" style={{ fontVariationSettings: "'wdth' 100" }}>
              Groups you join will appear here
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '32px', width: '100%', alignItems: 'stretch' }}>
            {groupsArray.map((group, index) => {
              const members = Array.from(group.memberIds)
                .map(id => allBodies.find(b => b.id === id))
                .filter((phone): phone is RigidBody => phone !== undefined);
              
              return (
                <div
                  key={group.id}
                  className="bg-[#222222] p-4 cursor-pointer transition-opacity hover:opacity-80 active:opacity-70"
                  style={{
                    borderRadius: '16px',
                    willChange: 'transform, opacity',
                    animation: `fadeInScale 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.05}s both`,
                  }}
                  tabIndex={tool === 'interact' ? 0 : -1}
                  aria-label={`Open Group ${group.id} with ${members.length} member${members.length !== 1 ? 's' : ''}`}
                  role="button"
                  onClick={() => handleGroupClick(group.id)}
                  onKeyDown={(e) => handleGroupKeyDown(e, group.id)}
                >
                  <div className="flex items-center mb-3" style={{ padding: '8px', gap: '16px' }}>
                    <div className="flex -space-x-2">
                      {members.slice(0, 4).map((member, i) => (
                        <div
                          key={member.id}
                          className="rounded-full overflow-hidden border-2 border-[#222222]"
                          style={{
                            width: '32px',
                            height: '32px',
                            zIndex: 10 - i,
                          }}
                        >
                          <img
                            alt=""
                            className="w-full h-full object-cover"
                            src={member.profileImage}
                          />
                        </div>
                      ))}
                      {members.length > 4 && (
                        <div
                          className="rounded-full bg-[#333333] border-2 border-[#222222] flex items-center justify-center"
                          style={{
                            width: '32px',
                            height: '32px',
                            zIndex: 1,
                          }}
                        >
                          <p className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[10px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                            +{members.length - 4}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Group {group.id}
                      </p>
                      <p className="font-['SF_Pro:Regular',sans-serif] font-normal mt-0.5" style={{ fontVariationSettings: "'wdth' 100", color: 'rgba(255, 255, 255, 0.7)', fontSize: '10px' }}>
                        {members.length} member{members.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Recently Removed Phones Section */}
        {recentlyRemovedPhones && recentlyRemovedPhones.size > 0 && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-white/60 mb-3" style={{ fontVariationSettings: "'wdth' 100" }}>
              Recently Removed Phones
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Array.from(recentlyRemovedPhones).map((phoneId) => {
                const phone = allBodies.find(b => b.id === phoneId);
                return (
                  <div
                    key={phoneId}
                    className="bg-[#333333] p-3"
                    style={{
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    {phone && (
                      <div
                        className="rounded-full overflow-hidden"
                        style={{
                          width: '24px',
                          height: '24px',
                        }}
                      >
                        <img
                          alt=""
                          className="w-full h-full object-cover"
                          src={phone.profileImage}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-['SF_Pro:Regular',sans-serif] font-normal text-[12px] text-white/80" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Phone {phoneId}
                      </p>
                      <p className="font-['SF_Pro:Regular',sans-serif] font-normal text-[10px] text-white/50 mt-0.5" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Removed - must move away to rejoin
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <StatusBar />
    </div>
  );
}
