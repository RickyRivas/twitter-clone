<script lang="ts">
	import type { PageProps } from './$types';
	import PostComposer from '$lib/components/post/PostComposer.svelte';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();
	const replyToId = $derived(data.replyToId);
</script>

<svelte:head>
	<title>New Post</title>
</svelte:head>

<div class="compose-page">
	<PostComposer {replyToId} onclose={() => goto('/')} />
</div>
