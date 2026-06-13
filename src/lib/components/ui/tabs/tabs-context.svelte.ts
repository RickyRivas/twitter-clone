import { getContext, setContext } from 'svelte';

const KEY = Symbol('tabs');

export interface TabsContext {
    id: string | undefined;
    active: () => string;
    setActive: (value: string) => void;
}

export function setTabsContext(ctx: TabsContext) {
    setContext<TabsContext>(KEY, ctx);
}

export function getTabsContext(): TabsContext {
    return getContext<TabsContext>(KEY);
}