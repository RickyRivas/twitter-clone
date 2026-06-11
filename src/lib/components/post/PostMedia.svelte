<script lang="ts">
	import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';

	const {
		media,
		authorUsername,
		postId
	}: {
		media: any[];
		authorUsername: string;
		postId: string;
	} = $props();

	// separate by type
	const images = $derived(
		media.filter((m) => m.resource_type === 'image').sort((a, b) => a.position - b.position)
	);
	const videos = $derived(
		media.filter((m) => m.resource_type === 'video').sort((a, b) => a.position - b.position)
	);
	const audios = $derived(
		media.filter((m) => m.resource_type === 'raw').sort((a, b) => a.position - b.position)
	);

	const imageCount = $derived(images.length);

	function cloudinaryUrl(publicId: string, transforms: string) {
		return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
	}

	function videoUrl(publicId: string) {
		return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/f_auto,q_auto/${publicId}`;
	}

	function audioUrl(publicId: string) {
		return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}`;
	}

	function videoPosterUrl(publicId: string) {
		return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0,f_jpg,q_auto,w_600/${publicId}`;
	}
</script>

<div class="post-media">
	<!-- images -->
	{#if images.length > 0}
		<div class="post-media-images" data-count={imageCount}>
			{#each images as image (image.id)}
				<a
					href="/{authorUsername}/{postId}/photo/{image.id}"
					class="post-media-image-link"
					onclick={(e) => e.stopPropagation()}
				>
					<img
						src={cloudinaryUrl(image.cloudinary_public_id, 'f_auto,q_auto,w_600')}
						alt={image.alt_text ?? ''}
						class="post-media-image"
						loading="lazy"
						decoding="async"
					/>
				</a>
			{/each}
		</div>
	{/if}

	<!-- video — one at a time, plays in place -->
	{#if videos.length > 0}
		{#each videos as video (video.id)}
			<div class="post-media-video" onclick={(e) => e.stopPropagation()}>
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src={videoUrl(video.cloudinary_public_id)}
					poster={videoPosterUrl(video.cloudinary_public_id)}
					controls
					preload="none"
					class="post-media-video-player"
					playsinline
				>
				</video>
			</div>
		{/each}
	{/if}

	<!-- audio -->
	{#if audios.length > 0}
		{#each audios as audio (audio.id)}
			<div class="post-media-audio" onclick={(e) => e.stopPropagation()}>
				<div class="post-media-audio-Squareicon">
					<SquareIcon name="audio" />
				</div>
				<!-- svelte-ignore a11y_media_has_caption -->
				<audio
					src={audioUrl(audio.cloudinary_public_id)}
					controls
					preload="none"
					class="post-media-audio-player"
				>
				</audio>
			</div>
		{/each}
	{/if}
</div>

<style lang="less">
	.post-media-images {
		display: grid;
		gap: 2px;
		border-radius: var(--border-radius);
		overflow: hidden;

		&[data-count='1'] {
			grid-template-columns: 1fr;
			.post-media-image {
				max-height: 516px;
			}
		}
		&[data-count='2'] {
			grid-template-columns: 1fr 1fr;
			.post-media-image {
				height: 280px;
			}
		}
		&[data-count='3'] {
			grid-template-columns: 1fr 1fr;
			.post-media-image-link:first-child {
				grid-row: span 2;
				.post-media-image {
					height: 100%;
				}
			}
			.post-media-image {
				height: 140px;
			}
		}
		&[data-count='4'] {
			grid-template-columns: 1fr 1fr;
			.post-media-image {
				height: 140px;
			}
		}
	}

	.post-media-image-link {
		display: block;
		overflow: hidden;
	}

	.post-media-image {
		width: 100%;
		object-fit: cover;
		display: block;
		transition: opacity 0.2s ease;
		&:hover {
			opacity: 0.9;
		}
	}

	.post-media-video-player {
		width: 100%;
		border-radius: var(--border-radius);
		display: block;
	}

	.post-media-audio {
		display: flex;
		align-items: center;
		gap: 0.75em;
		padding: 0.75em;
		border-radius: var(--border-radius);
		border: 1px solid var(--border);
	}

	.post-media-audio-player {
		flex: 1;
	}
</style>
