import React from 'react'
import { Text, View, StyleSheet, type TextStyle} from 'react-native'

interface Props {
    children: string
    bang?: boolean
    style?: TextStyle
}

const Hello = (props: Props): React.ReactElement => {
    const { children, bang, style } = props
    return (
        <View>
            <Text style={[styles.text, style]}>
                Hello {children}
                {bang && '!'}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        color: '#ffffff',
        backgroundColor: 'blue',
        fontSize: 40,
        fontWeight: 'bold',
        padding: 16,
    },
})

export default Hello
