let open = $state(false);

export const authPrompt = {
    get open() { return open },
    show: () => open = true,
    hide: () => open = false,
};