import type { FunctionReturnType } from 'convex/server';
import type { api } from '../../../convex/_generated/api';
export type Content=FunctionReturnType<typeof api.portfolio.content>;
export type Project=Content['projects'][number];
export type PortfolioContext={readonly content:Content};
export const PORTFOLIO=Symbol('portfolio');
