import { JSX } from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'

interface Props {
    label: string
    onPress?: () => void
    disabled?: boolean
}

const Button = (props: Props): JSX.Element => {
    const { label, onPress, disabled } = props
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, disabled && styles.buttonDisabled]}
            disabled={disabled}
        >
            <Text style={[styles.buttonLabel, disabled && styles.buttonLabelDisabled]}>
                {label}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#467FD3',
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    buttonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },
    buttonLabel: {
        fontSize: 16,
        lineHeight: 32,
        color: '#ffffff',
        paddingVertical: 8,
        paddingHorizontal: 24,
    },
    buttonLabelDisabled: {
        color: '#999999',
    },
})

export default Button
