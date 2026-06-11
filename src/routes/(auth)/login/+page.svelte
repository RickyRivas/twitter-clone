<script lang="ts">
	import Form from '$lib/components/form/Form.svelte';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';
	import { loginFormConfig } from '$lib/form/configs/auth/login';
	import { handleTriggerUpdate } from '$lib/form/utils/form-helpers';

	const providers = [
		{ name: 'Google', value: 'google', icon: 'google' },
		{ name: 'X', value: 'twitter', icon: 'x' }
	];

	let loginConfig = $state(loginFormConfig);
	const loginFormHandler = handleTriggerUpdate(loginConfig);
</script>

<h1>Sign in</h1>
<Form name="login form" config={loginConfig} triggerUpdate={loginFormHandler} />

<a href="/register" class="btn">Register</a>
<a href="/forgot-password" class="btn">Forgot password?</a>

<div class="auth-form-divider">
	<hr />
	<span>Or</span>
	<hr />
</div>

<div class="auth-providers-group">
	{#each providers as provider (provider.value)}
		<form method="POST" action="?/oauthSignin">
			<input type="hidden" name="selected-provider" value={provider.value} />
			<button type="submit" class="btn oauth-button-{provider.value}">
				<SquareIcon name={provider.icon} />
				Continue with {provider.name}
			</button>
		</form>
	{/each}
</div>
