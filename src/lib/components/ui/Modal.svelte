<script>
	import { tick } from 'svelte';

	let {
		id,
		open = $bindable(false),
		describedby = undefined,
		initialFocusId = undefined,
		onclose = undefined,
		children
	} = $props();

	const labelledby = `${id}_label`;

	let dialogNode = $state(null);
	let backdropNode = $state(null);
	let lastFocus = $state(null);

	$effect(() => {
		if (open) {
			show();
		} else {
			hide();
		}
	});

	async function show(focusFirstId = initialFocusId) {
		document.body.classList.add('has-dialog');
		await tick();

		if (focusFirstId) {
			const el = document.getElementById(focusFirstId);
			el ? el.focus() : focusFirstDescendant(dialogNode);
		} else {
			focusFirstDescendant(dialogNode);
		}

		lastFocus = document.activeElement;
		document.addEventListener('focus', trapFocus, true);
		document.addEventListener('keyup', handleEscape);
	}

	function hide() {
		document.body.classList.remove('has-dialog');
		document.removeEventListener('focus', trapFocus, true);
		document.removeEventListener('keyup', handleEscape);
	}

	// Public method — also sets the bound variable
	export function openModal(focusFirstId) {
		open = true;
		show(focusFirstId);
	}

	export function closeModal() {
		open = false;
		hide();
		onclose?.();
	}

	function handleEscape(event) {
		if ((event.which || event.keyCode) === 27) {
			event.stopPropagation();
			closeModal();
		}
	}

	function trapFocus(event) {
		if (!dialogNode) return;
		if (dialogNode.contains(event.target)) {
			lastFocus = event.target;
		} else {
			if (!focusFirstDescendant(dialogNode)) return;
			if (lastFocus === document.activeElement) {
				focusLastDescendant(dialogNode);
			}
			lastFocus = document.activeElement;
		}
	}

	function isFocusable(element) {
		if (element.tabIndex < 0) return false;
		if (element.disabled) return false;
		switch (element.nodeName) {
			case 'A':
				return !!element.href && element.rel !== 'ignore';
			case 'INPUT':
				return element.type !== 'hidden';
			case 'BUTTON':
			case 'SELECT':
			case 'TEXTAREA':
				return true;
			default:
				return false;
		}
	}

	function attemptFocus(element) {
		if (!isFocusable(element)) return false;
		try {
			element.focus();
		} catch (_) {}
		return document.activeElement === element;
	}

	function focusFirstDescendant(element) {
		for (const child of element.childNodes) {
			if (attemptFocus(child) || focusFirstDescendant(child)) return true;
		}
		return false;
	}

	function focusLastDescendant(element) {
		for (let i = element.childNodes.length - 1; i >= 0; i--) {
			const child = element.childNodes[i];
			if (attemptFocus(child) || focusLastDescendant(child)) return true;
		}
		return false;
	}
</script>

<div class="dialog-backdrop" class:active={open} class:hidden={!open} bind:this={backdropNode}>
	{#if open}
		<div tabindex="0"></div>
	{/if}
	<div
		bind:this={dialogNode}
		{id}
		role="dialog"
		aria-labelledby={labelledby}
		aria-describedby={describedby}
		aria-modal="true"
	>
		{@render children?.({ close: closeModal, labelledby })}
	</div>

	{#if open}
		<div tabindex="0"></div>
	{/if}
</div>
