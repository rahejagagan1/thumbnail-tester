# DesktopSurface Specification

## Overview
- **Target file:** `src/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/DesktopSurface.tsx`
- **Source page:** https://www.thumbnails.gg/app
- **Interaction model:** infinite scroll + click-to-inspect; grid columns via ResizeObserver

## Exact CSS (verbatim from the target's stylesheet)

These rules are ALREADY PRESENT in `src/app/globals.css` — the site's stylesheet was
ported wholesale during the foundation phase. Do NOT re-declare them and do NOT convert
them to Tailwind utilities. Use the class names below and the component will match the
original exactly. They are reproduced here so you can see what each class does.

```css
.yt-root {
  font-family:var(--font-roboto), Roboto, Arial, sans-serif;
  -webkit-font-smoothing:antialiased
}
.yt-root[data-theme=dark] {
  --yt-bg:#0f0f0f;
  --yt-text-primary:#f1f1f1;
  --yt-text-secondary:#aaa;
  --yt-icon:#f1f1f1;
  --yt-search-bg:#121212;
  --yt-search-border:#303030;
  --yt-search-btn-bg:#222;
  --yt-search-btn-hover:#272727;
  --yt-voice-bg:#181818;
  --yt-voice-hover:#313131;
  --yt-chip-bg:#272727;
  --yt-chip-text:#f1f1f1;
  --yt-chip-hover:#3d3d3d;
  --yt-chip-sel-bg:#f1f1f1;
  --yt-chip-sel-text:#0f0f0f;
  --yt-hover:#ffffff1a;
  --yt-divider:#ffffff1a;
  --yt-skeleton:#272727;
  --yt-create-bg:#ffffff1a
}
.yt-root[data-theme=light] {
  --yt-bg:#fff;
  --yt-text-primary:#0f0f0f;
  --yt-text-secondary:#606060;
  --yt-icon:#0f0f0f;
  --yt-search-bg:#fff;
  --yt-search-border:#ccc;
  --yt-search-btn-bg:#f8f8f8;
  --yt-search-btn-hover:#f0f0f0;
  --yt-voice-bg:#f2f2f2;
  --yt-voice-hover:#e5e5e5;
  --yt-chip-bg:#f2f2f2;
  --yt-chip-text:#0f0f0f;
  --yt-chip-hover:#e5e5e5;
  --yt-chip-sel-bg:#0f0f0f;
  --yt-chip-sel-text:#fff;
  --yt-hover:#0000000d;
  --yt-divider:#0000001a;
  --yt-skeleton:#e5e5e5;
  --yt-create-bg:#0000000d
}
.yt-root {
  background:var(--yt-bg);
  color:var(--yt-text-primary)
}
.yt-masthead {
  background:var(--yt-bg);
  z-index:20;
  justify-content:space-between;
  align-items:center;
  height:56px;
  padding:0 16px;
  display:flex;
  position:sticky;
  top:0
}
.yt-icon-btn {
  width:40px;
  height:40px;
  color:var(--yt-icon);
  cursor:pointer;
  background:0 0;
  border:none;
  border-radius:50%;
  justify-content:center;
  align-items:center;
  display:flex
}
.yt-icon-btn:hover {
  background:var(--yt-hover)
}
.yt-masthead-start {
  align-items:center;
  gap:16px;
  min-width:169px;
  display:flex
}
.yt-masthead-center {
  flex:0 728px;
  align-items:center;
  gap:8px;
  max-width:728px;
  margin:0 40px;
  display:flex
}
.yt-masthead-end {
  justify-content:flex-end;
  align-items:center;
  gap:8px;
  min-width:169px;
  display:flex
}
.yt-search-form {
  flex:1;
  max-width:640px;
  height:40px;
  display:flex
}
.yt-search-input {
  border:1px solid var(--yt-search-border);
  background:var(--yt-search-bg);
  height:40px;
  color:var(--yt-text-primary);
  border-right:none;
  border-radius:40px 0 0 40px;
  outline:none;
  flex:1;
  padding:0 16px;
  font-family:inherit;
  font-size:16px
}
.yt-search-input::placeholder {
  color:var(--yt-text-secondary)
}
.yt-search-btn {
  border:1px solid var(--yt-search-border);
  background:var(--yt-search-btn-bg);
  width:64px;
  height:40px;
  color:var(--yt-icon);
  cursor:pointer;
  border-radius:0 40px 40px 0;
  justify-content:center;
  align-items:center;
  display:flex
}
.yt-search-btn:hover {
  background:var(--yt-search-btn-hover)
}
.yt-voice-btn {
  background:var(--yt-voice-bg);
  width:40px;
  height:40px;
  color:var(--yt-icon);
  cursor:pointer;
  border:none;
  border-radius:50%;
  flex-shrink:0;
  justify-content:center;
  align-items:center;
  display:flex
}
.yt-voice-btn:hover {
  background:var(--yt-voice-hover)
}
.yt-create-btn {
  background:var(--yt-create-bg);
  height:36px;
  color:var(--yt-text-primary);
  cursor:pointer;
  white-space:nowrap;
  border:none;
  border-radius:18px;
  align-items:center;
  gap:6px;
  padding:0 16px 0 12px;
  font-family:inherit;
  font-size:14px;
  font-weight:500;
  display:flex
}
.yt-create-btn:hover {
  filter:brightness(1.4)
}
.yt-bell-wrap {
  position:relative
}
.yt-bell-badge {
  color:#fff;
  text-align:center;
  background:#c00;
  border-radius:7px;
  min-width:14px;
  height:14px;
  padding:0 4px;
  font-size:11px;
  font-weight:400;
  line-height:14px;
  position:absolute;
  top:4px;
  right:4px
}
.yt-avatar-btn {
  cursor:pointer;
  border:none;
  border-radius:50%;
  flex-shrink:0;
  width:32px;
  height:32px;
  margin-left:8px;
  padding:0;
  overflow:hidden
}
.yt-body {
  display:flex
}
.yt-mini-guide {
  background:var(--yt-bg);
  flex-shrink:0;
  width:72px;
  height:calc(100vh - 56px);
  padding-top:0;
  position:sticky;
  top:56px
}
.yt-mini-item {
  color:var(--yt-text-primary);
  cursor:pointer;
  border-radius:10px;
  flex-direction:column;
  align-items:center;
  gap:6px;
  margin:0 4px;
  padding:16px 0 14px;
  display:flex
}
.yt-mini-item:hover,.yt-mini-item[data-active=true] {
  background:var(--yt-hover)
}
.yt-mini-label {
  font-size:10px;
  font-weight:400;
  line-height:1.4
}
.yt-guide {
  background:var(--yt-bg);
  scrollbar-width:thin;
  scrollbar-color:transparent transparent;
  flex-shrink:0;
  width:240px;
  height:calc(100vh - 56px);
  padding:12px;
  position:sticky;
  top:56px;
  overflow-y:auto
}
.yt-guide:hover {
  scrollbar-color:var(--yt-text-secondary) transparent
}
.yt-guide::-webkit-scrollbar {
  width:8px
}
.yt-guide::-webkit-scrollbar-thumb {
  background:0 0;
  border-radius:4px
}
.yt-guide:hover::-webkit-scrollbar-thumb {
  background:#fff3
}
.yt-guide-divider {
  border-top:1px solid var(--yt-hover);
  margin:12px 0
}
.yt-guide-row {
  height:40px;
  color:var(--yt-text-primary);
  cursor:pointer;
  border-radius:10px;
  align-items:center;
  gap:24px;
  padding:0 12px;
  display:flex
}
.yt-guide-row:hover {
  background:var(--yt-hover)
}
.yt-guide-row[data-active=true] {
  background:var(--yt-hover);
  font-weight:500
}
.yt-guide-icon {
  flex-shrink:0;
  width:24px;
  height:24px;
  display:flex
}
.yt-guide-label {
  white-space:nowrap;
  text-overflow:ellipsis;
  flex:1;
  min-width:0;
  font-size:14px;
  line-height:1;
  overflow:hidden
}
.yt-guide-header {
  color:var(--yt-text-primary);
  align-items:center;
  gap:4px;
  padding:6px 12px;
  font-size:16px;
  font-weight:500;
  display:flex
}
.yt-guide-header-chevron {
  display:flex
}
.yt-guide-avatar {
  background:var(--yt-hover);
  border-radius:50%;
  flex-shrink:0;
  justify-content:center;
  align-items:center;
  width:24px;
  height:24px;
  display:flex;
  overflow:hidden
}
.yt-guide-avatar img {
  object-fit:cover;
  width:100%;
  height:100%;
  display:block
}
.yt-guide-monogram {
  color:#fff;
  justify-content:center;
  align-items:center;
  width:100%;
  height:100%;
  font-size:12px;
  font-weight:500;
  display:flex
}
.yt-guide-live {
  color:#f03;
  flex-shrink:0;
  display:flex
}
.yt-guide-dot {
  background:#3ea6ff;
  border-radius:50%;
  flex-shrink:0;
  width:8px;
  height:8px
}
.yt-chipbar {
  z-index:10;
  background:var(--yt-bg);
  scrollbar-width:none;
  align-items:center;
  gap:12px;
  height:56px;
  padding:0 24px;
  display:flex;
  position:sticky;
  top:56px;
  overflow-x:auto
}
.yt-chipbar::-webkit-scrollbar {
  display:none
}
.yt-chip {
  background:var(--yt-chip-bg);
  height:32px;
  color:var(--yt-chip-text);
  white-space:nowrap;
  cursor:pointer;
  border:none;
  border-radius:8px;
  flex-shrink:0;
  padding:0 12px;
  font-size:14px;
  font-weight:500;
  line-height:32px
}
.yt-chip:hover {
  background:var(--yt-chip-hover)
}
.yt-chip[data-selected=true] {
  background:var(--yt-chip-sel-bg);
  color:var(--yt-chip-sel-text)
}
.yt-feed {
  flex:1;
  min-width:0
}
.yt-grid {
  grid-template-columns:repeat(var(--yt-cols,4), minmax(0, 1fr));
  gap:40px 16px;
  padding:16px 24px 64px;
  display:grid
}
.yt-card {
  cursor:pointer;
  position:relative
}
.yt-thumb-wrap {
  aspect-ratio:16/9;
  background:var(--yt-skeleton);
  border-radius:12px;
  position:relative;
  overflow:hidden
}
.yt-thumb-img {
  width:100%;
  height:100%;
  display:block
}
.yt-duration {
  color:#fff;
  background:#000c;
  border-radius:4px;
  padding:3px 4px;
  font-size:12px;
  font-weight:500;
  line-height:12px;
  position:absolute;
  bottom:8px;
  right:8px
}
.yt-duration[data-live=true] {
  background:#c00
}
.yt-progress-track {
  background:#ffffff4d;
  height:4px;
  position:absolute;
  bottom:0;
  left:0;
  right:0
}
.yt-progress-fill {
  background:red;
  height:100%
}
.yt-card-details {
  align-items:flex-start;
  gap:12px;
  padding-top:12px;
  display:flex
}
.yt-card-avatar {
  background:var(--yt-skeleton);
  border-radius:50%;
  flex-shrink:0;
  width:36px;
  height:36px;
  overflow:hidden
}
.yt-card-avatar img,.yt-avatar-btn img {
  object-fit:cover;
  width:100%;
  height:100%;
  display:block
}
.yt-card-text {
  flex:1;
  min-width:0
}
.yt-card-title {
  color:var(--yt-text-primary);
  -webkit-line-clamp:2;
  line-clamp:2;
  -webkit-box-orient:vertical;
  margin:0 0 4px;
  font-size:16px;
  font-weight:500;
  line-height:22px;
  display:-webkit-box;
  overflow:hidden
}
.yt-card-channel,.yt-card-meta {
  color:var(--yt-text-secondary);
  white-space:nowrap;
  text-overflow:ellipsis;
  align-items:center;
  gap:4px;
  font-size:12px;
  font-weight:400;
  line-height:18px;
  display:flex;
  overflow:hidden
}
.yt-verified {
  flex-shrink:0
}
.yt-card-menu {
  width:36px;
  height:36px;
  color:var(--yt-text-primary);
  opacity:0;
  border-radius:50%;
  flex-shrink:0;
  justify-content:center;
  align-items:center;
  display:flex
}
.yt-card:hover .yt-card-menu {
  opacity:1
}
.yt-card-menu:hover {
  background:var(--yt-hover)
}
.yt-monogram {
  color:#fff;
  justify-content:center;
  align-items:center;
  width:100%;
  height:100%;
  font-size:16px;
  font-weight:500;
  display:flex
}
.yt-card[data-test=true][data-highlight=true] .yt-thumb-wrap {
  outline-offset:3px;
  outline:2px solid #fff
}
.yt-safe-overlay {
  pointer-events:none;
  z-index:2;
  position:absolute;
  inset:0
}
.yt-safe-badge-zone {
  background:#ff3c3c2e;
  border:1px dashed #ff3c3ce6;
  border-radius:4px;
  width:56px;
  height:20px;
  position:absolute;
  bottom:8px;
  right:8px
}
.ytw-reco-thumb .yt-safe-badge-zone {
  width:40px;
  height:14px;
  bottom:6px;
  right:6px
}
```


