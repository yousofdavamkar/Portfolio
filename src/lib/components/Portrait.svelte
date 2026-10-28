<script lang="ts">let {compact=false}=$props();</script>
<div class:compact class="portrait-scene">
 <div class="arch arch-outer"></div><div class="arch arch-middle"></div><div class="arch arch-white"></div>
 <img class="portrait" src="/images/portrait.png" alt="Portrait from Yosef’s original portfolio design" width="850" height="585" fetchpriority="high" />
 <span class="orb orb-one"></span><span class="orb orb-two"></span><span class="orb orb-three"></span>
</div>
<style>
 .portrait-scene{position:relative;width:100%;height:100%;min-height:500px;isolation:isolate;overflow:hidden}
 .arch{position:absolute;left:50%;transform:translateX(-50%);border-radius:50% 50% 0 0;bottom:-15%;}
 .arch-outer{width:112%;height:106%;background:#252525;z-index:-3}.arch-middle{width:84%;height:86%;background:#202020;z-index:-2}.arch-white{width:66%;height:67%;background:white;z-index:-1}
 .portrait{position:absolute;bottom:-7%;left:50%;transform:translateX(-50%);width:auto;max-width:none;height:100%}
 .orb{position:absolute;border-radius:50%;background:linear-gradient(120deg,var(--primary),#fff6ac);width:30px;height:30px}
 .orb-one{left:20%;top:41%;width:27px;height:27px}.orb-two{left:11%;bottom:24%;width:44px;height:44px}.orb-three{right:13%;bottom:1%;width:45px;height:45px}
 .compact{min-height:480px}.compact .portrait{height:100%;bottom:-8%}
 @media(max-width:767px){.portrait-scene{min-height:410px}.arch-outer{height:93%;width:120%}.arch-middle{height:77%;width:105%}.arch-white{height:64%;width:85%}.portrait{height:100%;bottom:-8%}.orb-one{left:18%;top:30%}.orb-two{left:9%;bottom:38%;width:32px;height:32px}.orb-three{right:8%;bottom:45%;width:32px;height:32px}}
</style>
