<script lang="ts">let {class:className=''}=$props();</script>
<div class={`ornament ${className}`} aria-hidden="true">
 {#each Array(10) as _,i}<span style={`inset:0 ${i*6}px ${i*6}px;border-radius:0 0 ${120-i*6}px ${120-i*6}px`}></span>{/each}
</div>
<style>.ornament{position:absolute;width:240px;height:355px;pointer-events:none;color:var(--primary);opacity:.4}.ornament span{position:absolute;border:1px solid currentColor;border-top:0}</style>
