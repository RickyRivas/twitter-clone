<script lang="ts">
	let {
		loading = true,
		success = false,
		error = false,
		dim = 100
	}: { loading?: boolean; success?: boolean; error?: boolean; dim?: number } = $props();
</script>

<div
	style:width={dim + 'px'}
	style:height={dim + 'px'}
	class="status {success ? 'success' : ''} {loading ? 'loading' : ''} {error ? 'error' : ''}"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="100"
		height="101"
		fill="none"
		viewBox="0 0 100 101"
	>
		<g class="success">
			<path
				stroke="#33C27F"
				stroke-width="5"
				d="m20.019 50.54 18.752 21.429L80.018 29.11"
				class="success"
			/>
		</g>
		<g class="error">
			<path stroke="#D62828" stroke-width="5" d="m28.658 71.713 42.945-42.945" />
			<path stroke="#D62828" stroke-width="5" d="M28.435 28.767 71.38 71.712" />
		</g>
		<path
			stroke="currentcolor"
			stroke-width="5"
			d="M50.019 97.839c26.118 0 47.291-21.173 47.291-47.292 0-26.118-21.173-47.291-47.291-47.291S2.728 24.429 2.728 50.547c0 26.119 21.173 47.292 47.291 47.292Z"
			class="circle loading-animation"
		/>
		<path
			stroke="currentcolor"
			stroke-width="5"
			d="M50.019 97.839c26.118 0 47.291-21.173 47.291-47.292 0-26.118-21.173-47.291-47.291-47.291S2.728 24.429 2.728 50.547c0 26.119 21.173 47.292 47.291 47.292Z"
			class="circle indicator"
		/>
	</svg>
</div>

<style lang="less">
	.status {
		line-height: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 auto;
		svg {
			width: 77%;
		}
		path {
			transition: stroke-dashoffset 0.33s ease;
		}

		.shape {
			transform-box: fill-box;
			transform-origin: 50% 50%;
			transition:
				transform 0.33s ease,
				opacity 0.33s ease;
			transform: scale(0.5);
			opacity: 0;
		}

		g.success {
			path {
				stroke-dashoffset: 88;
				stroke-dasharray: 88;
				transition-delay: 0.33s;
			}
		}

		g.error {
			path {
				stroke-dashoffset: 61;
				stroke-dasharray: 61;
				transition-delay: 0.33s;
			}
		}

		path.circle {
			stroke-dashoffset: 298;
			stroke-dasharray: 298;
		}

		&.loading {
			.shape {
				transform: scale(1);
				opacity: 1;
			}

			path.circle.loading-animation {
				animation: dash 3s linear infinite;
			}
		}

		// success/error states
		&.success {
			svg path.circle.indicator {
				stroke-dashoffset: 596;
				color: #33c27f;
			}

			g.success {
				path {
					stroke-dashoffset: 0;
				}
			}
		}

		&.error {
			svg path.circle.indicator {
				stroke-dashoffset: 596;
				color: #d62828;
			}

			g.error {
				path {
					stroke-dashoffset: 0;
				}
			}
		}

		@keyframes dash {
			to {
				stroke-dashoffset: 1490;
			}
		}
	}
</style>
