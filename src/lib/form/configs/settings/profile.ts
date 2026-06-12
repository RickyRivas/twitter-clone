import type { FormConfig } from "$lib/form/utils/form-types";

export const settingsProfileFormConfig = (profile: any): FormConfig => ({
    formAttributes: {
        action: '?/updateProfile',
        method: 'post'
    },
    formState: {
        hasError: false,
        showSuccess: false,
        isDisabled: false,
        isLoading: false,
        statusMessage: '',
        submitButtonText: 'Save'
    },
    fieldDefinitions: [
        {
            configuration: {
                inputAttributes: {
                    name: 'avatar_public_id',
                    type: 'avatar-widget',
                    required: false,
                    disabled: false,
                    placeholder: '',
                    value: profile?.avatar_public_id ?? '',
                    previewShape: 'circle',
                },
                labelConfig: { text: 'Avatar' }
            },
            fieldState: { hasError: false, showSuccess: false, statusMessage: '' }
        },
        {
            configuration: {
                inputAttributes: {
                    name: 'banner_public_id',
                    type: 'avatar-widget',
                    required: false,
                    disabled: false,
                    placeholder: '',
                    value: profile?.banner_public_id ?? '',
                    previewShape: 'banner',
                },
                labelConfig: { text: 'Banner' }
            },
            fieldState: { hasError: false, showSuccess: false, statusMessage: '' }
        },
        {
            configuration: {
                inputAttributes: {
                    name: 'display_name',
                    type: 'text',
                    required: false,
                    disabled: false,
                    placeholder: 'Display name',
                    value: profile?.display_name ?? '',
                },
                labelConfig: { text: 'Display Name' }
            },
            fieldState: { hasError: false, showSuccess: false, statusMessage: '' }
        },
        {
            configuration: {
                inputAttributes: {
                    name: 'username',
                    type: 'username-check',
                    required: true,
                    disabled: false,
                    placeholder: 'Username',
                    value: profile?.username ?? '',
                    currentUsername: profile?.username ?? '',
                    profileId: profile?.id ?? '',
                },
                labelConfig: { text: 'Username' }
            },
            fieldState: { hasError: false, showSuccess: false, statusMessage: '' }
        },
        {
            configuration: {
                inputAttributes: {
                    name: 'bio',
                    type: 'textarea',
                    required: false,
                    disabled: false,
                    placeholder: 'Bio',
                    value: profile?.bio ?? '',
                },
                labelConfig: { text: 'Bio' }
            },
            fieldState: { hasError: false, showSuccess: false, statusMessage: '' }
        },
        {
            configuration: {
                inputAttributes: {
                    name: 'location',
                    type: 'text',
                    required: false,
                    disabled: false,
                    placeholder: 'Location',
                    value: profile?.location ?? '',
                },
                labelConfig: { text: 'Location' }
            },
            fieldState: { hasError: false, showSuccess: false, statusMessage: '' }
        },
        {
            configuration: {
                inputAttributes: {
                    name: 'website',
                    type: 'url',
                    required: false,
                    disabled: false,
                    placeholder: 'https://yourwebsite.com',
                    value: profile?.website ?? '',
                },
                labelConfig: { text: 'Website' }
            },
            fieldState: { hasError: false, showSuccess: false, statusMessage: '' }
        },
    ]
});