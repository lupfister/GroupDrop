import svgPaths from "./svg-asrfm55hwp";
import imgWallpaper from "figma:asset/f4e8b98baf01df251fad69c06120eb2503116f35.png";
import imgIcon from "figma:asset/ea0a9c50994fde4fd9479186e0e4fe1f361463ca.png";
import imgIcon1 from "figma:asset/e51130db3e3410ac00bd0ca6daea130b9b3d1eec.png";
import imgIcon2 from "figma:asset/8c53afe72d54f5824fb239e5c984580fc3025888.png";
import imgIcon3 from "figma:asset/043bb985cddf6fd43276eb16e35b2e2a0da1515f.png";
import imgIcon4 from "figma:asset/7d8c54338d14a1f9afdfff1bec90c42375e5050e.png";
import imgIcon5 from "figma:asset/a96b215a3998f46bd64e605040650bcf6eeedb40.png";
import imgIcon6 from "figma:asset/9ca341c80a4541a890f7f3872b6a5bfd29b2d836.png";
import imgIcon7 from "figma:asset/78773f80a02247353c1a45c17b1c8d124e7f48f2.png";
import imgIcon8 from "figma:asset/37a538599af53a380f709fc4af04e1842e5d3636.png";
import imgIcon9 from "figma:asset/5b822ae7d3f8598ee6d115bd7bd4963f0870ff05.png";
import imgIcon10 from "figma:asset/320d23a874fbcfcf844fdf99592068da570f0817.png";
import imgIcon11 from "figma:asset/b4023bcb7a3142db521d41516e2073142e350edf.png";
import imgIcon12 from "figma:asset/c1fd97d4416077e93061a807620ee627b48a7d8e.png";
import imgIcon13 from "figma:asset/1baba0d1e98a4ecc8635b1c19251af7a919f8e01.png";
import imgIcon14 from "figma:asset/ff498477f2e36041a78684a3019b8fa9e783f0dc.png";
import imgIcon15 from "figma:asset/ab9306709315ca1ca8ea2df617a9af5a097c6bbc.png";
import imgCustomIconDefault from "figma:asset/9ee404c0ae57001eef8b631f83a9acce5f986f38.png";
import imgIcon16 from "figma:asset/be0ee9b967751c8796eabda800355dc882ddfd66.png";
import imgIcon17 from "figma:asset/b3c7d4cebbfc914ec87f981d05b6f31335c80f3f.png";
import imgIcon18 from "figma:asset/dd3b1a5ed7db644c197314328f647774bd86226e.png";
import imgIcon19 from "figma:asset/763e27ff64bf5bdaa996bbfac0837229d5d68fc6.png";

function Wallpaper() {
  return (
    <div className="absolute bottom-[0.02px] left-0 right-0 top-0" data-name="Wallpaper">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgWallpaper} />
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
    <div className="h-[10.025px] relative shrink-0 w-[21.073px]" data-name="Battery">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 11">
        <g id="Battery">
          <rect height="9.25373" id="Border" opacity="0.35" rx="2.93035" stroke="var(--stroke-0, white)" strokeWidth="0.771144" width="18.5075" x="0.385572" y="0.385572" />
          <path d={svgPaths.pc98db70} fill="var(--fill-0, white)" id="Cap" opacity="0.4" />
          <rect fill="var(--fill-0, white)" height="6.9403" id="Capacity" rx="1.92786" width="16.194" x="1.54207" y="1.54242" />
        </g>
      </svg>
    </div>
  );
}

function Levels() {
  return (
    <div className="basis-0 box-border content-stretch flex gap-[5.398px] grow h-[16.965px] items-center justify-center min-h-px min-w-px pb-0 pt-[0.771px] px-0 relative shrink-0" data-name="Levels">
      <div className="h-[9.428px] relative shrink-0 w-[14.806px]" data-name="Cellular Connection">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 10">
            <path clipRule="evenodd" d={svgPaths.p1fc77680} fill="var(--fill-0, white)" fillRule="evenodd" id="Cellular Connection" />
          </svg>
        </div>
      </div>
      <div className="h-[9.507px] relative shrink-0 w-[13.219px]" data-name="Wifi">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 10">
            <path clipRule="evenodd" d={svgPaths.p9cea70} fill="var(--fill-0, white)" fillRule="evenodd" id="Wifi" />
          </svg>
        </div>
      </div>
      <Battery />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="box-border content-stretch flex gap-[118.756px] items-center justify-center pb-[14.652px] pt-[16.194px] px-[12.338px] relative shrink-0 w-[310px]" data-name="Status Bar">
      <Time />
      <Levels />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon} />
    </div>
  );
}

function AppIcon() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        FaceTime
      </p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon1} />
    </div>
  );
}

function AppIcon1() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon1 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Calendar
      </p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon2} />
    </div>
  );
}

function AppIcon2() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon2 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Photos
      </p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon3} />
    </div>
  );
}

function AppIcon3() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon3 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Camera
      </p>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon4} />
    </div>
  );
}

function AppIcon4() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon4 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Mail
      </p>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon5} />
    </div>
  );
}

