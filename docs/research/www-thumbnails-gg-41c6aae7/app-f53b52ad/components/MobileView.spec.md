# MobileView Specification

## Overview
- **Target file:** `src/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/MobileView.tsx`
- **Source page:** https://www.thumbnails.gg/app
- **Interaction model:** infinite scroll inside an iPhone bezel + click-to-inspect

## Exact CSS (verbatim from the target's stylesheet)

These rules are ALREADY PRESENT in `src/app/globals.css` — the site's stylesheet was
ported wholesale during the foundation phase. Do NOT re-declare them and do NOT convert
them to Tailwind utilities. Use the class names below and the component will match the
original exactly. They are reproduced here so you can see what each class does.

```css
.ios-frame {
  transform-origin:50%;
  background:#000;
  border-radius:57px;
  flex-shrink:0;
  width:405px;
  padding:12px;
  box-shadow:0 0 0 2px #1c1c1e,0 40px 80px -24px #000c,inset 0 0 0 1px #ffffff0f
}
.ios-screen {
  aspect-ratio:393/852;
  background:var(--yt-bg);
  border-radius:45px;
  flex-direction:column;
  display:flex;
  position:relative;
  overflow:hidden
}
.ios-island {
  z-index:40;
  background:#000;
  border-radius:20px;
  width:116px;
  height:32px;
  position:absolute;
  top:11px;
  left:50%;
  transform:translate(-50%)
}
@media (max-height:960px) {
  .ios-frame {
    transform:scale(.9)
  }
  .lp-device-stage .ios-frame {
    transform:none
  }
}
@media (max-height:860px) {
  .ios-frame {
    transform:scale(.8)
  }
  .lp-device-stage .ios-frame {
    transform:none
  }
}
@media (max-height:760px) {
  .ios-frame {
    transform:scale(.7)
  }
  .lp-device-stage .ios-frame {
    transform:none
  }
}
.ytm-statusbar {
  height:50px;
  color:var(--yt-text-primary);
  flex-shrink:0;
  justify-content:space-between;
  align-items:center;
  padding:14px 28px 0;
  font-size:15px;
  font-weight:600;
  display:flex
}
.ytm-status-icons {
  align-items:center;
  gap:6px;
  display:flex
}
.ytm-masthead {
  background:var(--yt-bg);
  flex-shrink:0;
  justify-content:space-between;
  align-items:center;
  height:48px;
  padding:0 14px 0 12px;
  display:flex
}
.ytm-logo {
  color:var(--yt-text-primary);
  align-items:center;
  gap:4px;
  display:flex
}
.ytm-premium {
  letter-spacing:-.3px;
  font-size:17px;
  font-weight:700
}
.ytm-mast-icons {
  color:var(--yt-icon);
  align-items:center;
  gap:20px;
  display:flex
}
.ytm-bell {
  position:relative
}
.ytm-bell-badge {
  color:#fff;
  text-align:center;
  background:#c00;
  border-radius:8px;
  min-width:15px;
  height:15px;
  padding:0 4px;
  font-size:10px;
  font-weight:500;
  line-height:15px;
  position:absolute;
  top:-5px;
  right:-7px
}
.ytm-chipbar {
  scrollbar-width:none;
  flex-shrink:0;
  align-items:center;
  gap:8px;
  height:50px;
  padding:0 12px;
  display:flex;
  overflow-x:auto
}
.ytm-chipbar::-webkit-scrollbar {
  display:none
}
.ytm-explore {
  border:1px solid var(--yt-divider);
  width:32px;
  height:32px;
  color:var(--yt-text-primary);
  border-radius:50%;
  flex-shrink:0;
  justify-content:center;
  align-items:center;
  display:flex
}
.ytm-chip {
  background:var(--yt-chip-bg);
  height:32px;
  color:var(--yt-chip-text);
  white-space:nowrap;
  border:none;
  border-radius:8px;
  flex-shrink:0;
  padding:0 12px;
  font-size:13px;
  font-weight:500;
  line-height:32px
}
.ytm-chip[data-selected=true] {
  background:var(--yt-chip-sel-bg);
  color:var(--yt-chip-sel-text)
}
.ytm-feed {
  scrollbar-width:none;
  flex:1;
  overflow-y:auto
}
.ytm-feed::-webkit-scrollbar {
  display:none
}
.ytm-card {
  margin-bottom:12px
}
.ytm-thumb-wrap {
  aspect-ratio:16/9;
  background:var(--yt-skeleton);
  width:100%;
  position:relative
}
.ytm-thumb-img {
  width:100%;
  height:100%;
  display:block
}
.ytm-info {
  gap:12px;
  padding:12px 12px 4px;
  display:flex
}
.ytm-avatar {
  background:var(--yt-skeleton);
  border-radius:50%;
  flex-shrink:0;
  width:36px;
  height:36px;
  overflow:hidden
}
.ytm-avatar img {
  object-fit:cover;
  width:100%;
  height:100%;
  display:block
}
.ytm-text {
  flex:1;
  min-width:0
}
.ytm-title {
  color:var(--yt-text-primary);
  -webkit-line-clamp:2;
  line-clamp:2;
  -webkit-box-orient:vertical;
  margin:0 0 4px;
  font-size:14px;
  font-weight:500;
  line-height:20px;
  display:-webkit-box;
  overflow:hidden
}
.ytm-meta {
  color:var(--yt-text-secondary);
  white-space:nowrap;
  text-overflow:ellipsis;
  font-size:12px;
  line-height:16px;
  overflow:hidden
}
.ytm-dots {
  color:var(--yt-text-primary);
  flex-shrink:0;
  margin-top:2px
}
.ytm-tabbar {
  border-top:1px solid var(--yt-divider);
  background:var(--yt-bg);
  flex-shrink:0;
  justify-content:space-around;
  align-items:center;
  height:52px;
  padding-bottom:2px;
  display:flex
}
.ytm-tab {
  color:var(--yt-text-primary);
  flex-direction:column;
  align-items:center;
  gap:3px;
  font-size:10px;
  display:flex
}
.ytm-card[data-test=true][data-highlight=true] .ytm-thumb-wrap {
  outline-offset:-2px;
  outline:2px solid #fff
}
```


