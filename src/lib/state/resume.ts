import { createSWRStore } from 'swr-store';
export const resumeStore = createSWRStore<{ url: string | null }>({
	key: () => '/api/resume',
	get: async () => {
		const response = await fetch('/api/resume');
		if (!response.ok) throw new Error('Resume could not be loaded.');
		const data: unknown = await response.json();
		if (
			typeof data !== 'object' ||
			data === null ||
			!('url' in data) ||
			(data.url !== null && typeof data.url !== 'string')
		) {
			throw new Error('The resume service returned an invalid response.');
		}
		if (data.url !== null && new URL(data.url).protocol !== 'https:') {
			throw new Error('The resume URL must use HTTPS.');
		}
		return { url: data.url };
	},
	freshAge: 60000,
	staleAge: 300000,
	revalidateOnFocus: true,
	maxRetryCount: 1
});
