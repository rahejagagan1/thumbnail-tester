# EditorPanel Specification

## Overview
- **Target file:** `src/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/EditorPanel.tsx`
- **Source page:** https://www.thumbnails.gg/app
- **Interaction model:** form input + accordion click; every change writes the shared store

## Exact CSS (verbatim from the target's stylesheet)

These rules are ALREADY PRESENT in `src/app/globals.css` — the site's stylesheet was
ported wholesale during the foundation phase. Do NOT re-declare them and do NOT convert
them to Tailwind utilities. Use the class names below and the component will match the
original exactly. They are reproduced here so you can see what each class does.

```css
.glass-dark {
  -webkit-backdrop-filter:blur(28px)saturate(140%);
  background:linear-gradient(#ffffff0d,#fff0 26%),linear-gradient(#0d0e12d1,#07080ae6);
  border:1px solid #ffffff17;
  position:relative;
  box-shadow:inset 0 1px #ffffff14,inset 0 0 0 1px #ffffff04,0 32px 72px -20px #000000d1
}
.glass-dark:before {
  content:"";
  pointer-events:none;
  z-index:1;
  background:linear-gradient(90deg,#0000,#ffffff29 50%,#0000);
  height:1px;
  position:absolute;
  top:0;
  left:0;
  right:0
}
.glass-sticky {
  background:linear-gradient(#090a0dfa 0%,#090a0df5 50%,#090a0dc7 78%,#090a0d00 100%)
}
@supports not ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))) {
  .glass-1 {
    background:var(--bg-elevated)
  }
  .glass-2,.glass-3,.glass-dark {
    background:var(--bg-elevated-2)
  }
  .glass-sticky {
    background:var(--bg-elevated)
  }
}
.eyebrow {
  letter-spacing:.16em;
  text-transform:uppercase;
  color:var(--text-muted);
  font-size:11px;
  font-weight:500
}
.focus-ring:focus-visible {
  box-shadow:0 0 0 3px var(--accent-glow), 0 0 0 1px var(--focus-ring);
  outline:none
}
.anim-fade {
  animation:enter-fade .7s var(--ease-out) both;
  animation-delay:var(--d,0s)
}
.seg {
  background:var(--bg-sunken);
  border:1px solid var(--border-default);
  border-radius:10px;
  gap:0;
  padding:4px;
  display:grid;
  position:relative
}
.seg-thumb {
  transition:transform var(--dur-base) var(--ease-out), width var(--dur-base) var(--ease-out);
  z-index:0;
  background:#fff;
  border-radius:7px;
  position:absolute;
  top:4px;
  bottom:4px;
  left:4px;
  box-shadow:0 2px 8px -2px #00000080
}
.seg-btn {
  z-index:1;
  cursor:pointer;
  height:30px;
  color:var(--text-secondary);
  transition:color var(--dur-base) var(--ease-out);
  background:0 0;
  border:none;
  font-family:inherit;
  font-size:13px;
  font-weight:500;
  position:relative
}
.seg-btn[data-active=true] {
  color:var(--accent-fg)
}
.acc-body {
  transition:grid-template-rows var(--dur-slow) var(--ease-out), opacity var(--dur-base) var(--ease-out);
  opacity:0;
  grid-template-rows:0fr;
  display:grid
}
.acc-body[data-open=true] {
  opacity:1;
  grid-template-rows:1fr
}
.acc-body>div {
  min-height:0;
  overflow:hidden
}
.fx {
  transition:border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)
}
.fx:focus-visible,.fx:focus {
  box-shadow:0 0 0 3px var(--accent-glow);
  border-color:#ffffff47;
  outline:none
}
.tool-editor {
  width:360px;
  transition:width var(--dur-slow) var(--ease-out);
  flex-shrink:0;
  position:relative;
  overflow:hidden
}
.tool-editor>aside {
  transition:opacity var(--dur-base) var(--ease-out)
}
.tool-editor.is-collapsed {
  width:0
}
.tool-editor.is-collapsed>aside {
  opacity:0
}
.editor-toggle {
  z-index:25;
  border:1px solid var(--border-default);
  background:var(--bg-elevated);
  width:22px;
  height:54px;
  color:var(--text-muted);
  cursor:pointer;
  transition:right var(--dur-slow) var(--ease-out), color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
  border-right:none;
  border-radius:8px 0 0 8px;
  justify-content:center;
  align-items:center;
  display:flex;
  position:absolute;
  top:50%;
  right:360px;
  transform:translateY(-50%)
}
.editor-toggle:hover {
  color:var(--text-primary);
  background:var(--bg-elevated-2)
}
.editor-toggle svg {
  width:15px;
  height:15px;
  transition:transform var(--dur-base) var(--ease-out)
}
.editor-toggle.is-collapsed {
  border-radius:8px 0 0 8px;
  right:0
}
.editor-toggle.is-collapsed svg {
  transform:rotate(180deg)
}
```

