export type OptionItem = {
    label: string;
    value: string;
    name: string;
    disabled?: boolean;
};

export type FormAttributes = {
    action: string;
    method: "post" | "POST";
};

export type FormState = {
    hasError: boolean;
    showSuccess: boolean;
    isDisabled: boolean;
    isLoading: boolean;
    statusMessage: string;
    submitButtonText: string;
};

export type InputAttributes = {
    name: string;
    type: string;
    required?: boolean;
    disabled: boolean;
    placeholder?: string;
    value: string | number | boolean;
    step?: string | undefined;
    codeMirrorLang?: "html" | "css" | "javascript"
    options?: OptionItem[]; // Added for radio, checkbox, and select
    autocomplete?:
    | 'off'
    | 'on'
    // Sign-in/credentials
    | 'username'
    | 'current-password'
    | 'new-password'
    // Contact
    | 'email'
    | 'tel'
    // Personal info
    | 'name'
    | 'given-name'
    | 'family-name'
    | 'nickname'
    // Address
    | 'street-address'
    | 'address-line1'
    | 'address-line2'
    | 'address-level1'
    | 'address-level2'
    | 'postal-code'
    | 'country'
    // Payment
    | 'cc-name'
    | 'cc-number'
    | 'cc-exp'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-csc'
    // One-time code
    | 'one-time-code'
    | undefined;
};

export type LabelConfig = {
    text: string;
    displayFormLabel?: string;
};

export type FieldState = {
    hasError: boolean;
    showSuccess: boolean;
    statusMessage: string;
};

export type FieldDefinition = {
    configuration: {
        inputAttributes: InputAttributes;
        labelConfig: LabelConfig;
    };
    fieldState: FieldState;
    index?: number;
};

export type FormConfig = {
    formAttributes: FormAttributes;
    formState: FormState;
    fieldDefinitions: FieldDefinition[];
};

export type TriggerUpdate = {
    (index: number, newValue: string): void;
};

