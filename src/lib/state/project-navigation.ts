import type { Readable } from 'svelte/store';
import { createStore } from 'zustand/vanilla';
export function createProjectNavigation() {
	const store = createStore<{ projectIndex: number }>()(() => ({
		projectIndex: 0
	}));
	const readable: Readable<ReturnType<typeof store.getState>> = {
		subscribe(run) {
			run(store.getState());
			return store.subscribe(run);
		}
	};
	return {
		...readable,
		setProjectIndex: (projectIndex: number) => store.setState({ projectIndex })
	};
}
