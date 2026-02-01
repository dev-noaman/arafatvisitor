"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var design_system_1 = require("@adminjs/design-system");
var UserPasswordField = function (props) {
    var property = props.property, record = props.record, onChange = props.onChange;
    if (!record || !onChange)
        return null;
    var value = record.params[property.name] || '';
    var _a = (0, react_1.useState)(false), showPassword = _a[0], setShowPassword = _a[1];
    var generatePassword = function () {
        var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        var retVal = "";
        for (var i = 0, n = charset.length; i < 14; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        onChange(property.name, retVal);
    };
    var copyToClipboard = function () {
        if (value) {
            navigator.clipboard.writeText(value);
            // Small feedback using alert as fallback if no toast is available globally
            alert('Password copied to clipboard!');
        }
    };
    var getStrength = function (pwd) {
        if (!pwd)
            return { score: 0, label: '', color: 'grey40' };
        var score = 0;
        if (pwd.length > 8)
            score++;
        if (/[A-Z]/.test(pwd))
            score++;
        if (/[0-9]/.test(pwd))
            score++;
        if (/[^A-Za-z0-9]/.test(pwd))
            score++;
        if (score <= 1)
            return { score: score, label: 'Weak', color: '#ff4d4f' };
        if (score === 2)
            return { score: score, label: 'Fair', color: '#faad14' };
        if (score === 3)
            return { score: score, label: 'Good', color: '#1890ff' };
        return { score: score, label: 'Strong', color: '#52c41a' };
    };
    var strength = getStrength(value);
    // Skip rendering if property is not for edit/new (though it should only be called for those)
    if (props.where === 'show' || props.where === 'list') {
        return <design_system_1.Text>********</design_system_1.Text>;
    }
    return (<design_system_1.Box mb="xl">
            <design_system_1.Label required={property.isRequired}>{property.label}</design_system_1.Label>
            <design_system_1.Box display="flex" style={{ gap: '8px' }}>
                <design_system_1.Input type={showPassword ? 'text' : 'password'} value={value} onChange={function (e) { return onChange(property.name, e.target.value); }} style={{ flex: 1 }} autoComplete="new-password" id={property.name}/>
                <design_system_1.Button variant="light" type="button" size="icon" onClick={function () { return setShowPassword(!showPassword); }} title={showPassword ? 'Hide Password' : 'Show Password'}>
                    <design_system_1.Icon icon={showPassword ? 'EyeOff' : 'Eye'}/>
                </design_system_1.Button>
                <design_system_1.Button variant="primary" type="button" onClick={generatePassword}>
                    Generate
                </design_system_1.Button>
                <design_system_1.Button variant="light" type="button" onClick={copyToClipboard} disabled={!value} title="Copy to Clipboard">
                    <design_system_1.Icon icon="Copy"/>
                </design_system_1.Button>
            </design_system_1.Box>

            {value && (<design_system_1.Box mt="xs" display="flex" alignItems="center" style={{ gap: '12px' }}>
                    <design_system_1.Box height="4px" flex={1} maxWidth="150px" bg="#e8e8e8" borderRadius="2px" overflow="hidden">
                        <design_system_1.Box height="100%" width={"".concat((strength.score / 4) * 100, "%")} bg={strength.color} style={{ transition: 'all 0.3s ease' }}/>
                    </design_system_1.Box>
                    <design_system_1.Text size="sm" style={{ color: strength.color, fontWeight: 600 }}>
                        {strength.label}
                    </design_system_1.Text>
                </design_system_1.Box>)}
            {property.help && <design_system_1.Text size="sm" mt="xs" color="grey60">{property.help}</design_system_1.Text>}
        </design_system_1.Box>);
};
exports.default = UserPasswordField;
