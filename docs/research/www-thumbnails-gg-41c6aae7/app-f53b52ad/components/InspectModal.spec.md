# InspectModal Specification

## Overview
- **Target file:** `src/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/InspectModal.tsx`
- **Source page:** https://www.thumbnails.gg/app
- **Interaction model:** click-driven modal, opened by clicking any feed card

## Exact CSS (verbatim from the target's stylesheet)

These rules are ALREADY PRESENT in `src/app/globals.css` — the site's stylesheet was
ported wholesale during the foundation phase. Do NOT re-declare them and do NOT convert
them to Tailwind utilities. Use the class names below and the component will match the
original exactly. They are reproduced here so you can see what each class does.

```css
.inspect-scrim {
  z-index:100;
  animation:enter-fade .2s var(--ease-out) both;
  background:#04050780;
  justify-content:center;
  align-items:center;
  padding:24px;
  display:flex;
  position:fixed;
  inset:0
}
.inspect-panel {
  --text-secondary:#ffffffd6;
  --text-muted:#ffffffa3;
  --text-faint:#ffffff75;
  background:linear-gradient(#ffffff0d,#fff0 26%),linear-gradient(#101116,#090a0d);
  border-radius:20px;
  width:100%;
  max-width:960px;
  max-height:90vh;
  padding:26px;
  position:relative;
  overflow-y:auto
}
.inspect-close {
  z-index:2;
  border:1px solid var(--border-default);
  width:34px;
  height:34px;
  color:var(--text-secondary);
  cursor:pointer;
  transition:background var(--dur-fast), color var(--dur-fast);
  background:#ffffff0a;
  border-radius:999px;
  justify-content:center;
  align-items:center;
  display:flex;
  position:absolute;
  top:16px;
  right:16px
}
.inspect-close:hover {
  color:var(--text-primary);
  background:#ffffff1a
}
.inspect-body {
  grid-template-columns:1.25fr 1fr;
  gap:26px;
  display:grid
}
@media (max-width:820px) {
  .inspect-body {
    grid-template-columns:1fr
  }
}
.inspect-left {
  flex-direction:column;
  gap:16px;
  min-width:0;
  display:flex
}
.inspect-right {
  flex-direction:column;
  gap:20px;
  min-width:0;
  display:flex
}
.inspect-preview {
  aspect-ratio:16/9;
  background:var(--bg-elevated);
  transition:filter var(--dur-base) var(--ease-out);
  border-radius:14px;
  position:relative;
  overflow:hidden
}
.inspect-preview img {
  width:100%;
  height:100%;
  display:block
}
.inspect-duration {
  color:#fff;
  background:#000c;
  border-radius:4px;
  padding:3px 4px;
  font-size:12px;
  font-weight:500;
  position:absolute;
  bottom:8px;
  right:8px
}
.inspect-safe {
  pointer-events:none;
  position:absolute;
  inset:0
}
.inspect-safe-badge {
  background:#ff3c3c2e;
  border:1px dashed #ff3c3ce6;
  border-radius:4px;
  width:64px;
  height:22px;
  position:absolute;
  bottom:8px;
  right:8px
}
.inspect-tools {
  flex-wrap:wrap;
  align-items:center;
  gap:8px;
  display:flex
}
.inspect-squint {
  flex:1;
  align-items:center;
  gap:8px;
  min-width:150px;
  display:flex
}
.inspect-eyebrow {
  letter-spacing:.1em;
  text-transform:uppercase;
  color:var(--text-secondary);
  font-size:11px;
  font-weight:600
}
.inspect-sizes {
  flex-wrap:wrap;
  align-items:flex-end;
  gap:14px;
  display:flex
}
.inspect-title {
  letter-spacing:-.01em;
  color:var(--text-primary);
  margin:0 0 8px;
  font-size:19px;
  font-weight:600;
  line-height:1.25
}
.inspect-meta {
  color:var(--text-secondary);
  font-size:13px;
  line-height:1.5
}
.inspect-yt {
  border:1px solid var(--border-default);
  height:32px;
  color:var(--text-primary);
  transition:background var(--dur-fast);
  border-radius:999px;
  align-items:center;
  gap:6px;
  margin-top:10px;
  padding:0 12px;
  font-size:13px;
  font-weight:500;
  text-decoration:none;
  display:inline-flex
}
.inspect-yt:hover {
  background:#ffffff0f
}
.inspect-swatch {
  cursor:pointer;
  width:38px;
  height:38px;
  transition:transform var(--dur-fast) var(--ease-out);
  border:1px solid #ffffff24;
  border-radius:8px;
  padding:0
}
.inspect-swatch:hover {
  transform:translateY(-2px)scale(1.05)
}
.inspect-actions {
  flex-wrap:wrap;
  gap:8px;
  display:flex
}
```

