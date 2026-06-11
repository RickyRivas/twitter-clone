import type { FormConfig } from "$lib/form/utils/form-types";

export const loginFormConfig: FormConfig = {
    formAttributes: {
        action: '?/login',
        method: 'post'
    },
    formState: {
        hasError: false,
        showSuccess: false,
        isDisabled: false,
        isLoading: false,
        statusMessage: '',
        submitButtonText: 'Sign In'
    },
    fieldDefinitions: [
        {
            configuration: {
                inputAttributes: {
                    name: 'email',
                    type: 'email',
                    required: true,
                    disabled: false,
                    placeholder: 'Email Address',
                    value: '',
                    autocomplete: 'email'
                },
                labelConfig: {
                    text: 'Email Address'
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
                    name: 'password',
                    type: 'password',
                    required: true,
                    disabled: false,
                    placeholder: 'Password',
                    value: '',
                    autocomplete: 'current-password'
                },
                labelConfig: {
                    text: 'Password'
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
                    name: 'remember-me',
                    type: 'checkbox',
                    required: false,
                    disabled: false,
                    placeholder: '',
                    value: '',
                },
                labelConfig: {
                    text: 'Remember me'
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