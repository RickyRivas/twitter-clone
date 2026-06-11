<script lang="ts">
	import { authPrompt } from '$lib/state/authPrompt.svelte';
	import Modal from '../ui/Modal.svelte';
	import SquareIcon from '../ui/SquareIcon.svelte';
</script>

<Modal id="auth-prompt" open={authPrompt.open} onclose={authPrompt.hide}>
	<button class="auth-prompt-close btn-ghost" onclick={authPrompt.hide} aria-label="Close">
		<SquareIcon name="close" />
	</button>

	<h2>Sign in to continue</h2>
	<p>Join the conversation. Sign in or create an account.</p>

	<div class="auth-prompt-actions">
		<a href="/login" class="btn" onclick={authPrompt.hide}>Sign in</a>
		<a href="/register" class="btn btn-ghost" onclick={authPrompt.hide}>Create account</a>
	</div>
</Modal>
