# WatchView Specification

## Overview
- **Target file:** `src/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/WatchView.tsx`
- **Source page:** https://www.thumbnails.gg/app
- **Interaction model:** infinite scroll on the recommendation rail + click-to-inspect

## Exact CSS (verbatim from the target's stylesheet)

These rules are ALREADY PRESENT in `src/app/globals.css` — the site's stylesheet was
ported wholesale during the foundation phase. Do NOT re-declare them and do NOT convert
them to Tailwind utilities. Use the class names below and the component will match the
original exactly. They are reproduced here so you can see what each class does.

```css
.ytw-page {
  grid-template-columns:minmax(0,1fr) 402px;
  gap:24px;
  max-width:1280px;
  margin:0 auto;
  padding:24px;
  display:grid
}
.ytw-main {
  min-width:0
}
.ytw-player {
  aspect-ratio:16/9;
  background:#000;
  border-radius:12px;
  position:relative;
  overflow:hidden
}
.ytw-player-poster {
  object-fit:cover;
  width:100%;
  height:100%;
  display:block
}
.ytw-caption {
  color:#fff;
  white-space:nowrap;
  background:#080808bf;
  border-radius:2px;
  padding:2px 8px;
  font-size:22px;
  font-weight:500;
  position:absolute;
  bottom:60px;
  left:50%;
  transform:translate(-50%)
}
.ytw-controls {
  background:linear-gradient(#0000,#0000008c);
  padding:0 12px 6px;
  position:absolute;
  bottom:0;
  left:0;
  right:0
}
.ytw-scrub {
  background:#ffffff4d;
  border-radius:2px;
  height:3px;
  margin-bottom:6px;
  position:relative
}
.ytw-scrub-fill {
  background:red;
  border-radius:2px;
  position:absolute;
  top:0;
  bottom:0;
  left:0
}
.ytw-scrub-knob {
  background:red;
  border-radius:50%;
  width:13px;
  height:13px;
  position:absolute;
  top:50%;
  transform:translate(-50%,-50%)
}
.ytw-ctl-row {
  color:#fff;
  align-items:center;
  gap:18px;
  height:36px;
  display:flex
}
.ytw-time {
  color:#fff;
  font-size:13px
}
.ytw-ctl-spacer {
  flex:1
}
.ytw-title {
  color:var(--yt-text-primary);
  margin:12px 0;
  font-size:20px;
  font-weight:700;
  line-height:28px
}
.ytw-owner {
  flex-wrap:wrap;
  align-items:center;
  gap:12px;
  display:flex
}
.ytw-owner-avatar {
  background:var(--yt-skeleton);
  border-radius:50%;
  width:40px;
  height:40px;
  overflow:hidden
}
.ytw-owner-avatar img {
  object-fit:cover;
  width:100%;
  height:100%
}
.ytw-owner-name {
  color:var(--yt-text-primary);
  font-size:16px;
  font-weight:500;
  line-height:18px
}
.ytw-owner-subs {
  color:var(--yt-text-secondary);
  font-size:12px
}
.ytw-subscribe {
  background:var(--yt-text-primary);
  height:36px;
  color:var(--yt-bg);
  border:none;
  border-radius:18px;
  margin-left:4px;
  padding:0 16px;
  font-size:14px;
  font-weight:500
}
.ytw-actions {
  align-items:center;
  gap:8px;
  margin-left:auto;
  display:flex
}
.ytw-action {
  background:var(--yt-chip-bg);
  height:36px;
  color:var(--yt-text-primary);
  white-space:nowrap;
  border-radius:18px;
  align-items:center;
  gap:7px;
  padding:0 14px;
  font-size:14px;
  font-weight:500;
  display:flex
}
.ytw-action-split {
  background:var(--yt-chip-bg);
  height:36px;
  color:var(--yt-text-primary);
  border-radius:18px;
  align-items:center;
  display:flex;
  overflow:hidden
}
.ytw-action-split>span {
  align-items:center;
  gap:7px;
  height:100%;
  padding:0 14px;
  font-size:14px;
  font-weight:500;
  display:flex
}
.ytw-action-split>span:first-child {
  border-right:1px solid var(--yt-divider)
}
.ytw-reco-chips {
  scrollbar-width:none;
  gap:8px;
  margin-bottom:14px;
  display:flex;
  overflow-x:auto
}
.ytw-reco-chips::-webkit-scrollbar {
  display:none
}
.ytw-reco-list {
  flex-direction:column;
  gap:8px;
  display:flex
}
.ytw-reco {
  gap:8px;
  display:flex
}
.ytw-reco-thumb {
  background:var(--yt-skeleton);
  border-radius:8px;
  flex-shrink:0;
  width:168px;
  height:94px;
  position:relative;
  overflow:hidden
}
.ytw-reco-thumb img {
  width:100%;
  height:100%;
  display:block
}
.ytw-reco-thumb .yt-safe-badge-zone {
  width:40px;
  height:14px;
  bottom:6px;
  right:6px
}
.ytw-reco-text {
  flex:1;
  min-width:0;
  padding-top:2px
}
.ytw-reco-title {
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
.ytw-reco-channel,.ytw-reco-meta {
  color:var(--yt-text-secondary);
  white-space:nowrap;
  text-overflow:ellipsis;
  font-size:12px;
  line-height:16px;
  overflow:hidden
}
.ytw-reco-dots {
  opacity:0;
  color:var(--yt-text-primary);
  flex-shrink:0
}
.ytw-reco:hover .ytw-reco-dots {
  opacity:1
}
.ytw-reco[data-test=true][data-highlight=true] .ytw-reco-thumb {
  outline-offset:2px;
  outline:2px solid #fff
}
```

