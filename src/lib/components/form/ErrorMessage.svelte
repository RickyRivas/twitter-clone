<script lang="ts">
	let { errorMessage } = $props();
</script>

<div class="error-message">{errorMessage}</div>

<style>
	.error-message {
		display: block;
		color: red;
		font-size: 12px;
		line-height: 44px;
		text-transform: uppercase;
	}
</style>
