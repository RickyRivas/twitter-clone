import { goto } from '$app/navigation';
import type { SubmitFunction } from "@sveltejs/kit";
import type { FormConfig } from './form-types';

/**
 * SvelteKit enhance handler for config-driven forms.
 * Mutates the FormConfig state directly — requires $state() to be passed in.
 */
export function formHandler(
    form: FormConfig,
    onSuccess?: (result: any) => void | Promise<void>,
    clearOnSuccess?: boolean
): SubmitFunction {
    return async function () {
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
                        // reset native form values
                        update({ reset: true });
                        // reset config values to match
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

                // map field-level errors from server
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
 * Requires config to be $state() for reactivity.
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