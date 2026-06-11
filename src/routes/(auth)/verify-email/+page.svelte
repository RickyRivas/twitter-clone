<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { email, username, existing } = data;

	let resentVerificationEmailSuccess = $state(false);
	let form: HTMLFormElement;
</script>

<div class="verify-email-content">
	{#if existing}
		<h2>Account Already Exists</h2>
		<p>The email <strong>{email}</strong> is already registered with us.</p>
		<p>
			If this is your account, please check your inbox for a verification email we just sent. You'll
			need to verify your email before signing in.
		</p>
		<p>If you don't see the email in a few minutes, check your spam folder.</p>
		<p>Already verified? <a href="/login">Sign in here</a></p>
	{:else}
		<h2>Check your email!</h2>
		<p>Thanks {username || ''}! We've sent a verification link to <strong>{email}</strong>.</p>
		<p>
			Please check your inbox and click the link to verify your account. If you don't see the email
			in a few minutes, check your spam folder.
		</p>
	{/if}
</div>

<button class="btn" onclick={() => form.requestSubmit()} disabled={resentVerificationEmailSuccess}>
	Resend Email
</button>

{#if resentVerificationEmailSuccess}
	<p>Verification email has been resent!</p>
{/if}

{#if email}
	<form
		method="post"
		action="?/resendVerificationEmail"
		class="hidden-form"
		bind:this={form}
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					resentVerificationEmailSuccess = true;
				}
			};
		}}
	>
		<input type="hidden" name="email" value={email} />
	</form>
{/if}