## Deobfuscated source from the target JS bundle

Recovered from the production bundle. `JSX(tag, props)` is `React.createElement`.
Reconstruct as idiomatic strictly-typed TSX — same DOM, class names, inline styles, values.

## MobileView + mobile VideoCard

```js
),
JSX("div",{className:"ytm-info",
children:[
JSX("div",{className:"ytm-avatar",
children:e.avatar?
JSX("img",{src:e.avatar,
alt:"",
draggable:!1}):
JSX("span",{className:"yt-monogram",
style:{background:(0,i.monogramColor)(e.channel)},
children:e.channel.trim().charAt(0).toUpperCase()||"?"})}),
JSX("div",{className:"ytm-text",
children:[
JSX("h3",{className:"ytm-title",
children:e.title}),
JSX("div",{className:"ytm-meta",
children:`${e.channel} \xb7 ${e.views} \xb7 ${e.age}`})]}),
JSX("span",{className:"ytm-dots",
children:
JSX(h.IconKebabVertical,{size:18})})]})]})}e.s(["VideoCard",0,u],58101),e.s(["useInfiniteScroll",0,f],5716),e.s(["DesktopSurface",0,function({cards:e,
columns:l,
blur:n,
grayscale:i,
highlight:o,
showSafeArea:c,
guideExpanded:d=!1,
scrollRootRef:h,
resetKey:u}){return
JSX(t.Fragment,{children:[
JSX(a.Masthead,{}),
JSX("div",{className:"yt-body",
children:[
JSX(s.MiniGuide,{expanded:d}),
JSX("div",{className:"yt-feed",
children:[
JSX(r.ChipBar,{}),
JSX(m,{cards:e,
columns:l,
blur:n,
grayscale:i,
highlight:o,
showSafeArea:c,
scrollRootRef:h,
resetKey:u})]})]})]})}],42041);var p=e.i(49556);
function C(){return
JSX("svg",{width:"20",
height:"20",
viewBox:"0 0 24 24",
fill:"none",
children:[
JSX("circle",{cx:"12",
cy:"12",
r:"9",
stroke:"currentColor",
strokeWidth:"1.5"}),
JSX("path",{d:"M15.5 8.5l-2 5-5 2 2-5 5-2z",
fill:"currentColor"})]})}
let y=["All","xQc","Podcasts","Gaming","Law enforcement","Music","Live"];
function v(){return
JSX("svg",{width:"18",
height:"12",
viewBox:"0 0 18 12",
fill:"currentColor",
children:[
JSX("rect",{x:"0",
y:"8",
width:"3",
height:"4",
rx:"1"}),
JSX("rect",{x:"5",
y:"5",
width:"3",
height:"7",
rx:"1"}),
JSX("rect",{x:"10",
y:"2.5",
width:"3",
height:"9.5",
rx:"1"}),
JSX("rect",{x:"15",
y:"0",
width:"3",
height:"12",
rx:"1"})]})}
function g(){return
JSX("svg",{width:"17",
height:"12",
viewBox:"0 0 17 12",
fill:"currentColor",
children:[
JSX("path",{d:"M8.5 2.2c2.7 0 5.2 1 7 2.8l-1.5 1.6A7.6 7.6 0 008.5 4.4 7.6 7.6 0 003 6.6L1.5 5C3.3 3.2 5.8 2.2 8.5 2.2z"}),
JSX("path",{d:"M8.5 6c1.5 0 2.9.6 3.9 1.6L8.5 11 4.6 7.6A5.4 5.4 0 018.5 6z"})]})}
function b(){return
JSX("svg",{width:"26",
height:"13",
viewBox:"0 0 26 13",
fill:"none",
children:[
JSX("rect",{x:"0.5",
y:"0.5",
width:"22",
height:"12",
rx:"3.5",
stroke:"currentColor",
opacity:"0.5"}),
JSX("rect",{x:"2",
y:"2",
width:"16",
height:"9",
rx:"2",
fill:"currentColor"}),
JSX("rect",{x:"24",
y:"4",
width:"1.5",
height:"5",
rx:"0.75",
fill:"currentColor",
opacity:"0.5"})]})}e.s(["MobileView",0,function({cards:e,
blur:a,
grayscale:s,
highlight:r,
showSafeArea:i,
resetKey:o}){
let c=(0,n.useFeed)(e=>e.setInspect),d=(0,n.useFeed)(e=>e.uploadHandler),u=(0,n.useFeed)(e=>e.dropHandler),x=l.useRef(null),{visible:m,
sentinelRef:M}=f(e,{rootRef:x,
resetKey:o}),L=[];a>0&&L.push(`blur(${a}px)`),s&&L.push("grayscale(1)");
let N=L.length?L.join(" "):void 0;return
JSX("div",{className:"ios-frame",
children:
JSX("div",{className:"ios-screen",
children:[
JSX("div",{className:"ios-island"}),
JSX("div",{className:"ytm-statusbar",
children:[
JSX("span",{children:"9:41"}),
JSX("span",{className:"ytm-status-icons",
style:{color:"var(--yt-text-primary)"},
children:[
JSX(v,{}),
JSX(g,{}),
JSX(b,{})]})]}),
JSX("div",{className:"ytm-masthead",
children:[
JSX("span",{className:"ytm-logo",
children:
JSX(p.YouTubeLogo,{height:20})}),
JSX("span",{className:"ytm-mast-icons",
children:[
JSX(h.IconCast,{size:24}),
JSX("span",{className:"ytm-bell",
children:[
JSX(h.IconBell,{size:22}),
JSX("span",{className:"ytm-bell-badge",
children:"9+"})]}),
JSX(h.IconSearch,{size:22})]})]}),
JSX("div",{className:"ytm-chipbar",
children:[
JSX("span",{className:"ytm-explore",
children:
JSX(C,{})}),y.map((e,a)=>
JSX("span",{className:"ytm-chip","data-selected":0===a,
children:e},e))]}),
JSX("div",{ref:x,
className:"ytm-feed",
style:{filter:N,
transition:"filter var(--dur-base) var(--ease-out)"},
children:[m.map(e=>
JSX(j,{vm:e,
highlight:e.isTest&&r,
showSafeArea:i,
onClick:()=>e.isPlaceholder?d?.():c(e),
onDragOver:e.isTest?e=>e.preventDefault():void 0,
onDrop:e.isTest?e=>{e.preventDefault(),u?.(Array.from(e.dataTransfer.files))}:void 0},e.id)),
JSX("div",{ref:M,"aria-hidden":!0,
style:{height:1}})]}),
JSX("div",{className:"ytm-tabbar",
children:[
JSX("span",{className:"ytm-tab",
children:[
JSX(h.IconHome,{size:24}),"Home"]}),
JSX("span",{className:"ytm-tab",
style:{color:"var(--yt-text-secondary)"},
children:[
JSX(h.IconShorts,{size:24}),"Shorts"]}),
JSX("span",{className:"ytm-tab",
children:
JSX("svg",{width:"34",
height:"34",
viewBox:"0 0 34 34",
fill:"none",
children:[
JSX("circle",{cx:"17",
cy:"17",
r:"16",
stroke:"currentColor",
strokeWidth:"1.4",
opacity:"0.5"}),
JSX("path",{d:"M17 11v12M11 17h12",
stroke:"currentColor",
strokeWidth:"1.8",
strokeLinecap:"round"})]})}),
JSX("span",{className:"ytm-tab",
style:{color:"var(--yt-text-secondary)"},
children:[
JSX(h.IconSubscriptions,{size:24}),"Subscriptions"]}),
JSX("span",{className:"ytm-tab",
style:{color:"var(--yt-text-secondary)"},
children:[
JSX(h.IconAccount,
```
