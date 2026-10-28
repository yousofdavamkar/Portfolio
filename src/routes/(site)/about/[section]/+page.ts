import { error } from '@sveltejs/kit';
import { aboutSections } from '#lib/about.js';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const section = aboutSections.find((item) => item.slug === params.section);
	if (!section) error(404, 'This About page could not be found.');
	const next = aboutSections[aboutSections.indexOf(section) + 1];
	return { section, next: next ?? null };
};
