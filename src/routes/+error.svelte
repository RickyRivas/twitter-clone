<script lang="ts">
	import { page } from '$app/state';
</script>

<section>
	<div class="container">
		<h1>{page.status}: {page?.error?.message}</h1>
		<a href="/" class="btn">Go Home</a>
	</div>
</section>
