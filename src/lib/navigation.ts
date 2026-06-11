export type RouteGroup = 'auth' | 'public' | 'protected' | 'admin';

export interface RouteInfo {
    path: string;
    name: string;
    icon?: string;
    showInNav?: boolean;
    children?: RouteInfo[];
}

export const routes: Record<RouteGroup, RouteInfo[]> = {
    auth: [
        { path: '/login', name: 'Sign In', showInNav: false },
        { path: '/register', name: 'Create Account', showInNav: false },
        { path: '/forgot-password', name: 'Forgot Password', showInNav: false },
        { path: '/reset-password', name: 'Reset Password', showInNav: false },
        { path: '/verify-email', name: 'Verify Email', showInNav: false },
    ],

    public: [
        { path: '/', name: 'Home', icon: 'home', showInNav: true },
        { path: '/explore', name: 'Explore', icon: 'compass', showInNav: true },
    ],

    protected: [
        { path: '/notifications', name: 'Notifications', icon: 'bell', showInNav: true },
        { path: '/settings', name: 'Settings', icon: 'settings', showInNav: false },
        { path: '/settings/profile', name: 'Profile', icon: 'user', showInNav: false },
        { path: '/settings/account', name: 'Account', icon: 'settings', showInNav: false },
    ],

    admin: [
        { path: '/admin', name: 'Admin', icon: 'shield', showInNav: false },
    ],
};

// --- Helpers ---

function flattenRoutes(routeList: RouteInfo[]): RouteInfo[] {
    return routeList.reduce((acc, route) => {
        acc.push(route);
        if (route.children?.length) {
            acc.push(...flattenRoutes(route.children));
        }
        return acc;
    }, [] as RouteInfo[]);
}

/**
 * Find route info for a given path, searching all groups including children.
 * Dynamic segments (/:username etc.) are not in this config — returns undefined for those.
 */
export function findRouteInfo(
    path: string
): { group: RouteGroup; route: RouteInfo; parent?: RouteInfo } | undefined {
    for (const [group, routeList] of Object.entries(routes) as [RouteGroup, RouteInfo[]][]) {
        // exact match at top level
        const exact = routeList.find(r => r.path === path);
        if (exact) return { group, route: exact };

        // match inside children
        for (const parent of routeList) {
            if (parent.children) {
                const child = parent.children.find(c => c.path === path);
                if (child) return { group, route: child, parent };
            }
        }

        // prefix match — path is a sub-route of a known route
        const prefix = routeList.find(r => path.startsWith(`${r.path}/`));
        if (prefix) return { group, route: prefix };
    }

    return undefined;
}

/**
 * Returns the RouteGroup a given path belongs to, or undefined for
 * dynamic routes like /:username that aren't in the config.
 */
export function getRouteGroup(path: string): RouteGroup | undefined {
    return findRouteInfo(path)?.group;
}

/**
 * Returns nav-visible routes for a given group.
 * Pass multiple groups to merge (e.g. public + protected for the main nav).
 */
export function getNavRoutes(...groups: RouteGroup[]): RouteInfo[] {
    return groups.flatMap(g =>
        flattenRoutes(routes[g]).filter(r => r.showInNav)
    );
}