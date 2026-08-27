# FlashOverlay Specification

## Overview
- **Target file:** `src/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/FlashOverlay.tsx`
- **Source page:** https://www.thumbnails.gg/app
- **Interaction model:** time-driven: ready → show (timed) → recall (click) → result

## Exact CSS (verbatim from the target's stylesheet)

These rules are ALREADY PRESENT in `src/app/globals.css` — the site's stylesheet was
ported wholesale during the foundation phase. Do NOT re-declare them and do NOT convert
them to Tailwind utilities. Use the class names below and the component will match the
original exactly. They are reproduced here so you can see what each class does.

```css
.glass-2 {
  background:var(--glass-2-bg);
  border:1px solid var(--glass-2-border);
  -webkit-backdrop-filter:var(--glass-2-blur);
  box-shadow:inset 0 1px #ffffff14,0 24px 60px -16px #000000b3
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
.btn-primary {
  background:var(--accent);
  color:var(--accent-fg);
  border-radius:var(--radius-full);
  transition:transform var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out);
  border:none;
  font-weight:600
}
.btn-primary:hover {
  filter:brightness(.94)
}
.btn-primary:active {
  transform:scale(.985)
}
@media (prefers-reduced-transparency:reduce) {
  .glass-1 {
    background:var(--bg-elevated);
    -webkit-backdrop-filter:none
  }
  .glass-2,.glass-3 {
    background:var(--bg-elevated-2);
    -webkit-backdrop-filter:none
  }
}
@keyframes flash-ping {
  0% {
    opacity:.9;
    transform:translate(-50%,-50%)scale(.35)
  }
  to {
    opacity:0;
    transform:translate(-50%,-50%)scale(1.7)
  }
}
@keyframes flash-count {
  0% {
    transform:scaleX(1)
  }
  to {
    transform:scaleX(0)
  }
}
@keyframes flash-target {
  0% {
    opacity:0;
    transform:scale(1.06)
  }
  to {
    opacity:1;
    transform:scale(1)
  }
}
.anim-scale {
  animation:enter-scale .6s var(--ease-out) both;
  animation-delay:var(--d,0s)
}
.btn-primary {
  position:relative;
  overflow:hidden
}
.btn-primary:after {
  content:"";
  opacity:0;
  pointer-events:none;
  background:linear-gradient(90deg,#0000,#ffffff8c,#0000);
  width:40%;
  position:absolute;
  top:0;
  bottom:0;
  left:0
}
.btn-primary:hover:after {
  opacity:.7;
  animation:sheen .9s var(--ease-out)
}
```

## Deobfuscated source from the target's JS bundle

This is the original component, recovered from the production bundle. `JSX(tag, props)`
is `React.createElement`. Reconstruct it as idiomatic, strictly-typed TSX — same DOM,
same class names, same inline styles, same values.