## Deobfuscated source from the target's JS bundle

This is the original component, recovered from the production bundle. `JSX(tag, props)`
is `React.createElement`. Reconstruct it as idiomatic, strictly-typed TSX — same DOM,
same class names, same inline styles, same values.

```js
function(e,t){if(t||!e)return null;
let i=/ytimg\.com\/vi\/([A-Za-z0-9_-]{6,})\//.exec(e);return i?i[1]:null}(e.thumb,e.isTest),k=[];l>0&&k.push(`blur(${l}px)`),d&&k.push("grayscale(1)");
let S=k.length?k.join(" "):void 0,I=async()=>{if(x.current&&!b){y(!0);try{
let t=await eo(x.current,2);ec(t,`card_${e5(e.title)}.png`),w("Card saved")}catch{w("Export failed")}finally{y(!1)}}},A=async()=>{if(!b){y(!0);try{await el(j,`thumbnail_${e5(e.title)}.png`),w("Thumbnail saved")}catch{w("Export failed")}finally{y(!1)}}};return
JSX("div",{className:"inspect-scrim",
onClick:e=>{e.target===e.currentTarget&&t(null)},
children:
JSX("div",{className:"inspect-panel glass-dark anim-scale",
role:"dialog","aria-modal":"true",
children:[
JSX("button",{className:"inspect-close focus-ring",
onClick:()=>t(null),"aria-label":"Close",
children:
JSX("svg",{width:"18",
height:"18",
viewBox:"0 0 24 24",
fill:"none",
children:
JSX("path",{d:"M6 6l12 12M18 6L6 18",
stroke:"currentColor",
strokeWidth:"1.8",
strokeLinecap:"round"})})}),
JSX("div",{className:"inspect-body",
children:[
JSX("div",{className:"inspect-left",
children:[
JSX("div",{className:"inspect-preview",
style:{filter:S},
children:[
JSX("img",{src:j,
alt:"",
draggable:!1,
style:{objectFit:e.imageFit}}),e.showDuration&&""!==e.duration.trim()&&
JSX("span",{className:"inspect-duration",
children:e.duration}),f&&
JSX("div",{className:"inspect-safe",
children:
JSX("div",{className:"inspect-safe-badge"})})]}),
JSX("div",{className:"inspect-tools",
children:[
JSX("div",{className:"inspect-squint",
children:[
JSX("span",{style:{fontSize:12,
color:"var(--text-muted)"},
children:"Squint"}),
JSX("input",{type:"range",
min:0,
max:12,
value:l,
onChange:e=>c(Number(e.target.value)),
style:{flex:1,
accentColor:"#fff"}}),
JSX("span",{style:{fontFamily:"var(--font-mono)",
fontSize:11,
color:"var(--text-faint)",
minWidth:28},
children:[l,"px"]})]}),
JSX(e3,{active:d,
onClick:()=>h(e=>!e),
children:"Grayscale"}),
JSX(e3,{active:f,
onClick:()=>u(e=>!e),
children:"Safe-area"})]}),
JSX("div",{className:"inspect-eyebrow",
children:"At feed size"}),
JSX("div",{className:"inspect-sizes",
children:e1.map(t=>
JSX("div",{style:{display:"flex",
flexDirection:"column",
gap:5,
alignItems:"center"},
children:[
JSX("div",{style:{width:t.w,
aspectRatio:"16 / 9",
borderRadius:8,
overflow:"hidden",
background:"var(--bg-elevated)"},
children:
JSX("img",{src:j,
alt:"",
draggable:!1,
style:{width:"100%",
height:"100%",
objectFit:e.imageFit,
filter:d?"grayscale(1)":void 0}})}),
JSX("span",{style:{fontSize:10.5,
color:"var(--text-faint)"},
children:[t.label," · ",t.w,"px"]})]},t.label))})]}),
JSX("div",{className:"inspect-right",
children:[
JSX("div",{children:[
JSX("div",{className:"inspect-eyebrow",
style:{marginBottom:8},
children:e.isTest?"Your thumbnail":"Competitor"}),
JSX("h2",{className:"inspect-title",
children:e.title}),
JSX("div",{className:"inspect-meta",
children:[e.channel,e.verified?" · verified":""]}),
JSX("div",{className:"inspect-meta",
children:[e.views," · ",e.age,e.duration?` \xb7 ${e.duration}`:""]}),M&&
JSX("a",{className:"inspect-yt focus-ring",
href:`https://www.youtube.com/watch?v=${M}`,
target:"_blank",
rel:"noopener noreferrer",
children:["Open on YouTube",
JSX("svg",{width:"13",
height:"13",
viewBox:"0 0 24 24",
fill:"none",
children:
JSX("path",{d:"M7 17L17 7M9 7h8v8",
stroke:"currentColor",
strokeWidth:"1.8",
strokeLinecap:"round",
strokeLinejoin:"round"})})]})]}),
JSX("div",{children:[
JSX("div",{className:"inspect-eyebrow",
style:{marginBottom:8},
children:"Palette"}),
JSX("div",{style:{display:"flex",
gap:6},
children:[0===g.length&&
JSX("span",{style:{fontSize:12,
color:"var(--text-faint)"},
children:"reading colors…"}),g.map(e=>
JSX("button",{className:"inspect-swatch focus-ring",
style:{background:e},
title:`${e} — click to copy`,
onClick:()=>{navigator.clipboard?.writeText(e),w(`Copied ${e}`)}},e))]})]}),
JSX("div",{children:[
JSX("div",{style:{display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:8},
children:[
JSX("span",{className:"inspect-eyebrow",
children:"Exportable card"}),
JSX(e8,{value:s,
onChange:o})]}),
JSX("div",{style:{display:"flex",
justifyContent:"center",
padding:"14px 0",
background:"var(--bg-sunken)",
borderRadius:12,
border:"1px solid var(--border-subtle)"},
children:
JSX("div",{ref:x,
className:"yt-root","data-theme":s,
style:{width:320,
padding:12},
children:
JSX(eQ.VideoCard,{vm:e})})})]}),
JSX("div",{className:"inspect-actions",
children:[
JSX("button",{onClick:A,
disabled:b,
className:"btn-primary focus-ring",
style:{height:38,
fontSize:13,
padding:"0 14px"},
children:"Export thumbnail"}),
JSX("button",{onClick:I,
disabled:b,
className:"focus-ring",
style:e4,
children:"Export card"}),
JSX("button",{onClick:async()=>w(await e0(j)?"Image copied":"Copy not supported"),
disabled:b,
className:"focus-ring",
style:e4,
children:"Copy image"}),
JSX("button",{onClick:()=>{navigator.clipboard?.writeText(e.title),w("Title copied")},
className:"focus-ring",
style:e4,
children:"Copy title"})]}),
JSX("div",{style:{minHeight:16,
fontSize:11.5,
color:p?"#3dd68c":"var(--text-faint)"},
children:b?"Working…":p??"Click a swatch to copy its hex."})]})]})]})})}
function e5(e){return e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40)||"thumbnail"}
function e3({active:e,
onClick:t,
children:a}){return
JSX("button",{onClick:t,
className:"focus-ring",
style:{height:30,
padding:"0 12px",
borderRadius:8,
border:`1px solid ${e?"rgba(255,255,255,0.4)":"var(--border-default)"}`,
background:e?"rgba(255,255,255,0.1)":"transparent",
color:e?"var(--text-primary)":"var(--text-muted)",
fontSize:12.5,
fontWeight:500,
cursor:"pointer",
fontFamily:"inherit",
transition:"background var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast)"},
children:a})}
function e8({value:e,
onChange:t}){return
JSX("div",{style:{display:"flex",
gap:2,
padding:2,
borderRadius:8,
border:"1px solid var(--border-default)"},
children:["dark","light"].map(a=>
JSX("button",{onClick:()=>t(a),
style:{height:22,
padding:"0 10px",
borderRadius:6,
border:"none",
cursor:"pointer",
fontSize:11.5,
fontWeight:500,
fontFamily:"inherit",
textTransform:"capitalize",
background:e===a?"#fff":"transparent",
color:e===a?"var(--accent-fg)":"var(--text-secondary)"},
children:a},a))})}
let e4={height:38,
padding:"0 14px",
borderRadius:999,
border:"1px solid var(--border-default)",
background:"transparent",
color:"var(--text-secondary)",
fontSize:13,
fontWeight:500,
cursor:"pointer",
fontFamily:"inherit"},
```