## Deobfuscated source from the target JS bundle

Recovered from the production bundle. `JSX(tag, props)` is `React.createElement`.
Reconstruct as idiomatic strictly-typed TSX — same DOM, class names, inline styles, values.

## Masthead

```js
13.81 11.02 14.00 11.50 14 12L13.99 12.20C13.95 12.58 13.80 12.95 13.55 13.25C13.31 13.55 12.98 13.78 12.62 13.90C12.25 14.02 11.85 14.03 11.48 13.93C11.11 13.83 10.77 13.62 10.51 13.34C10.25 13.05 10.08 12.69 10.02 12.31C9.96 11.93 10.01 11.54 10.17 11.18C10.32 10.83 10.58 10.53 10.91 10.32C11.23 10.11 11.61 10.00 12 10",
fill:"currentColor"})}),I=e=>
JSX(s,{...e,
children:[
JSX("circle",{fill:"#FF0033",
cx:"12",
cy:"12",
r:"11"}),
JSX("path",{fill:"#FFFFFF",
d:"M12,6.25c3.17,0,5.75,2.58,5.75,5.75s-2.58,5.75-5.75,5.75S6.25,15.17,6.25,12S8.83,6.25,12,6.25 M12,5.25c-3.73,0-6.75,3.02-6.75,6.75s3.02,6.75,6.75,6.75s6.75-3.02,6.75-6.75S15.73,5.25,12,5.25L12,5.25z"}),
JSX("polygon",{fill:"#FFFFFF",
points:"10,15 15,12 10,9"})]}),S=e=>
JSX(s,{...e,
children:[
JSX("path",{fill:"#FF0033",
d:"M22.64,13.2c-0.01-1.04-0.62-5.98-0.9-6.74c-0.19-0.5-0.58-1.4-1.31-1.95c-0.94-0.7-1.7-0.83-2.68-0.85C17.06,3.64,6.12,5.03,4.79,5.51C3.8,5.88,3.03,6.35,2.42,6.95c-0.99,0.98-1.18,1.93-1.02,3.6c0.14,1.52,0.85,6.55,1.21,7.59c0.39,1.15,1.11,2.03,2.3,2.16c3.62,0.39,4.48-1.6,12.9-1.58c2.55,0.01,3.82-1.11,4.35-2.08C22.77,15.49,22.65,13.99,22.64,13.2z"}),
JSX("polygon",{fill:"#FFFFFF",
points:"10,15 15,12 10,9"})]});e.s(["IconAccount",0,m,"IconBell",0,o,"IconCast",0,e=>
JSX(s,{...e,
viewBox:"0 0 36 36",
children:
JSX("path",{d:"M7,24 L7,27 L10,27 C10,25.34 8.66,24 7,24 L7,24 Z M7,20 L7,22 C9.76,22 12,24.24 12,27 L14,27 C14,23.13 10.87,20 7,20 L7,20 Z M25,13 L11,13 L11,14.63 C14.96,15.91 18.09,19.04 19.37,23 L25,23 L25,13 L25,13 Z M7,16 L7,18 C11.97,18 16,22.03 16,27 L18,27 C18,20.92 13.07,16 7,16 L7,16 Z M27,9 L9,9 C7.9,9 7,9.9 7,11 L7,14 L9,14 L9,11 L27,11 L27,25 L20,25 L20,27 L27,27 C28.1,27 29,26.1 29,25 L29,11 C29,9.9 28.1,9 27,9 L27,9 Z",
fill:"currentColor"})}),"IconChevronDown",0,f,"IconChevronRight",0,u,"IconCreate",0,i,"IconDownloads",0,b,"IconExploreLive",0,N,"IconExploreMusic",0,M,"IconHistory",0,p,"IconHome",0,c,"IconKebab",0,e=>
JSX(s,{...e,
children:
JSX("path",{d:"M6 10a2 2 0 100 4 2 2 0 000-4Zm6 0a2 2 0 100 4 2 2 0 000-4Zm6 0a2 2 0 100 4 2 2 0 000-4Z",
fill:"currentColor"})}),"IconKebabVertical",0,e=>
JSX(s,{...e,
viewBox:"-5 -5 36 36",
children:
JSX("path",{d:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
fill:"currentColor"})}),"IconLiked",0,v,"IconLive",0,x,"IconMenu",0,r,"IconMic",0,n,"IconMovies",0,L,"IconPlaylists",0,C,"IconReportHistory",0,w,"IconSearch",0,l,"IconSettings",0,Z,"IconShorts",0,d,"IconSubscriptions",0,h,"IconVerified",0,e=>
JSX(s,{...e,
children:
JSX("path",{d:"M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Zm5.707 7.293a1 1 0 010 1.414L10 17.414l-3.707-3.707a1 1 0 111.414-1.414L10 14.586l6.293-6.293a1 1 0 011.414 0Z",
fill:"currentColor"})}),"IconWatchLater",0,y,"IconYouTubeKids",0,S,"IconYouTubeMusic",0,I,"IconYourChannel",0,j,"IconYourVideos",0,g],26101),e.s(["Masthead",0,function(){return
JSX("header",{className:"yt-masthead",
children:[
JSX("div",{className:"yt-masthead-start",
children:[
JSX("button",{className:"yt-icon-btn","aria-label":"Menu",
tabIndex:-1,
children:
JSX(r,{})}),
JSX("span",{style:{color:"var(--yt-text-primary)",
display:"flex",
alignItems:"center"},
children:
JSX(a,{})})]}),
JSX("div",{className:"yt-masthead-center",
children:[
JSX("form",{className:"yt-search-form",
onSubmit:e=>e.preventDefault(),
children:[
JSX("input",{className:"yt-search-input",
placeholder:"Search","aria-label":"Search"}),
JSX("button",{className:"yt-search-btn","aria-label":"Search",
tabIndex:-1,
children:
JSX(l,{size:22})})]}),
JSX("button",{className:"yt-voice-btn","aria-label":"Search with your voice",
tabIndex:-1,
children:
JSX(n,{size:22})})]}),
JSX("div",{className:"yt-masthead-end",
children:[
JSX("button",{className:"yt-icon-btn","aria-label":"Create",
tabIndex:-1,
children:
JSX(i,{})}),
JSX("span",{className:"yt-bell-wrap",
children:[
JSX("button",{className:"yt-icon-btn","aria-label":"Notifications",
tabIndex:-1,
children:
JSX(o,{})}),
JSX("span",{className:"yt-bell-badge",
children:"9+"})]}),
JSX("button",{className:"yt-avatar-btn","aria-label":"Account",
tabIndex:-1,
children:
JSX("span",{style:{width:"100%",
height:"100%",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"#3a5",
color:"#fff",
fontWeight:500,
fontSize:14},
children:"Y"})})]})]})}],84845);
let H={"2h":"2 hours ago","1d":"1 day ago","3d":"3 days ago","1w":"1 week ago","2w":"2 weeks ago","1mo":"1 month ago","6mo":"6 months ago","1y":"1 year ago"},A=Object.entries(H).map(([e,t])=>({value:e,
label:t}));
function V(e){
let t=0x811c9dc5;for(
let a=0;a<e.length;a++)t^=e.charCodeAt(a),t=Math.imul(t,0x1000193);return t>>>0}
function T(e){
let t=V(e)%360;return`hsl(${t} 32% 38%)`}e.s(["AGE_OPTIONS",0,A,"formatAge",0,function(e){return H[e]?H[e]:e},"formatViews
```