```js
e6={phase:"idle",
index:0,
seed:1,
durationMs:1e3,
click:null,
markers:[],
hit:null,
distance:null,
targets:[]};
function e7({flash:e,
setFlash:t,
previewRef:r,
viewMode:s}){
let n=a.useRef(null);a.useEffect(()=>{if("show"!==e.phase)return;
let i=setTimeout(()=>t(e=>"show"===e.phase?{...e,
phase:"recall"}:e),e.durationMs);return()=>clearTimeout(i)},[e.phase,e.durationMs,t]);
let o=e=>{r.current&&(r.current.scrollTop=0),t(t=>({...t,
phase:"show",
durationMs:e,
index:Math.floor(Math.random()*("mobile"===s?2:"watch"===s?5:6)),
seed:Math.floor(1e6*Math.random())+1,
click:null,
hit:null,
distance:null,
targets:[]}))},l=()=>t(()=>({...e6}));if("ready"===e.phase)return
JSX("div",{ref:n,
style:e9(!0,"rgba(5,6,8,0.78)"),
children:
JSX("div",{className:"glass-2 anim-scale",
style:{width:392,
maxWidth:"88%",
padding:26,
borderRadius:16,
textAlign:"center"},
children:[
JSX("div",{className:"eyebrow",
style:{marginBottom:12},
children:"First-impression test"}),
JSX("h3",{style:{margin:"0 0 8px",
fontSize:21,
fontWeight:600,
letterSpacing:"-0.02em"},
children:"One second. Where does your eye go?"}),
JSX("p",{style:{margin:"0 0 18px",
fontSize:13.5,
lineHeight:1.55,
color:"var(--text-secondary)"},
children:["The feed flashes for ",(e.durationMs/1e3).toString(),"s, then hides. Click the spot your eye landed on first. We reveal whether it was your thumbnail."]}),
JSX("div",{style:{display:"flex",
justifyContent:"center",
marginBottom:18},
children:
JSX(tt,{value:e.durationMs,
onChange:e=>t(t=>({...t,
durationMs:e}))})}),
JSX("div",{style:{display:"flex",
gap:8,
justifyContent:"center"},
children:[
JSX("button",{onClick:()=>o(e.durationMs),
className:"btn-primary focus-ring",
style:{height:40,
padding:"0 22px",
fontSize:14},
children:"Start flash"}),
JSX("button",{onClick:l,
className:"focus-ring",
style:te,
children:"Cancel"})]})]})});if("show"===e.phase)return
JSX("div",{ref:n,
style:e9(!1),
children:
JSX("div",{style:{position:"absolute",
top:0,
left:0,
right:0,
height:3,
background:"rgba(255,255,255,0.14)"},
children:
JSX("div",{style:{height:"100%",
background:"#fff",
transformOrigin:"left",
animation:`flash-count ${e.durationMs}ms linear forwards`}})})});if("recall"===e.phase)return
JSX("div",{ref:n,
onClick:e=>{
let i=n.current,a=r.current;if(!i||!a)return;
let s=i.getBoundingClientRect(),o=e.clientX-s.left,l=e.clientY-s.top,c=Array.from(a.querySelectorAll('[data-test="true"]')),d=!1,h=1/0,f=[];for(
let t of c){
let i=(t.querySelector(".yt-thumb-wrap, .ytm-thumb-wrap, .ytw-reco-thumb")??t).getBoundingClientRect();f.push({x:i.left-s.left,
y:i.top-s.top,
w:i.width,
h:i.height}),e.clientX>=i.left&&e.clientX<=i.right&&e.clientY>=i.top&&e.clientY<=i.bottom&&(d=!0);
let a=i.left+i.width/2-s.left-o,r=i.top+i.height/2-s.top-l;h=Math.min(h,Math.hypot(a,r))}t(e=>({...e,
phase:"result",
click:{x:o,
y:l},
hit:d,
distance:Number.isFinite(h)?Math.round(h):null,
markers:[...e.markers,{x:o,
y:l,
hit:d}],
targets:f}))},
style:{...e9(!0,"rgba(6,7,9,0.975)"),
cursor:"crosshair"},
children:
JSX("div",{style:{textAlign:"center",
pointerEvents:"none",
padding:24},
children:[
JSX("div",{className:"eyebrow",
style:{marginBottom:10},
children:"Recall"}),
JSX("h3",{style:{margin:"0 0 8px",
fontSize:22,
fontWeight:600,
letterSpacing:"-0.02em"},
children:"Click where your eye landed first"}),
JSX("p",{style:{margin:0,
fontSize:13.5,
color:"var(--text-muted)"},
children:"Trust your gut. Click anywhere on the screen."})]})});
let c=0===e.targets.length?{tone:"muted",
text:"No thumbnail was in the feed for this run."}:e.hit?{tone:"good",
text:"Direct hit. Your thumbnail caught the eye first."}:null!=e.distance&&e.distance<260?{tone:"near",
text:`Close. Your eye landed ${e.distance}px from your thumbnail.`}:{tone:"miss",
text:"Your eye went elsewhere. Your thumbnail is outlined below."};return
JSX("div",{ref:n,
style:{...e9(!1),
pointerEvents:"none"},
children:[e.markers.slice(0,-1).map((e,t)=>
JSX("span",{style:{position:"absolute",
left:e.x,
top:e.y,
width:10,
height:10,
borderRadius:999,
transform:"translate(-50%,-50%)",
background:e.hit?"rgba(61,214,140,0.5)":"rgba(255,255,255,0.4)",
border:"1px solid rgba(255,255,255,0.5)"}},t)),e.targets.map((e,t)=>
JSX("div",{style:{position:"absolute",
left:e.x,
top:e.y,
width:e.w,
height:e.h,
border:"2px solid #fff",
borderRadius:10,
boxShadow:"0 0 0 4px rgba(255,255,255,0.22), 0 0 22px rgba(255,255,255,0.35)",
animation:"flash-target 0.4s var(--ease-out) both"},
children:
JSX("span",{style:{position:"absolute",
top:-22,
left:0,
fontSize:10.5,
fontWeight:600,
letterSpacing:"0.08em",
textTransform:"uppercase",
color:"#fff",
background:"rgba(8,9,11,0.7)",
padding:"2px 6px",
borderRadius:5,
whiteSpace:"nowrap"},
children:"Your thumbnail"})},t)),e.click&&
JSX("div",{style:{position:"absolute",
left:e.click.x,
top:e.click.y},
children:[
JSX("span",{style:{position:"absolute",
width:54,
height:54,
borderRadius:999,
border:"2px solid "+(e.hit?"#3dd68c":"#fff"),
animation:"flash-ping 0.9s var(--ease-out) infinite"}}),
JSX("span",{style:{position:"absolute",
width:14,
height:14,
borderRadius:999,
transform:"translate(-50%,-50%)",
background:e.hit?"#3dd68c":"#fff",
boxShadow:"0 0 0 3px rgba(8,9,11,0.6)"}}),
JSX("span",{style:{position:"absolute",
top:14,
left:12,
fontSize:10.5,
fontWeight:600,
letterSpacing:"0.08em",
textTransform:"uppercase",
color:"#fff",
background:"rgba(8,9,11,0.7)",
padding:"2px 6px",
borderRadius:5,
whiteSpace:"nowrap"},
children:"You looked here"})]}),
JSX("div",{className:"glass-2 anim-in",
style:{position:"absolute",
left:"50%",
bottom:22,
transform:"translateX(-50%)",
width:460,
maxWidth:"92%",
padding:"14px 16px",
borderRadius:14,
pointerEvents:"auto",
display:"flex",
alignItems:"center",
gap:14},
children:[
JSX("span",{style:{width:8,
height:8,
borderRadius:999,
flexShrink:0,
background:"good"===c.tone?"#3dd68c":"near"===c.tone?"#fff":"var(--text-muted)",
boxShadow:"good"===c.tone?"0 0 10px rgba(61,214,140,0.8)":void 0}}),
JSX("span",{style:{flex:1,
fontSize:13.5,
fontWeight:500,
color:"var(--text-primary)"},
children:c.text}),
JSX("button",{onClick:()=>o(e.durationMs),
className:"btn-primary focus-ring",
style:{height:32,
padding:"0 14px",
fontSize:12.5},
children:"Run again"}),
JSX("button",{onClick:l,
className:"focus-ring",
style:{...te,
height:32,
padding:"0 12px",
fontSize:12.5},
children:"Exit"})]})]})}
function e9(e,t){return{position:"absolute",
inset:0,
zIndex:60,
pointerEvents:e?"auto":"none",
background:t,
display:t?"flex":void 0,
alignItems:t?"center":void 0,
justifyContent:t?"center":void 0,
backdropFilter:t?"blur(4px)":void 0,
WebkitBackdropFilter:t?"blur(4px)":void 0}}
let te={height:40,
padding:"0 18px",
borderRadius:999,
border:"1px solid var(--border-default)",
background:"transparent",
color:"var(--text-secondary)",
fontSize:14,
fontWeight:500,
cursor:"pointer",
fontFamily:"inherit"};
function tt({value:e,
onChange:t}){
let a=[{ms:500,
label:"0.5s"},{ms:1e3,
label:"1s"},{ms:2e3,
label:"2s"}],r=Math.max(0,a.findIndex(t=>t.ms===e));return
JSX("div",{className:"seg",
style:{gridTemplateColumns:`repeat(${a.length}, 1fr)`,
width:200},
children:[
JSX("s
```

