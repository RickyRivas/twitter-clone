<script lang="ts">
	import Form from '$lib/components/form/Form.svelte';
	import { forgotPasswordFormConfig } from '$lib/form/configs/auth/forgot-password';
	import { handleTriggerUpdate } from '$lib/form/utils/form-helpers';

	let forgotPasswordConfig = $state(forgotPasswordFormConfig);
	const forgotPasswordFormHandler = handleTriggerUpdate(forgotPasswordConfig);
</script>

<h1>Forgot password</h1>
<Form
	name="forgot password form"
	config={forgotPasswordConfig}
	triggerUpdate={forgotPasswordFormHandler}
/>
<a href="/login" class="btn">Back to sign in</a>
