import { goto } from '$app/navigation';
import type { SubmitFunction } from "@sveltejs/kit";
import type { FormConfig } from "./form-types";

/**
 * SvelteKit enhance handler for config-driven forms.
 * Mutates the FormConfig state directly — requires $state() to be passed in.
 * 
 */
export function formHandler(
    form: FormConfig,
    onSuccess?: (result: any) => void | Promise<void>,
    clearOnSuccess?: boolean,
): SubmitFunction {
    return async function ({ cancel }) {


        // reset form state
        form.formState.hasError = false;
        form.formState.showSuccess = false;
        form.formState.isDisabled = false;
        form.formState.statusMessage = '';

        // reset field states + disable while loading
        form.fieldDefinitions.forEach((field) => {
            field.fieldState.hasError = false;
            field.fieldState.showSuccess = false;
            field.fieldState.statusMessage = '';
            field.configuration.inputAttributes.disabled = true;
        });

        form.formState.isLoading = true;

        return async ({ result, update }) => {
            if (result.type === 'success' && result.status === 200) {
                form.formState.showSuccess = true;
                form.formState.hasError = false;

                if (onSuccess) await onSuccess(result);

                setTimeout(async () => {
                    if (result?.data?.redirectTo) {
                        await goto(result.data.redirectTo);
                    }

                    if (clearOnSuccess) {
                        update({ reset: true });
                        form.fieldDefinitions.forEach((field) => {
                            field.configuration.inputAttributes.value = '';
                        });
                    }

                    form.formState.isLoading = false;
                    form.fieldDefinitions.forEach((field) => {
                        field.configuration.inputAttributes.disabled = false;
                    });
                }, 1000);

            } else {
                form.formState.showSuccess = false;
                form.formState.hasError = true;

                if (result.data?.errors) {
                    result.data.errors.forEach((error: { field: string; message: string }) => {
                        const field = form.fieldDefinitions.find(
                            (f) => f.configuration.inputAttributes.name === error.field
                        );
                        if (field) {
                            field.fieldState.hasError = true;
                            field.fieldState.statusMessage = error.message;
                        }
                    });
                }

                if (result.data?.message) form.formState.statusMessage = result.data.message;

                setTimeout(() => {
                    form.formState.isLoading = false;
                    form.fieldDefinitions.forEach((field) => {
                        field.configuration.inputAttributes.disabled = false;
                    });
                }, 1000);
            }
        };
    };
}

/**
 * Updates a single field value in the config by index.
 */
export function updateValue(formConfig: FormConfig, index: number, newValue: string) {
    const field = formConfig.fieldDefinitions[index];
    if (field) field.configuration.inputAttributes.value = newValue;
}

/**
 * Returns a triggerUpdate function bound to the given config.
 * Pass the result to <Form triggerUpdate={...} />.
 * Requires config to be $state() for reactively.
 */
export function handleTriggerUpdate(config: FormConfig) {
    return (index: number, newValue: any) => updateValue(config, index, newValue);
}

/**
 * Pre-populates a form config with existing data (e.g. for edit forms).
 * Matches fields by name against the data object keys.
 */
export function updateConfigWithValues(config: FormConfig, data: Record<string, any>): void {
    config.fieldDefinitions.forEach((fieldDef) => {
        const name = fieldDef.configuration.inputAttributes.name;
        const value = data[name];
        if (value !== undefined) {
            fieldDef.configuration.inputAttributes.value = value === null ? '' : value;
        }
    });
}

/**
 * Uploads a file to Cloudinary using a signed upload.
 * Returns the public_id or null on failure.
 */
export async function uploadToCloudinary(file: File, folder: string): Promise<string | null> {
    const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder })
    });

    if (!signRes.ok) throw new Error('Failed to get upload signature');

    const { signature, timestamp, api_key, cloud_name } = await signRes.json();

    const fd = new FormData();
    fd.append('file', file);
    fd.append('signature', signature);
    fd.append('timestamp', timestamp);
    fd.append('api_key', api_key);
    fd.append('folder', folder);

    const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: 'POST', body: fd }
    );

    if (!uploadRes.ok) throw new Error('Cloudinary upload failed');

    const result = await uploadRes.json();
    return result.public_id ?? null;
}