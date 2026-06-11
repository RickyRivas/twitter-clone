<script lang="ts">
	import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

	const {
		publicId,
		alt,
		size = 40
	}: {
		publicId: string | null;
		alt: string;
		size?: number;
	} = $props();

	const fallback = '/images/avatar-placeholder.png';

	const src = $derived(
		publicId
			? `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_${size},h_${size},c_fill,f_auto,q_auto/${publicId}`
			: fallback
	);
</script>

<img {src} {alt} width={size} height={size} class="avatar" />
