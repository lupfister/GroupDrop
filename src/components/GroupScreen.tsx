import svgPaths from "../imports/svg-eqjxskh8ti";
import { RigidBody } from "../utils/physics";

interface GroupScreenProps {
  confirmedUsers: RigidBody[];
  unconfirmedUsers: RigidBody[];
  onBack: () => void;
  tool: 'move' | 'interact';
}

export function BackButton({ onClick, tool }: { onClick: () => void; tool: 'move' | 'interact' }) {
  return (
    <div 
      className="relative size-[33.93px] cursor-pointer" 
      data-name="back-button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="absolute inset-[-68.18%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 81 81">
          <g filter="url(#filter0_d_17001_54)" id="back-button">
            <rect fill="var(--fill-0, #222222)" height="33.9303" rx="16.9652" width="33.9304" x="23.1343" y="23.1343" />
            <path d={svgPaths.pd789800} fill="var(--fill-0, #FEFEFE)" id="Chevron" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="80.199" id="filter0_d_17001_54" width="80.199" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset />
              <feGaussianBlur stdDeviation="11.5672" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_17001_54" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_17001_54" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
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

export function GroupScreen({ confirmedUsers, unconfirmedUsers, onBack, tool }: GroupScreenProps) {
  return (
    <div className="bg-black overflow-clip relative size-full" data-name="Screen" style={{ borderRadius: '24px', willChange: 'opacity, transform' }}>
      {/* Unconfirmed group members at bottom */}
      <div className="absolute bg-[#222222] left-[calc(50%+0.73px)] overflow-clip rounded-[400px] size-[400px] top-[calc(50%+315.5px)] translate-x-[-50%] translate-y-[-50%]" data-name="unconfirmed-groupmembers">
        <p className="absolute font-['SF_Pro:Regular',sans-serif] font-normal leading-[15.423px] left-[calc(50%-0.5px)] text-[11.567px] text-center text-nowrap text-white top-[calc(50%-44.48px)] tracking-[-0.1774px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          Waiting for Others...
        </p>
        
        {/* Unconfirmed user avatars */}
        {unconfirmedUsers.map((user, index) => {
          // Position users in a small cluster
          const positions = [
            { left: '207.14px', top: '102.13px', size: '42.105px' },
            { left: '149px', top: '48px', size: '69.172px' },
          ];
          const pos = positions[index % positions.length];
          
          return (
            <div 
              key={user.id}
              className="absolute rounded-[77.114px] overflow-hidden"
              style={{
                left: pos.left,
                top: pos.top,
                width: pos.size,
                height: pos.size,
                willChange: 'transform, opacity',
                animation: `fadeInScale 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both`,
              }}
            >
              <img 
                alt="" 
                className="absolute inset-0 max-w-none object-cover size-full" 
                src={user.profileImage} 
              />
            </div>
          );
        })}
      </div>
      
      {/* Group name badge */}
      <div className="absolute bg-[#222222] box-border content-stretch flex gap-[6.169px] items-center justify-center left-[calc(50%-0.01px)] px-[9.254px] py-[6.169px] rounded-[77.114px] shadow-[0px_0px_23.134px_0px_rgba(0,0,0,0.15)] top-[100.26px] translate-x-[-50%]" data-name="groupname" style={{ willChange: 'transform, opacity', animation: 'fadeInSlideDown 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}>
        <p className="font-['SF_Pro:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[12.338px] text-nowrap text-white tracking-[-0.116px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          {confirmedUsers.length > 0 
            ? confirmedUsers.map(user => user.name).join(', ')
            : 'New Group'}
        </p>
      </div>
      
      {/* Confirmed group members cluster is now owned by PhoneWithProximity's shared circle */}
      
      {/* Back button - only show when there are unconfirmed users */}
      {unconfirmedUsers.length > 0 && (
        <div className="absolute flex items-center justify-center left-[18.51px] size-[33.93px] top-[56.53px]" style={{ willChange: 'transform, opacity', animation: 'fadeInSlideRight 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both' }}>
          <div className="flex-none scale-y-[-100%]">
            <BackButton onClick={onBack} tool={tool} />
          </div>
        </div>
      )}
      
      <HomeIndicator />
      <StatusBar />
    </div>
  );
}
