import React from 'react';
import { Component } from '../../../common/abiTypes';
import { ArrayInput } from './ArrayInput';
import { StructInput } from './StructInput';
import { TextInput } from './TextInput';

const fromJson = (input: string) => {
    try {
        return JSON.parse(input);
    } catch (_) {
        return false;
    }
}

export interface InputComponentProps {
    component: Component;
    value: any;
    onChange: (value: any) => void;
}

export const InputComponent: React.FC<InputComponentProps> = (props) => {
    const { component } = props;

    const commonProps = {
        validate: (value: string) => fromJson(value),
        transform: (value: string) => fromJson(value) || value
    }

    switch (component.type) {
        case "field":
            return <TextInput {...props} 
                    validate={value => /^-?\d+$/.test(value)} />;
        case "bool":
            return <TextInput {...props} 
                    validate={value => /^(true|false)$/.test(value)} 
                    transform={value => /^(true|false)$/.test(value) ? value === 'true' : value} />;
        case "struct": {
            let components: Component[] = component.components as Component[];
            let Input = components.length > 0 ? StructInput : TextInput;
            return <Input {...props} {...commonProps} />
        }
        case "array":
            let Input = (component.components as Component).size > 0 ? ArrayInput : TextInput;
            return <Input {...props} {...commonProps} />;
        default:
            throw new Error("Unsupported component type");
    }
}