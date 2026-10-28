<script lang="ts">
 import {scrollProgress} from '#lib/motion/scene.js';
</script>
<div class="scroll-progress" aria-hidden="true"><div {@attach scrollProgress}></div></div>
<div class="scene-graphics" aria-hidden="true">
 <div class="scene-orbit">
  <svg viewBox="0 0 420 420" fill="none">
   <circle cx="210" cy="210" r="178"/>
   <circle cx="210" cy="210" r="149" stroke-dasharray="2 14"/>
   <ellipse cx="210" cy="210" rx="203" ry="92" transform="rotate(-35 210 210)"/>
   <circle class="orbit-dot" cx="357" cy="110" r="9"/>
   <path class="orbit-star" d="M86 286v30m-15-15h30m-25-10 20 20m-20 0 20-20"/>
  </svg>
 </div>
 <span class="scene-coordinate">DESIGN × DEVELOPMENT</span>
</div>
<style>
 .scroll-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:30;pointer-events:none}
 .scroll-progress>div{width:100%;height:100%;background:var(--primary);transform:scaleX(0);transform-origin:left}
 .scene-graphics{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
 .scene-orbit{position:absolute;right:-170px;top:37%;width:420px;opacity:.12;color:var(--primary)}
 svg{width:100%;stroke:currentColor;stroke-width:1}
 .orbit-dot{fill:currentColor;stroke:none}.orbit-star{stroke-width:2}
 .scene-coordinate{position:absolute;left:18px;top:50%;writing-mode:vertical-rl;transform:rotate(180deg);font-size:8px;letter-spacing:4px;color:#ffffff28}
 @media(max-width:767px){.scene-orbit{right:-220px;top:45%;opacity:.08}.scene-coordinate{display:none}}
 @media(prefers-reduced-motion:reduce){.scene-orbit{transform:none!important}}
</style>