function AppIcon5() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon5 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Notes
      </p>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon6} />
    </div>
  );
}

function AppIcon6() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon6 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Reminders
      </p>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon7} />
    </div>
  );
}

function AppIcon7() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon7 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Clock
      </p>
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon8} />
    </div>
  );
}

function AppIcon8() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon8 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        News
      </p>
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon9} />
    </div>
  );
}

function AppIcon9() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon9 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        TV
      </p>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon10} />
    </div>
  );
}

function AppIcon10() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon10 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Games
      </p>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon11} />
    </div>
  );
}

function AppIcon11() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon11 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        App Store
      </p>
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon12} />
    </div>
  );
}

function AppIcon12() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon12 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Maps
      </p>
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon13} />
    </div>
  );
}

function AppIcon13() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon13 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Health
      </p>
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon14} />
    </div>
  );
}

function AppIcon14() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon14 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Wallet
      </p>
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon15} />
    </div>
  );
}

function AppIcon15() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon15 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Settings
      </p>
    </div>
  );
}

function Icon16() {
  return (
    <div className="overflow-clip relative shrink-0 size-[49.353px]" data-name="Icon">
      <div className="absolute aspect-[256/256] bottom-0 left-[calc(50%+0.32px)] top-0 translate-x-[-50%]" data-name="Custom-Icon-Default">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgCustomIconDefault} />
      </div>
    </div>
  );
}

function AppIcon16() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 w-[55.522px]" data-name="App Icon">
      <Icon16 />
      <p className="[text-shadow:#000000_0px_1.542px_19.279px] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[9.254px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        My App
      </p>
    </div>
  );
}

function Empty() {
  return <div className="h-[60.92px] shrink-0 w-[55.522px]" data-name="Empty" />;
}

function AppIcons() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="App Icons">
      <div className="size-full">
        <div className="box-border content-start grid grid-cols-4 gap-x-[17.3333px] gap-y-[17.3333px] items-start pb-0 pt-[22.106px] px-[20.05px] relative size-full">
          <AppIcon />
          <AppIcon1 />
          <AppIcon2 />
          <AppIcon3 />
          <AppIcon4 />
          <AppIcon5 />
          <AppIcon6 />
          <AppIcon7 />
          <AppIcon8 />
          <AppIcon9 />
          <AppIcon10 />
          <AppIcon11 />
          <AppIcon12 />
          <AppIcon13 />
          <AppIcon14 />
          <AppIcon15 />
          <AppIcon16 />
          {[...Array(3).keys()].map((_, i) => (
            <Empty key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchField() {
  return (
    <div className="bg-[rgba(0,0,0,0.2)] h-[23.134px] relative rounded-[77.114px] shrink-0" data-name="Search Field">
      <div className="box-border content-stretch flex font-['SF_Pro:Semibold',sans-serif] font-[590] gap-[1.542px] h-[23.134px] items-start leading-[12.338px] overflow-clip px-[9.254px] py-[5.398px] relative rounded-[inherit] text-[8.868px] text-center text-nowrap text-white whitespace-pre">
        <p className="relative shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>
          􀊫
        </p>
        <p className="relative shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>
          Search
        </p>
      </div>
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon16} />
    </div>
  );
}

function AppIcons1() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 size-[49.353px]" data-name="App Icons">
      <Icon17 />
    </div>
  );
}

function Icon18() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon17} />
    </div>
  );
}

function AppIcons2() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 size-[49.353px]" data-name="App Icons">
      <Icon18 />
    </div>
  );
}

function Icon19() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon18} />
    </div>
  );
}

function AppIcons3() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 size-[49.353px]" data-name="App Icons">
      <Icon19 />
    </div>
  );
}

function Icon20() {
  return (
    <div className="relative shrink-0 size-[49.353px]" data-name="Icon">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIcon19} />
    </div>
  );
}

function AppIcons4() {
  return (
    <div className="content-stretch flex flex-col gap-[3.856px] items-center relative shrink-0 size-[49.353px]" data-name="App Icons">
      <Icon20 />
    </div>
  );
}

function Dock() {
  return (
    <div className="backdrop-blur-[1.542px] backdrop-filter basis-0 bg-[rgba(0,0,0,0.2)] grow min-h-px min-w-px relative rounded-[29.303px] shrink-0" data-name="Dock">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-[14.652px] pt-[15.423px] px-[14.652px] relative w-full">
          <AppIcons1 />
          <AppIcons2 />
          <AppIcons3 />
          <AppIcons4 />
        </div>
      </div>
    </div>
  );
}

function Dock1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Dock">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex items-center justify-center pb-[13.109px] pt-[15.423px] px-[13.109px] relative w-full">
          <Dock />
        </div>
      </div>
    </div>
  );
}

export default function HomeScreenIPhone() {
  return (
    <div className="content-stretch flex flex-col items-center overflow-clip relative rounded-[24.677px] size-full" data-name="Home Screen - iPhone">
      <Wallpaper />
      <StatusBar />
      <AppIcons />
      <SearchField />
      <Dock1 />
    </div>
  );
}