import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load = async ({ parent, params }: Parameters<PageServerLoad>[0]) => {
	const { content } = await parent();
	const project = content.projects.find((p) => p.slug === params.slug);
	if (!project) error(404, 'Project not found');
	return { project };
};
