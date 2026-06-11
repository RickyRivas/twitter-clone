<script lang="ts">
	import { theme } from '$lib/theme.svelte';

	function toggle() {
		theme.current = theme.current === 'light' ? 'dark' : 'light';
	}

	$effect(() => {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(theme.current);
	});
</script>

<button onclick={toggle} id="theme-toggle" aria-label="Click to change theme">
	<svg
		class="theme"
		aria-hidden="true"
		role="img"
		xmlns="http://www.w3.org/2000/svg"
		width="25"
		height="25"
		fill="none"
		viewBox="0 0 25 25"
	>
		<path
			class="moon"
			fill="currentcolor"
			d="M14.472 0C7.58 0 2 5.597 2 12.5S7.58 25 14.472 25c3.382 0 6.445-1.35 8.694-3.538a.892.892 0 0 0-.775-1.518 9.79 9.79 0 0 1-1.68.145c-5.407 0-9.794-4.397-9.794-9.821a9.819 9.819 0 0 1 4.984-8.555.892.892 0 0 0-.369-1.663 13.36 13.36 0 0 0-1.06-.044V0Z"
		/>
		<path
			class="sun"
			fill="currentcolor"
			d="M17.65.06a.79.79 0 0 1 .47.581l.97 5.268 5.269.967a.79.79 0 0 1 .58.468.776.776 0 0 1-.078.743L21.82 12.5l3.041 4.409c.152.22.181.498.079.742a.79.79 0 0 1-.581.468l-5.268.972-.972 5.268a.79.79 0 0 1-.468.58.776.776 0 0 1-.742-.078L12.5 21.82l-4.409 3.04a.776.776 0 0 1-.742.079.79.79 0 0 1-.468-.581l-.972-5.268-5.268-.972a.79.79 0 0 1-.58-.468.776.776 0 0 1 .078-.742L3.18 12.5.14 8.091a.776.776 0 0 1-.08-.741.79.79 0 0 1 .581-.468l5.268-.972.972-5.268a.79.79 0 0 1 .468-.58.776.776 0 0 1 .742.078L12.5 3.18 16.909.14a.776.776 0 0 1 .741-.08ZM7.814 12.5a4.687 4.687 0 1 1 9.374 0 4.687 4.687 0 0 1-9.374 0Zm10.936 0a6.25 6.25 0 1 0-12.498 0 6.25 6.25 0 0 0 12.498 0Z"
		/>
	</svg>
</button>

<style lang="less">
	#theme-toggle {
		display: inline-block;
		vertical-align: middle;
		position: relative;
		width: 2.2em;
		height: 2.2em;
		border: 0;
		padding: 0;
		margin: 0;
		font: inherit;
		line-height: 0;
		color: var(--text);
		background: none;
		transition:
			color 0.33s ease,
			background-color 0.33s ease;
		border-radius: 0.25em;
		cursor: pointer;
		background-color: var(--bg-alternate);

		svg {
			width: 1.25em;
			height: 1.25em;

			path {
				transition:
					opacity 0.33s ease,
					transform 0.33s ease;
				transform-origin: center;
			}
		}
	}

	:root #theme-toggle {
		.moon {
			opacity: 1;
			transform: rotate(0deg);
		}

		.sun {
			opacity: 0;
			transform: rotate(180deg);
		}
	}

	:root.dark #theme-toggle {
		.moon {
			opacity: 0;
			transform: rotate(-180deg);
		}

		.sun {
			opacity: 1;
			transform: rotate(0deg);
		}
	}
</style>
