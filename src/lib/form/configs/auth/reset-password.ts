import type { FormConfig } from "$lib/form/utils/form-types";

export const resetPasswordFormConfig: FormConfig = {
    formAttributes: {
        action: '?/resetPassword',
        method: 'post'
    },
    formState: {
        hasError: false,
        showSuccess: false,
        isDisabled: false,
        isLoading: false,
        statusMessage: '',
        submitButtonText: 'Reset Password'
    },
    fieldDefinitions: [
        {
            configuration: {
                inputAttributes: {
                    name: 'password',
                    type: 'password',
                    required: true,
                    disabled: false,
                    placeholder: 'New Password',
                    value: '',
                    autocomplete: 'new-password'
                },
                labelConfig: {
                    text: 'New Password'
                }
            },
            fieldState: {
                hasError: false,
                showSuccess: false,
                statusMessage: ''
            }
        },
        {
            configuration: {
                inputAttributes: {
                    name: 'passwordConfirmed',
                    type: 'password',
                    required: true,
                    disabled: false,
                    placeholder: 'Confirm Password',
                    value: '',
                    autocomplete: 'new-password'
                },
                labelConfig: {
                    text: 'Confirm Password'
                }
            },
            fieldState: {
                hasError: false,
                showSuccess: false,
                statusMessage: ''
            }
        }
    ]
};