## Deobfuscated source from the target's JS bundle

This is the original component, recovered from the production bundle. `JSX(tag, props)`
is `React.createElement`. Reconstruct it as idiomatic, strictly-typed TSX — same DOM,
same class names, same inline styles, same values.

```js
,{d:"M5 5h14M5 5l1.5 9a2 2 0 002 1.7h5a2 2 0 002-1.7L17 5M9 9v3m6-3v3",
stroke:"currentColor",
strokeWidth:"1.6",
strokeLinecap:"round"})}),"Save"]})]})]})]}),
JSX("aside",{children:[
JSX("div",{className:"ytw-reco-chips",
children:eL.map((e,t)=>
JSX("span",{className:"yt-chip","data-selected":0===t,
children:e},e))}),
JSX("div",{className:"ytw-reco-list",
style:{filter:m,
transition:"filter var(--dur-base) var(--ease-out)"},
children:[f.map(e=>
JSX(eT,{vm:e,
highlight:e.isTest&&r,
showSafeArea:s,
onClick:()=>e.isPlaceholder?d?.():c(e),
onDragOver:e.isTest?e=>e.preventDefault():void 0,
onDrop:e.isTest?e=>{e.preventDefault(),h?.(Array.from(e.dataTransfer.files))}:void 0},e.id)),
JSX("div",{ref:u,"aria-hidden":!0,
style:{height:1}})]})]})]})]})}var eO=e.i(91392);
function e_({label:e,
hint:t,
children:a}){return
JSX("label",{style:{display:"block",
marginBottom:14},
children:[
JSX("span",{style:{display:"flex",
justifyContent:"space-between",
fontSize:12,
fontWeight:500,
color:"var(--text-muted)",
marginBottom:6},
children:[e,t&&
JSX("span",{style:{color:"var(--text-faint)"},
children:t})]}),a]})}
let eW={width:"100%",
height:36,
padding:"0 12px",
borderRadius:8,
background:"var(--bg-sunken)",
border:"1px solid var(--border-default)",
color:"var(--text-primary)",
fontSize:14,
fontFamily:"inherit",
outline:"none"};
function eF(e){return
JSX("input",{...e,
className:"focus-ring fx",
style:{...eW,...e.style}})}
function eU({options:e,
value:t,
onChange:a}){
let r=e.length,s=Math.max(0,e.findIndex(e=>e.value===t));return
JSX("div",{className:"seg",
style:{gridTemplateColumns:`repeat(${r}, 1fr)`},
children:[
JSX("span",{className:"seg-thumb",
style:{width:`calc((100% - 8px) / ${r})`,
transform:`translateX(${100*s}%)`}}),e.map(e=>
JSX("button",{onClick:()=>a(e.value),
className:"seg-btn focus-ring","data-active":e.value===t,
children:e.label},e.value))]})}
function eD({checked:e,
onChange:t,
label:a}){return
JSX("button",{onClick:()=>t(!e),
className:"focus-ring",
style:{display:"flex",
alignItems:"center",
justifyContent:"space-between",
width:"100%",
padding:"8px 0",
background:"transparent",
border:"none",
cursor:"pointer",
color:"var(--text-secondary)",
fontSize:13,
fontFamily:"inherit"},
children:[
JSX("span",{children:a}),
JSX("span",{style:{width:38,
height:22,
borderRadius:999,
background:e?"#fff":"rgba(255,255,255,0.12)",
position:"relative",
transition:"background var(--dur-base)",
flexShrink:0},
children:
JSX("span",{style:{position:"absolute",
top:3,
left:e?19:3,
width:16,
height:16,
borderRadius:999,
background:e?"var(--accent-fg)":"#fff",
transition:"left var(--dur-base) var(--ease-out)"}})})]})}
function eH({value:e,
min:t,
max:a,
step:r=1,
onChange:s,
suffix:n}){return
JSX("div",{style:{display:"flex",
alignItems:"center",
gap:12},
children:[
JSX("input",{type:"range",
min:t,
max:a,
step:r,
value:e,
onChange:e=>s(Number(e.target.value)),
style:{flex:1,
accentColor:"#fff"}}),
JSX("span",{style:{fontFamily:"var(--font-mono)",
fontSize:12,
color:"var(--text-muted)",
minWidth:44,
textAlign:"right"},
children:[e,n]})]})}
function eK({title:e,
children:t,
defaultOpen:r=!0}){let[s,n]=a.useState(r);return
JSX("div",{style:{borderBottom:"1px solid var(--border-subtle)"},
children:[
JSX("button",{onClick:()=>n(e=>!e),
style:{display:"flex",
alignItems:"center",
justifyContent:"space-between",
width:"100%",
padding:"16px 0",
background:"transparent",
border:"none",
cursor:"pointer",
color:"var(--text-primary)",
fontFamily:"inherit"},
children:[
JSX("span",{style:{fontSize:11,
fontWeight:600,
letterSpacing:"0.1em",
textTransform:"uppercase",
color:"var(--text-secondary)"},
children:e}),
JSX("svg",{width:"16",
height:"16",
viewBox:"0 0 24 24",
fill:"none",
style:{transform:s?"rotate(180deg)":"none",
transition:"transform var(--dur-base) var(--ease-out)",
color:"var(--text-muted)"},
children:
JSX("path",{d:"M6 9l6 6 6-6",
stroke:"currentColor",
strokeWidth:"1.8",
strokeLinecap:"round",
strokeLinejoin:"round"})})]}),
JSX("div",{className:"acc-body","data-open":s,
children:
JSX("div",{children:
JSX("div",{style:{paddingBottom:18},
children:t})})})]})}
function eY({onFile:e,
onFiles:t,
multiple:r=!1,
hasImage:s,
label:n,
height:o=120,
previewSrc:l}){let[c,d]=a.useState(!1),[h,f]=a.useState(!1),u=a.useRef(null),g=!!l,m=i=>{
let a=Array.from(i??[]);0!==a.length&&(r&&t?t(a):e&&e(a[0]))};return
JSX("div",{onClick:()=>u.current?.click(),
onMouseEnter:()=>f(!0),
onMouseLeave:()=>f(!1),
onDragOver:e=>{e.preventDefault(),d(!0)},
onDragLeave:()=>d(!1),
onDrop:e=>{e.preventDefault(),d(!1),m(e.dataTransfer.files)},
style:{position:"relative",
overflow:"hidden",
height:o,
borderRadius:10,
border:`1.5px dashed ${c?"#fff":"var(--border-default)"}`,
background:c?"rgba(255,255,255,0.04)":"var(--bg-sunken)",
display:"flex",
flexDirection:"column",
alignItems:"center",
justifyContent:"center",
gap:8,
cursor:"pointer",
color:"var(--text-muted)",
fontSize:13,
transition:"border-color var(--dur-fast), background var(--dur-fast)",
textAlign:"center",
padding:12},
children:[g&&
JSX("img",{src:l,
alt:"",
draggable:!1,
style:{position:"absolute",
inset:0,
width:"100%",
height:"100%",
objectFit:"cover",
borderRadius:10}}),(!g||h||c)&&
JSX("div",{style:{position:g?"absolute":"relative",
inset:g?0:void 0,
display:"flex",
flexDirection:"column",
alignItems:"center",
justifyContent:"center",
gap:8,
padding:12,
borderRadius:10,
background:g?"rgba(0,0,0,0.55)":"transparent",
color:g?"#fff":"var(--text-muted)",
transition:"background var(--dur-fast)"},
children:[
JSX("svg",{width:"22",
height:"22",
viewBox:"0 0 24 24",
fill:"none",
children:[
JSX("path",{d:"M12 16V4M7 9l5-5 5 5",
stroke:"currentColor",
strokeWidth:"1.6",
strokeLinecap:"round",
strokeLinejoin:"round"}),
JSX("path",{d:"M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3",
stroke:"currentColor",
strokeWidth:"1.6",
strokeLinecap:"round"})]}),
JSX("span",{children:s||g?`Replace \xb7 ${n}`:n})]}),
JSX("input",{ref:u,
type:"file",
accept:"image/png,image/jpeg,image/webp",
multiple:r,
style:{display:"none"},
onChange:e=>{m(e.target.files),e.target.value=""}})]})}
function eV(){
let e=(0,n.useFeed)(),t=e.testCard,a=eJ(t.title);return
JSX("aside",{className:"glass-dark anim-fade",
style:{width:360,
flexShrink:0,
height:"100%",
overflowY:"auto",
borderRadius:0,
borderTop:"none",
borderRight:"none",
borderBottom:"none",
padding:"0 20px 40px"},
children:[
JSX("div",{className:"glass-sticky",
style:{position:"sticky",
top:0,
margin:"0 -20px",
padding:"18px 20px 28px",
zIndex:2},
children:[
JSX("div",{className:"eyebrow",
style:{marginBottom:8},
children:"Editor"}),
JSX("h2",{style:{margin:0,
fontSize:16,
fontWeight:600,
letterSpacing:"-0.02em"},
children:"Set up your test"}),
JSX("p",{style:{margin:"4px 0 0",
fontSize:12,
color:"var(--text-muted)"},
children:"Every edit lands in the live feed instantly."})]}),
JSX(eK,{title:"Thumbnail",
children:[
JSX(e_,{label:"Mode",
hint:"test one or many",
children:
JSX(eU,{value:e.thumbMode,
onChange:t=>e.setThumbMode(t),
options:[{value:"single",
label:"Single"},{value:"multiple",
label:"Multiple"}]})}),"single"===e.thumbMode?
JSX(eY,{onFile:t=>{e.updateTestCard({imageSrc:URL.createObjectURL(t)})},
hasImage:!!t.imageSrc,
previewSrc:t.imageSrc,
label:"Drop a .png (16:9) or click to upload",
height:132}):
JSX(i.Fragment,{children:[
JSX(eY,{onFiles:t=>{e.addThumbnails(t.map(e=>URL.createObjectURL(e)))},
multiple:!0,
hasImage:!1,
label:"Drop or click to add thumbnails (multiple)",
height:92}),
JSX(eG,{})]}),
JSX("div",{style:{height:14}}),
JSX(e_,{label:"Fit",
children:
JSX(eU,{value:t.imageFit,
onChange:t=>e.updateTestCard({imageFit:t}),
options:[{value:"cover",
label:"Cover"},{value:"contain",
label:"Contain"}]})}),
JSX(e_,{label:"Duration badge",
hint:"e.g. 12:34 or LIVE",
children:
JSX(eF,{value:t.duration,
onChange:t=>e.updateTestCard({duration:t.target.value}),
placeholder:"12:34"})}),
JSX(eD,{checked:t.showDuration,
onChange:t=>e.updateTestCard({showDuration:t}),
label:"Show duration badge"}),
JSX(e_,{label:"Watched progress",
children:
JSX(eH,{value:t.watchedPercent,
min:0,
max:100,
onChange:t=>e.updateTestCard({watchedPercent:t}),
suffix:"%"})})]}),
JSX(eK,{title:"Details",
children:[
JSX(e_,{label:"Mode",
hint:"test one or many",
children:
JSX(eU,{value:e.titleMode,
onChange:t=>e.setTitleMode(t),
options:[{value:"single",
label:"Single"},{value:"multiple",
label:"Multiple"}]})}),"single"===e.titleMode?
JSX(e_,{label:"Title",
hint:a>2?"⚠ clips after 2 lines":`${a} line${a>1?"s":""}`,
children:
JSX("textarea",{value:t.title,
onChange:t=>e.updateTestCard({title:t.target.value}),
rows:2,
className:"focus-ring",
style:{width:"100%",
padding:"8px 12px",
borderRadius:8,
background:"var(--bg-sunken)",
border:`1px solid ${a>2?"rgba(255,180,60,0.5)":"var(--border-default)"}`,
color:"var(--text-primary)",
fontSize:14,
fontFamily:"inherit",
resize:"vertical",
outline:"none"}})}):
JSX(eq,{}),
JSX(eZ,{}),
JSX(e_,{label:"Channel name",
hint:"auto-filled from handle",
children:
JSX(eF,{value:t.channelName,
onChange:t=>e.updateTestCard({channelName:t.target.value})})}),
JSX(e_,{label:"Channel avatar",
hint:"auto-filled, or override",
children:
JSX(eY,{onFile:t=>{e.updateTestCard({channelAvatarSrc:URL.createObjectURL(t)})},
hasImage:!!t.channelAvatarSrc,
previewSrc:t.channelAvatarSrc,
label:"Upload avatar (else auto monogram)",
height:72})}),
JSX(eD,{checked:t.verified,
onChange:t=>e.updateTestCard({verified:t}),
label:"Verified badge"}),
JSX(e_,{label:"View count",
hint:"number auto-formats",
children:
JSX(eF,{value:String(t.viewCount),
onChange:t=>e.updateTestCard({viewCount:t.target.value}),
placeholder:"124K or 1240000"})}),
JSX(e_,{label:"Upload age",
children:[
JSX("select",{value:ez(t.uploadedAt)?t.uploadedAt:"__custom__",
onChange:t=>{"__custom__"!==t.target.value&&e.updateTestCard({uploadedAt:t.target.value})},
className:"focus-ring",
style:{width:"100%",
height:36,
padding:"0 12px",
borderRadius:8,
background:"var(--bg-sunken)",
border:"1px solid var(--border-default)",
color:"var(--text-primary)",
fontSize:14,
fontFamily:"inherit",
outline:"none"},
children:[eO.AGE_OPTIONS.map(e=>
JSX("option",{value:e.value,
children:e.label},e.value)),
JSX("option",{value:"__custom__",
children:"Custom…"})]}),!ez(t.uploadedAt)&&
JSX("div",{style:{marginTop:8},
children:
JSX(eF,{value:t.uploadedAt,
onChange:t=>e.updateTestCard({uploadedAt:t.target.value}),
placeholder:"e.g. 4 days ago"})})]})]}),
JSX(eK,{title:"Placement",
children:[
JSX(e_,{label:"Position",
children:
JSX(eU,{value:e.placement,
onChange:t=>e.setPlacement(t),
options:[{value:"first",
label:"First"},{value:"random",
label:"Random"}]})}),
JSX("button",{onClick:()=>e.reshuffle(),
className:"focus-ring",
style:{display:"flex",
alignItems:"center",
justifyContent:"center",
gap:8,
width:"100%",
height:36,
borderRadius:8,
border:"1px solid var(--border-default)",
background:"var(--glass-1-bg)",
color:"var(--text-secondary)",
fontSize:13,
fontWeight:500,
cursor:"pointer",
fontFamily:"inherit"},
children:[
JSX("svg",{width:"15",
height:"15",
viewBox:"0 0 24 24",
fill:"none",
children:[
JSX("path",{d:"M21 4v5h-5M3 20v-5h5",
stroke:"currentColor",
strokeWidth:"1.7",
strokeLinecap:"round",
strokeLinejoin:"round"}),
JSX("path",{d:"M19 9a8 8 0 00-14-1M5 15a8 8 0 0014 1",
stroke:"currentColor",
strokeWidth:"1.7",
strokeLinecap:"round"})]}),"Reshuffle feed"]})]}),
JSX(eK,{title:"View",
children:[
JSX(e_,{label:"Surface",
hint:"where to test",
children:
JSX(eU,{value:e.viewMode,
onChange:t=>e.setViewMode(t),
options:[{value:"desktop",
label:"Desktop"},{value:"mobile",
label:"Mobile"},{value:"watch",
label:"Watch"}]})}),
JSX(e_,{label:"Theme",
children:
JSX(eU,{value:e.theme,
onChange:t=>e.setTheme(t),
options:[{value:"dark",
label:"Dark"},{value:"light",
label:"Light"}]})}),"desktop"===e.viewMode&&
JSX(e_,{label:"Columns",
hint:"auto"===e.columns?"auto (responsive)":`${e.columns}`,
children:
JSX(eU,{value:String(e.columns),
onChange:t=>e.setColumns("auto"===t?"auto":Number(t)),
options:[{value:"auto",
label:"Auto"},{value:"3",
label:"3"},{value:"4",
label:"4"},{value:"5",
label:"5"}]})}),"watch"===e.viewMode&&
JSX("p",{style:{margin:"2px 0 0",
fontSize:11,
color:"var(--text-faint)",
lineHeight:1.5},
children:"Your thumbnail appears in the recommendations sidebar. Use Placement to put it at the top (First) or further down (Random)."})]}),
JSX(eK,{title:"Analyze",
children:[
JSX(e_,{label:"Squint / blur test",
hint:"readability proxy",
children:
JSX(eH,{value:e.blur,
min:0,
max:12,
onChange:t=>e.setBlur(t),
suffix:"px"})}),
JSX(eD,{checked:e.grayscale,
onChange:t=>e.setGrayscale(t),
label:"Grayscale (value contrast)"}),
JSX(eD,{checked:e.showSafeAreaOverlay,
onChange:t=>e.setShowSafeArea(t),
label:"Safe-area / badge occlusion"}),
JSX(eD,{checked:e.highlightTestCard,
onChange:t=>e.setHighlight(t),
label:"Highlight my card (editing aid)"}),
JSX("p",{style:{margin:"8px 0 0",
fontSize:11,
color:"var(--text-faint)",
lineHeight:1.5},
children:"Keep highlight OFF for an honest blind test. Your card should be indistinguishable from the rest of the feed."})]}),
JSX("div",{style:{marginTop:20,
padding:"12px 14px",
borderRadius:10,
background:"var(--bg-sunken)",
border:"1px solid var(--border-default)",
fontSize:11.5,
lineHeight:1.55,
color:"var(--text-muted)"},
children:[
JSX("span",{style:{color:"var(--text-secondary)",
fontWeight:600},
children:"Tip"})," · Click any thumbnail in the feed to open it up. You get a closer look plus export and copy options."]})]})}
function ez(e){return eO.AGE_OPTIONS.some(t=>t.value===e)}
function eG(){
let e=(0,n.useFeed)(e=>e.thumbnails),t=(0,n.useFeed)(e=>e.toggleThumbnail),a=(0,n.useFeed)(e=>e.removeThumbnail);if(0===e.length)return
JSX("p",{style:{margin:"10px 0 0",
fontSize:11.5,
color:"var(--text-faint)",
lineHeight:1.5},
children:"No thumbnails yet. Add a few to compare them side by side in the feed."});
let r=e.filter(e=>e.enabled).length;return
JSX("div",{style:{marginTop:12},
children:[
JSX("div",{style:{display:"flex",
justifyContent:"space-between",
marginBottom:8},
children:[
JSX("span",{style:{fontSize:12,
fontWeight:500,
color:"var(--text-muted)"},
children:"Thumbnails"}),
JSX("span",{style:{fontSize:11.5,
color:"var(--text-faint)"},
children:[r,"/",e.length," in feed"]})]}),
JSX("div",{style:{display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:8},
children:e.map(e=>
JSX("div",{onClick:()=>t(e.id),
title:e.enabled?"Click to hide from feed":"Click to show in feed",
style:{position:"relative",
aspectRatio:"16 / 9",
borderRadius:8,
overflow:"hidden",
cursor:"pointer",
border:`2px solid ${e.enabled?"#fff":"transparent"}`,
opacity:e.enabled?1:.4,
transition:"opacity var(--dur-fast), border-color var(--dur-fast)"},
children:[
JSX("img",{src:e.src,
alt:"",
draggable:!1,
style:{width:"100%",
height:"100%",
objectFit:"cover",
display:"block"}}),
JSX("span",{style:{position:"absolute",
top:6,
left:6,
width:18,
height:18,
borderRadius:4,
background:e.enabled?"#fff":"rgba(0,0,0,0.5)",
border:"1px solid rgba(255,255,255,0.6)",
display:"flex",
alignItems:"center",
justifyContent:"center"},
children:e.enabled&&
JSX("svg",{width:"12",
height:"12",
viewBox:"0 0 24 24",
fill:"none",
children:
JSX("path",{d:"M5 12.5l4 4 10-10",
stroke:"#08090b",
strokeWidth:"3",
strokeLinecap:"round",
strokeLinejoin:"round"})})}),
JSX("button",{onClick:t=>{t.stopPropagation(),a(e.id)},"aria-label":"Remove thumbnail",
style:{position:"absolute",
top:6,
right:6,
width:18,
height:18,
borderRadius:999,
background:"rgba(0,0,0,0.6)",
border:"none",
cursor:"pointer",
display:"flex",
alignItems:"center",
justifyContent:"center",
padding:0},
children:
JSX("svg",{width:"10",
height:"10",
viewBox:"0 0 24 24",
fill:"none",
children:
JSX("path",{d:"M6 6l12 12M18 6L6 18",
stroke:"#fff",
strokeWidth:"2.5",
strokeLinecap:"round"})})})]},e.id))})]})}
function eq(){
let e=(0,n.useFeed)(e=>e.titles),t=(0,n.useFeed)(e=>e.addTitle),a=(0,n.useFeed)(e=>e.updateTitle),r=(0,n.useFeed)(e=>e.toggleTitle),s=(0,n.useFeed)(e=>e.removeTitle),o=e.filter(e=>e.enabled).length;return
JSX("div",{children:[
JSX("div",{style:{display:"flex",
justifyContent:"space-between",
marginBottom:8},
children:[
JSX("span",{style:{fontSize:12,
fontWeight:500,
color:"var(--text-muted)"},
children:"Titles"}),
JSX("span",{style:{fontSize:11.5,
color:"var(--text-faint)"},
children:[o,"/",e.length," in feed"]})]}),0===e.length?
JSX("p",{style:{margin:"0 0 12px",
fontSize:11.5,
color:"var(--text-faint)",
lineHeight:1.5},
children:"No titles yet. Add a few to scatter them across your thumbnails."}):
JSX("div",{style:{display:"flex",
flexDirection:"column",
gap:8,
marginBottom:12},
children:e.map(e=>{
let t=eJ(e.text);return
JSX("div",{style:{display:"flex",
flexDirection:"column",
gap:4},
children:[
JSX("div",{style:{display:"flex",
alignItems:"center",
gap:8},
children:[
JSX("button",{onClick:()=>r(e.id),"aria-label":e.enabled?"Disable title":"Enable title",
title:e.enabled?"Click to remove from feed":"Click to include in feed",
className:"focus-ring",
style:{flexShrink:0,
width:18,
height:18,
borderRadius:4,
background:e.enabled?"#fff":"rgba(0,0,0,0.5)",
border:"1px solid rgba(255,255,255,0.6)",
cursor:"pointer",
display:"flex",
alignItems:"center",
justifyContent:"center",
padding:0},
children:e.enabled&&
JSX("svg",{width:"12",
height:"12",
viewBox:"0 0 24 24",
fill:"none",
children:
JSX("path",{d:"M5 12.5l4 4 10-10",
stroke:"#08090b",
strokeWidth:"3",
strokeLinecap:"round",
strokeLinejoin:"round"})})}),
JSX(eF,{value:e.text,
onChange:t=>a(e.id,t.target.value),
placeholder:"Title variant",
style:{flex:1,
opacity:e.enabled?1:.5,
border:`1px solid ${t>2?"rgba(255,180,60,0.5)":"var(--border-default)"}`}}),
JSX("button",{onClick:()=>s(e.id),"aria-label":"Remove title",
className:"focus-ring",
style:{flexShrink:0,
width:22,
height:22,
borderRadius:999,
background:"rgba(255,255,255,0.06)",
border:"1px solid var(--border-default)",
cursor:"pointer",
display:"flex",
alignItems:"center",
justifyContent:"center",
padding:0,
color:"var(--text-muted)"},
children:
JSX("svg",{width:"10",
height:"10",
viewBox:"0 0 24 24",
fill:"none",
children:
JSX("path",{d:"M6 6l12 12M18 6L6 18",
stroke:"currentColor",
strokeWidth:"2.5",
strokeLinecap:"round"})})})]}),t>2&&
JSX("span",{style:{marginLeft:26,
fontSize:11,
color:"rgba(255,180,60,0.85)"},
children:"⚠ clips after 2 lines"})]},e.id)})}),
JSX("button",{onClick:()=>t(""),
className:"focus-ring",
style:{display:"flex",
alignItems:"center",
justifyContent:"center",
gap:8,
width:"100%",
height:36,
borderRadius:8,
border:"1px solid var(--border-default)",
background:"var(--glass-1-bg)",
color:"var(--text-secondary)",
fontSize:13,
fontWeight:500,
cursor:"pointer",
fontFamily:"inherit"},
children:[
JSX("svg",{width:"15",
height:"15",
viewBox:"0 0 24 24",
fill:"none",
children:
JSX("path",{d:"M12 5v14M5 12h14",
stroke:"currentColor",
strokeWidth:"1.7",
strokeLinecap:"round"})}),"Add title"]})]})}
function eZ(){
let e=(0,n.useFeed)(e=>e.updateTestCard),[t,r]=a.useState(""),[s,o]=a.useState({kind:"idle"}),l=async()=>{
let i=t.replace(/^@/,"").trim();if(i){o({kind:"loading"});try{
let t=await fetch(`/api/channel?handle=${encodeURIComponent(i)}`),a=await t.json();if(!t.ok){
let e=404===t.status?"Channel not found":503===t.status?"No API key configured":a?.error||"Lookup failed";o({kind:"error",
message:e});return}e({channelName:a.name,
channelAvatarSrc:a.avatar??null,
verified:!!a.verified}),o({kind:"found",
name:a.name})}catch{o({kind:"error",
message:"Network error"})}}};return
JSX(e_,{label:"Channel handle",
hint:"fetches name + avatar",
children:[
JSX("div",{style:{display:"flex",
gap:8},
children:[
JSX("div",{style:{position:"relative",
flex:1},
children:[
JSX("span",{style:{position:"absolute",
left:12,
top:"50%",
transform:"translateY(-50%)",
color:"var(--text-faint)",
fontSize:14,
pointerEvents:"none"},
children:"@"}),
JSX("input",{value:t,
onChange:e=>{r(e.target.value),"idle"!==s.kind&&o({kind:"idle"})},
onKeyDown:e=>{"Enter"===e.key&&(e.preventDefault(),l())},
placeholder:"MrBeast",
className:"focus-ring",
style:{width:"100%",
height:36,
padding:"0 12px 0 26px",
borderRadius:8,
background:"var(--bg-sunken)",
border:"1px solid var(--border-default)",
color:"var(--text-primary)",
fontSize:14,
fontFamily:"inherit",
outline:"none"}})]}),
JSX("button",{onClick:l,
disabled:"loading"===s.kind||!t.trim(),
className:"focus-ring",
style:{height:36,
padding:"0 14px",
borderRadius:8,
border:"none",
background:"#fff",
color:"var(--accent-fg)",
fontSize:13,
fontWeight:600,
fontFamily:"inherit",
cursor:t.trim()?"pointer":"not-allowed",
opacity:"loading"!==s.kind&&t.trim()?1:.6,
whiteSpace:"nowrap"},
children:"loading"===s.kind?"…":"Fetch"})]}),"found"===s.kind&&
JSX("p",{style:{margin:"6px 0 0",
fontSize:11.5,
color:"#3dd68c"},
children:["✓ ",s.name]}),"error"===s.kind&&
JSX("p",{style:{margin:"6px 0 0",
fontSize:11.5,
color:"#ff6b6b"},
children:s.message})]})}
function eJ(e){
let t=e.split(/\s+/),i=1,a=0;for(
let e of t)a+e.length+1>26&&a>0?(i++,a=e.length+1):a+=e.length+1;return i}var eQ=e.i(58101);
function eX(e){return new Promise((t,i)=>{
let a=new Image;a.crossOrigin="anonymous",a.onload=()=>t(a),a.onerror=i,a.src=e.startsWith("data:")||e.startsWith("blob:")||e.startsWith(window.location.origin)?e:/^https?:\/\//i.test(e)?`/api/img?u=${encodeURIComponent(e)}`:e})}async 
function e$(e,t=5){
let i=await eX(e),a=Math.max(1,Math.round(i.naturalHeight/i.naturalWidth*64))||36,r=document.createElement("canvas");r.width=64,r.height=a;
let s=r.getContext("2d",{willReadFrequently:!0});if(!s)return[];s.drawImage(i,0,0,64,a);let{data:n}=s.getImageData(0,0,64,a),o=new Map;for(
let e=0;e<n.length;e+=4){if(n[e+3]<125)continue;
let t=n[e],i=n[e+1],a=n[e+2],r=t>>4<<8|i>>4<<4|a>>4,s=o.get(r);s?(s.r+=t,s.g+=i,s.b+=a,s.n++):o.set(r,{r:t,
g:i,
b:a,
n:1})}return[...o.values()].sort((e,t)=>t.n-e.n).slice(0,t).map(({r:e,
g:t,
b:i,
n:a})=>"#"+[Math.round(e/a),Math.round(t/a),Math.round(i/a)].map(e=>e.toString(16).padStart(2,"0")).join(""))}async 
function e0(e){try{
let t=await eX(e),i=document.createElement("canvas");i.width=t.naturalWidth,i.height=t.naturalHeight;
let a=i.getContext("2d");if(!a)return!1;a.drawImage(t,0,0);
let r=await new Promise(e=>i.toBlob(e,"image/png"));if(!r||"u"<typeof ClipboardItem||!navigator.clipboard?.write)return!1;return await navigator.clipboard.write([new ClipboardItem({"image/png":r})]),!0}catch{return!1}}
let e1=[{w:240,
label:"Desktop"},{w:168,
label:"Sidebar"},{w:104,
label:"Tiny"}];
function e2(){
let e=(0,n.useFeed)(e=>e.inspect),t=(0,n.useFeed)(e=>e.setInspect),r=(0,n.useFeed)(e=>e.theme),[s,o]=a.useState("dark"),[l,c]=a.useState(0),[d,h]=a.useState(!1),[f,u]=a.useState(!1),[g,m]=a.useState([]),[p,v]=a.useState(null),[b,y]=a.useState(!1),x=a.useRef(null),w=e=>{v(e),window.setTimeout(()=>v(null),1600)},j=e?e.thumb??(0,eC.genThumb)(e.id,e.title):"";if(a.useEffect(()=>{if(!e)return;o(r),c(0),h(!1),u(!1),m([]);
let t=!0;return e$(j).then(e=>t&&m(e)).catch(()=>{}),()=>{t=!1}},[e]),a.useEffect(()=>{if(!e)return;
let i=e=>{"Escape"===e.key&&t(null)};return window.addEventListener("keydown",i),()=>window.removeEventListener("keydown",i)},[e,t]),!e)return null;
let M=
```