## MiniGuide / Guide / ChipBar

```js

let k=[{name:"MrBeast",
avatar:"https://yt3.ggpht.com/nxYrc_1_2f77DoBadyxMTmv7ZpRZapHR5jbuYe7PlPd5cIRJxtNNEYyOC0ZsxaDyJJzXrnJiuDE=s800-c-k-c0x00ffffff-no-rj",
newDot:!0},{name:"Mark Rober",
avatar:"https://yt3.ggpht.com/ytc/AIdro_ksXY2REjZ6gYKSgnWT5jC_zT9mX900vyFtVinR8KbHww=s800-c-k-c0x00ffffff-no-rj",
newDot:!0},{name:"Dude Perfect",
avatar:"https://yt3.ggpht.com/nZRsCgyfOVFhBzY-YFV8AhdMcYAybNZ8uttjcsrUGOnGRSVF5yKqRh6XHIs_o03TcbixvlOZ=s800-c-k-c0x00ffffff-no-rj",
live:!0},{name:"Zach King",
avatar:"https://yt3.ggpht.com/ytc/AIdro_kik7i7hId8EjFMERTw3_j8ODyhoot8JF3iUJRs53htOJc=s800-c-k-c0x00ffffff-no-rj"},{name:"Michelle Khare",
avatar:"https://yt3.ggpht.com/ytc/AIdro_ll42qUILSk__20jYy2w6SH2qgOkWgQAK383pCJ-V_P07o=s800-c-k-c0x00ffffff-no-rj"},{name:"Yes Theory",
avatar:"https://yt3.ggpht.com/bdI_oMvgn9Ib9rwv89h89Xd5TcOh2K2DEgzsJdi1dfzXPXLXj2ARFTGzs9oOu_xQLHsCjj2E=s800-c-k-c0x00ffffff-no-rj"},{name:"Colin and Samir",
avatar:"https://yt3.ggpht.com/ytc/AIdro_k-3YijnZNqr_9SNBOzN2sFB3xJ6SrHy9q3LJ0b1HApVHI=s800-c-k-c0x00ffffff-no-rj"}],F=[{label:"Home",
Icon:c,
active:!0},{label:"Shorts",
Icon:d,
active:!1},{label:"Subscriptions",
Icon:h,
active:!1},{label:"You",
Icon:m,
active:!1}];
function _({icon:e,
label:a,
active:s}){return
JSX("div",{className:"yt-guide-row","data-active":s,
children:[
JSX("span",{className:"yt-guide-icon",
children:e}),
JSX("span",{className:"yt-guide-label",
children:a})]})}
function R({label:e,
chevron:a}){return
JSX("div",{className:"yt-guide-header",
children:[
JSX("span",{children:e}),a&&
JSX("span",{className:"yt-guide-header-chevron",
children:
JSX(u,{size:22})})]})}
function O({ch:e}){return
JSX("div",{className:"yt-guide-row",
children:[
JSX("span",{className:"yt-guide-avatar",
children:e.avatar?
JSX("img",{src:e.avatar,
alt:"",
draggable:!1}):
JSX("span",{className:"yt-guide-monogram",
style:{background:T(e.name)},
children:e.name.trim().charAt(0).toUpperCase()})}),
JSX("span",{className:"yt-guide-label",
children:e.name}),e.live&&
JSX("span",{className:"yt-guide-live","aria-label":"Live now",
children:
JSX(x,{size:18})}),e.newDot&&!e.live&&
JSX("span",{className:"yt-guide-dot","aria-label":"New videos"})]})}
function P(){return
JSX("div",{className:"yt-guide-divider"})}e.s(["MiniGuide",0,function({expanded:e=!1}){return e?
JSX("nav",{className:"yt-guide",
children:[
JSX("div",{className:"yt-guide-section",
children:[
JSX(_,{icon:
JSX(c,{}),
label:"Home",
active:!0}),
JSX(_,{icon:
JSX(d,{}),
label:"Shorts"})]}),
JSX(P,{}),
JSX("div",{className:"yt-guide-section",
children:[
JSX(R,{label:"Subscriptions",
chevron:!0}),k.map(e=>
JSX(O,{ch:e},e.name)),
JSX(_,{icon:
JSX(f,{}),
label:"Show more"})]}),
JSX(P,{}),
JSX("div",{className:"yt-guide-section",
children:[
JSX(R,{label:"You",
chevron:!0}),
JSX(_,{icon:
JSX(j,{}),
label:"Your channel"}),
JSX(_,{icon:
JSX(p,{}),
label:"History"}),
JSX(_,{icon:
JSX(C,{}),
label:"Playlists"}),
JSX(_,{icon:
JSX(y,{}),
label:"Watch later"}),
JSX(_,{icon:
JSX(v,{}),
label:"Liked videos"}),
JSX(_,{icon:
JSX(g,{}),
label:"Your videos"}),
JSX(_,{icon:
JSX(b,{}),
label:"Downloads"}),
JSX(_,{icon:
JSX(f,{}),
label:"Show more"})]}),
JSX(P,{}),
JSX("div",{className:"yt-guide-section",
children:[
JSX(R,{label:"Explore"}),
JSX(_,{icon:
JSX(M,{}),
label:"Music"}),
JSX(_,{icon:
JSX(L,{}),
label:"Movies"}),
JSX(_,{icon:
JSX(N,{}),
label:"Live"})]}),
JSX(P,{}),
JSX("div",{className:"yt-guide-section",
children:[
JSX(R,{label:"More from YouTube"}),
JSX(_,{icon:
JSX(I,{}),
label:"YouTube Music"}),
JSX(_,{icon:
JSX(S,{}),
label:"YouTube Kids"})]}),
JSX(P,{}),
JSX("div",{className:"yt-guide-section",
children:[
JSX(_,{icon:
JSX(w,{}),
label:"Report history"}),
JSX(_,{icon:
JSX(Z,{}),
label:"Settings"})]})]}):
JSX("nav",{className:"yt-mini-guide",
children:F.map(({label:e,
Icon:a,
active:s})=>
JSX("div",{className:"yt-mini-item","data-active":s,
children:[
JSX(a,{}),
JSX("span",{className:"yt-mini-label",
children:e})]},e))})}],34612);var $=e.i(71645);
let D=["All","Music","Gaming","Live","Mixes","News","Podcasts","Recently uploaded","New to you","Computer programming","Watched"];e.s(["ChipBar",0,function(){let[e,a]=$.useState("All");return
JSX("div",{className:"yt-chipbar",
children:D.map(s=>
JSX("button",{className:"yt-chip","data-selected":s===e,
onClick:()=>a(s),
tabIndex:-1,
children:s},s))})}],92288)},42041,29588,58101,5716,86696,e=>{"use strict";var t=e.i(43476),a=e.i(84845),s=e.i(34612),r=e.i(92288),l=e.i(71645),n=e.i(2793),i=e.i(91392);
let o=[["#1f2937","#0b1220","#f8fafc"],["#3b0d0d","#150404","#fde2e2"],["#0d2b3b","#04141d","#dcf3ff"],["#2b1a3b","#120a1d","#efe2ff"],["#1a3b22","#08160d","#dcffe6"],["#3b3210","#1d1804","#fff6dc"],["#11243b","#06101d","#dce8ff"],["#3b1024","#1d0612","#ffdcec"]],c=["bars","rings","diag","blob"];
function d(e,t=""){
let a=(0,i.hashString)(e),[s,r,l]=o[a%o.length],n=c[(a>>4)%c.length],h="";h="bars"===n?Array.from({length:5}).map((e,t)=>{
let s=120+(a>>t+2)%280;return`<rect x="${40+240*t}" y="${720-s}" width="120" height="${s}
```

## VideoCard + DesktopGrid + DesktopSurface

```js
e.s(["genThumb",0,d],29588);var h=e.i(26101);
function u({vm:e,
highlight:a=!1,
showSafeArea:s=!1,
onClick:r,
onDragOver:l,
onDrop:n}){
let o=e.thumb??d(e.id,e.title),c="LIVE"===e.duration.trim().toUpperCase();return
JSX("div",{className:"yt-card","data-test":e.isTest,"data-highlight":a,
onClick:r,
onDragOver:l,
onDrop:n,
children:[
JSX("div",{className:"yt-thumb-wrap",
children:[
JSX("img",{className:"yt-thumb-img",
src:o,
alt:"",
style:{objectFit:e.imageFit},
draggable:!1}),e.showDuration&&""!==e.duration.trim()&&
JSX("span",{className:"yt-duration","data-live":c,
children:e.duration}),e.watchedPercent>0&&
JSX("div",{className:"yt-progress-track",
children:
JSX("div",{className:"yt-progress-fill",
style:{width:`${Math.min(100,e.watchedPercent)}%`}})}),s&&e.isTest&&
JSX("div",{className:"yt-safe-overlay",
children:
JSX("div",{className:"yt-safe-badge-zone"})})]}),
JSX("div",{className:"yt-card-details",
children:[
JSX("div",{className:"yt-card-avatar",
children:e.avatar?
JSX("img",{src:e.avatar,
alt:"",
draggable:!1}):
JSX("span",{className:"yt-monogram",
style:{background:(0,i.monogramColor)(e.channel)},
children:e.channel.trim().charAt(0).toUpperCase()||"?"})}),
JSX("div",{className:"yt-card-text",
children:[
JSX("h3",{className:"yt-card-title",
children:e.title}),
JSX("div",{className:"yt-card-channel",
children:[
JSX("span",{style:{overflow:"hidden",
textOverflow:"ellipsis"},
children:e.channel}),e.verified&&
JSX(h.IconVerified,{size:14,
className:"yt-verified",
style:{color:"var(--yt-text-secondary)"}})]}),
JSX("div",{className:"yt-card-meta",
children:[
JSX("span",{children:e.views}),
JSX("span",{"aria-hidden":!0,
children:"•"}),
JSX("span",{children:e.age})]})]}),
JSX("button",{className:"yt-card-menu","aria-label":"More",
tabIndex:-1,
onClick:e=>e.stopPropagation(),
children:
JSX(h.IconKebab,{size:20})})]})]})}
function f(e,{initial:t=12,
step:a=9,
rootRef:s,
resetKey:r}={}){let[n,i]=l.useState(t),o=l.useRef(null),c=e.length;return l.useEffect(()=>{i(t)},[r,t]),l.useEffect(()=>{
let e=o.current;if(!e)return;
let t=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&i(e=>e<c?Math.min(c,e+a):e)},{root:s?.current??null,
rootMargin:"800px 0px"});return t.observe(e),()=>t.disconnect()},[c,a,s]),{visible:e.slice(0,n),
sentinelRef:o,
hasMore:n<c}}
function x(e){return e<=0?4:Math.max(1,Math.min(6,Math.floor((e+16)/316)))}
function m({cards:e,
columns:a,
blur:s,
grayscale:r,
highlight:i,
showSafeArea:o,
scrollRootRef:c,
resetKey:d}){
let h=l.useRef(null),j=(0,n.useFeed)(e=>e.setInspect),p=(0,n.useFeed)(e=>e.uploadHandler),C=(0,n.useFeed)(e=>e.dropHandler),[y,v]=l.useState(4),{visible:g,
sentinelRef:b}=f(e,{rootRef:c,
resetKey:d});l.useEffect(()=>{
let e=h.current;if(!e)return;
let t=new ResizeObserver(e=>{v(x(e[0]?.contentRect.width??0))});return t.observe(e),v(x(e.clientWidth)),()=>t.disconnect()},[]);
let M=[];return s>0&&M.push(`blur(${s}px)`),r&&M.push("grayscale(1)"),
JSX(t.Fragment,{children:[
JSX("div",{ref:h,
className:"yt-grid",
style:{"--yt-cols":"auto"===a?y:a,
filter:M.length?M.join(" "):void 0,
transition:"filter var(--dur-base) var(--ease-out)"},
children:g.map(e=>
JSX(u,{vm:e,
highlight:e.isTest&&i,
showSafeArea:o,
onClick:()=>e.isPlaceholder?p?.():j(e),
onDragOver:e.isTest?e=>e.preventDefault():void 0,
onDrop:e.isTest?e=>{e.preventDefault(),C?.(Array.from(e.dataTransfer.files))}:void 0},e.id))}),
JSX("div",{ref:b,"aria-hidden":!0,
style:{height:1}})]})}
function j({vm:e,
highlight:a=!1,
showSafeArea:s=!1,
onClick:r,
onDragOver:l,
onDrop:n}){
let o=e.thumb??d(e.id,e.title),c="LIVE"===e.duration.trim().toUpperCase();return
JSX("div",{className:"ytm-card","data-test":e.isTest,"data-highlight":a,
onClick:r,
onDragOver:l,
onDrop:n,
children:[
JSX("div",{className:"ytm-thumb-wrap",
children:[
JSX("img",{className:"ytm-thumb-img",
src:o,
alt:"",
style:{objectFit:e.imageFit},
draggable:!1}),e.showDuration&&""!==e.duration.trim()&&
JSX("span",{className:"yt-duration","data-live":c,
children:e.duration}),e.watchedPercent>0&&
JSX("div",{className:"yt-progress-track",
children:
JSX("div",{className:"yt-progress-fill",
style:{width:`${Math.min(100,e.watchedPercent)}%`}})}),s&&e.isTest&&
JSX("div",{className:"yt-safe-overlay",
children:
JSX("div",{className:"yt-safe-badge-zone"})})]}),
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
JSX(h.IconKebabVertical,{size:1
```