## Deobfuscated source from the target's JS bundle

This is the original component, recovered from the production bundle. `JSX(tag, props)`
is `React.createElement`. Reconstruct it as idiomatic, strictly-typed TSX — same DOM,
same class names, same inline styles, same values.

```js

function eT({vm:e,
highlight:t=!1,
showSafeArea:a=!1,
onClick:r,
onDragOver:s,
onDrop:n}){
let o=e.thumb??(0,eC.genThumb)(e.id,e.title),l="LIVE"===e.duration.trim().toUpperCase();return
JSX("div",{className:"ytw-reco","data-test":e.isTest,"data-highlight":t,
onClick:r,
onDragOver:s,
onDrop:n,
children:[
JSX("div",{className:"ytw-reco-thumb",
children:[
JSX("img",{src:o,
alt:"",
style:{objectFit:e.imageFit},
draggable:!1}),e.showDuration&&""!==e.duration.trim()&&
JSX("span",{className:"yt-duration","data-live":l,
children:e.duration}),e.watchedPercent>0&&
JSX("div",{className:"yt-progress-track",
children:
JSX("div",{className:"yt-progress-fill",
style:{width:`${Math.min(100,e.watchedPercent)}%`}})}),a&&e.isTest&&
JSX("div",{className:"yt-safe-overlay",
children:
JSX("div",{className:"yt-safe-badge-zone"})})]}),
JSX("div",{className:"ytw-reco-text",
children:[
JSX("h3",{className:"ytw-reco-title",
children:e.title}),
JSX("div",{className:"ytw-reco-channel",
children:e.channel}),
JSX("div",{className:"ytw-reco-meta",
children:[e.views," • ",e.age]})]}),
JSX("span",{className:"ytw-reco-dots",
children:
JSX(eE,{})})]})}var eN=e.i(5716);
let eR=(0,eC.genThumb)("__nowplaying__","Frontline Review"),eL=["All","From Inside Creators","For you","Recently uploaded","Watched"];
function eP({children:e}){return
JSX("svg",{width:"24",
height:"24",
viewBox:"0 0 24 24",
fill:"currentColor",
children:e})}
function eB({cards:e,
blur:t,
grayscale:a,
highlight:r,
showSafeArea:s,
scrollRootRef:o,
resetKey:l}){
let c=(0,n.useFeed)(e=>e.setInspect),d=(0,n.useFeed)(e=>e.uploadHandler),h=(0,n.useFeed)(e=>e.dropHandler),{visible:f,
sentinelRef:u}=(0,eN.useInfiniteScroll)(e,{rootRef:o,
resetKey:l}),g=[];t>0&&g.push(`blur(${t}px)`),a&&g.push("grayscale(1)");
let m=g.length?g.join(" "):void 0;return
JSX(i.Fragment,{children:[
JSX(eA.Masthead,{}),
JSX("div",{className:"ytw-page",
children:[
JSX("div",{className:"ytw-main",
children:[
JSX("div",{className:"ytw-player",
children:[
JSX("img",{className:"ytw-player-poster",
src:eR,
alt:"",
draggable:!1}),
JSX("span",{className:"ytw-caption",
children:"Please just stay behind the vehicles."}),
JSX("div",{className:"ytw-controls",
children:[
JSX("div",{className:"ytw-scrub",
children:[
JSX("div",{className:"ytw-scrub-fill",
style:{width:"26%"}}),
JSX("div",{className:"ytw-scrub-knob",
style:{left:"26%"}})]}),
JSX("div",{className:"ytw-ctl-row",
children:[
JSX(eP,{children:
JSX("path",{d:"M8 5v14l11-7z"})}),
JSX(eP,{children:
JSX("path",{d:"M6 6l6 6-6 6V6zm8 0h2v12h-2z"})}),
JSX(eP,{children:
JSX("path",{d:"M3 9v6h4l5 5V4L7 9H3zm13 3a4 4 0 00-2.5-3.7v7.4A4 4 0 0016 12z"})}),
JSX("span",{className:"ytw-time",
children:"7:24 / 28:07"}),
JSX("span",{className:"ytw-ctl-spacer"}),
JSX(eP,{children:
JSX("path",{d:"M4 9h4v2H6v2h2v2H4V9zm6 0h6v2h-4v.5h4V16h-6v-2h4v-.5h-4V9z"})}),
JSX(eP,{children:
JSX("path",{d:"M12 8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zm9-2l-2-1.5.3-2.5-2.5-.5L15.5 5 12 6 8.5 5 7.2 7.5l-2.5.5L5 10.5 3 12l2 1.5-.3 2.5 2.5.5L8.5 19 12 18l3.5 1 1.3-2.5 2.5-.5-.3-2.5L21 12z"})}),
JSX(eP,{children:
JSX("path",{d:"M3 5h18v14H3V5zm2 4v6h14V9H5z"})}),
JSX(eP,{children:
JSX("path",{d:"M3 3h7v2H5v5H3V3zm11 0h7v7h-2V5h-5V3zM3 14h2v5h5v2H3v-7zm16 0h2v7h-7v-2h5v-5z"})})]})]})]}),
JSX("h1",{className:"ytw-title",
children:"Bodycam Footage Breakdown — The Full Analysis Nobody Expected"}),
JSX("div",{className:"ytw-owner",
children:[
JSX("span",{className:"ytw-owner-avatar",
children:
JSX("span",{style:{width:"100%",
height:"100%",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"#b3261e",
color:"#fff",
fontWeight:600},
children:"F"})}),
JSX("span",{children:[
JSX("span",{style:{display:"flex",
alignItems:"center",
gap:5},
children:[
JSX("span",{className:"ytw-owner-name",
children:"Frontline"}),
JSX("svg",{width:"14",
height:"14",
viewBox:"0 0 24 24",
fill:"none",
children:[
JSX("circle",{cx:"12",
cy:"12",
r:"10",
fill:"var(--yt-text-secondary)"}),
JSX("path",{d:"M9.5 12.5l1.8 1.8 3.6-3.8",
stroke:"var(--yt-bg)",
strokeWidth:"1.8",
strokeLinecap:"round",
strokeLinejoin:"round"})]})]}),
JSX("span",{className:"ytw-owner-subs",
children:"2.7M subscribers"})]}),
JSX("button",{className:"ytw-subscribe",
children:"Subscribe"}),
JSX("div",{className:"ytw-actions",
children:[
JSX("span",{className:"ytw-action-split",
children:[
JSX("span",{children:[
JSX("svg",{width:"22",
height:"22",
viewBox:"0 0 24 24",
fill:"currentColor",
children:
JSX("path",{d:"M3 11h3v10H3V11zm5 0l4-8a2 2 0 012 2v4h5a2 2 0 012 2l-2 7a2 2 0 01-2 1H8V11z"})}),"18K"]}),
JSX("span",{children:
JSX("svg",{width:"22",
height:"22",
viewBox:"0 0 24 24",
fill:"currentColor",
children:
JSX("path",{d:"M21 13h-3V3h3v10zm-5 0l-4 8a2 2 0 01-2-2v-4H5a2 2 0 01-2-2l2-7a2 2 0 012-1h8v8z"})})})]}),
JSX("span",{className:"ytw-action",
children:[
JSX("svg",{width:"22",
height:"22",
viewBox:"0 0 24 24",
fill:"currentColor",
children:
JSX("path",{d:"M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z"})}),"Share"]}),
JSX("span",{className:"ytw-action",
children:[
JSX("svg",{width:"22",
height:"22",
viewBox:"0 0 24 24",
fill:"none",
children:
JSX("path"
```

