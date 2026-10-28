import { createStore } from 'zustand/vanilla';
import type { Readable } from 'svelte/store';
export function createPreferences() {
  const store=createStore<{accent:string;projectIndex:number}>()(()=>({accent:'yellow',projectIndex:0}));
  const readable:Readable<ReturnType<typeof store.getState>>={subscribe(run){run(store.getState());return store.subscribe(run);}};
  return { ...readable, setAccent:(accent:string)=>store.setState({accent}),setProjectIndex:(projectIndex:number)=>store.setState({projectIndex}) };
}
