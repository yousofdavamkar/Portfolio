import type { Readable } from 'svelte/store';
import { createStore } from 'zustand/vanilla';
export type Accent = 'yellow' | 'red' | 'purple' | 'teal';
export function isAccent(value: string | null): value is Accent {
	return value === 'yellow' || value === 'red' || value === 'purple' || value === 'teal';
}
export function createPreferences() {
	const store = createStore<{ accent: Accent; projectIndex: number }>()(() => ({
		accent: 'yellow',
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
		setAccent: (accent: Accent) => store.setState({ accent }),
		setProjectIndex: (projectIndex: number) => store.setState({ projectIndex })
	};
}
