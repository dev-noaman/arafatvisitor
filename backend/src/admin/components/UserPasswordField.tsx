import React, { useState } from 'react';
import { Box, Label, Input, Button, Icon, Text, Tooltip } from '@adminjs/design-system';
import { BasePropertyProps } from 'adminjs';

const UserPasswordField: React.FC<BasePropertyProps> = (props) => {
    const { property, record, onChange } = props;

    if (!record || !onChange) return null;

    const value = record.params[property.name] || '';
    const [showPassword, setShowPassword] = useState(false);

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let retVal = "";
        for (let i = 0, n = charset.length; i < 14; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        onChange(property.name, retVal);
    };

    const copyToClipboard = () => {
        if (value) {
            navigator.clipboard.writeText(value);
            // Small feedback using alert as fallback if no toast is available globally
            alert('Password copied to clipboard!');
        }
    };

    const getStrength = (pwd: string) => {
        if (!pwd) return { score: 0, label: '', color: 'grey40' };
        let score = 0;
        if (pwd.length > 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return { score, label: 'Weak', color: '#ff4d4f' };
        if (score === 2) return { score, label: 'Fair', color: '#faad14' };
        if (score === 3) return { score, label: 'Good', color: '#1890ff' };
        return { score, label: 'Strong', color: '#52c41a' };
    };

    const strength = getStrength(value);

    // Skip rendering if property is not for edit/new (though it should only be called for those)
    if (props.where === 'show' || props.where === 'list') {
        return <Text>********</Text>;
    }

    return (
        <Box mb="xl">
            <Label required={property.isRequired}>{property.label}</Label>
            <Box display="flex" style={{ gap: '8px' }}>
                <Input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(property.name, e.target.value)}
                    style={{ flex: 1 }}
                    autoComplete="new-password"
                    id={property.name}
                />
                <Button
                    variant="light"
                    type="button"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                    <Icon icon={showPassword ? 'EyeOff' : 'Eye'} />
                </Button>
                <Button
                    variant="primary"
                    type="button"
                    onClick={generatePassword}
                >
                    Generate
                </Button>
                <Button
                    variant="light"
                    type="button"
                    onClick={copyToClipboard}
                    disabled={!value}
                    title="Copy to Clipboard"
                >
                    <Icon icon="Copy" />
                </Button>
            </Box>

            {value && (
                <Box mt="xs" display="flex" alignItems="center" style={{ gap: '12px' }}>
                    <Box
                        height="4px"
                        flex={1}
                        maxWidth="150px"
                        bg="#e8e8e8"
                        borderRadius="2px"
                        overflow="hidden"
                    >
                        <Box
                            height="100%"
                            width={`${(strength.score / 4) * 100}%`}
                            bg={strength.color}
                            style={{ transition: 'all 0.3s ease' }}
                        />
                    </Box>
                    <Text size="sm" style={{ color: strength.color, fontWeight: 600 }}>
                        {strength.label}
                    </Text>
                </Box>
            )}
            {(property as any).help && <Text size="sm" mt="xs" color="grey60">{(property as any).help}</Text>}
        </Box>
    );
};

export default UserPasswordField;
