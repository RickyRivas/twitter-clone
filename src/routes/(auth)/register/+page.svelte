<script lang="ts">
	import Form from '$lib/components/form/Form.svelte';
	import { registerFormConfig } from '$lib/form/configs/auth/register';
	import { handleTriggerUpdate } from '$lib/form/utils/form-helpers';

	let registerConfig = $state(registerFormConfig);
	const registerFormHandler = handleTriggerUpdate(registerConfig);
</script>

<h1>Register a new account</h1>
<Form name="register form" config={registerConfig} triggerUpdate={registerFormHandler} />
<a href="/login" class="btn">login</a>
