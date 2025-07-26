import { JSX } from 'react'
import { View, Text, StyleSheet, TextInput } from 'react-native'

import Header from '../../components/Header'

const Login = (): JSX.Element => {
    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.inner}>
                <Text style={styles.title}>Log In</Text>
                <TextInput style={styles.input} value="Email address" />
                <TextInput style={styles.input} value="Password" />
                <View style={styles.button}>
                    <Text style={styles.buttonLabel}>Submit</Text>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Not registered?</Text>
                    <Text style={styles.footerLink}>Sign Up here!</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    inner: {
        paddingVertical: 24,
        paddingHorizontal: 27,
    },
    title: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        backgroundColor: '#ffffff',
        height: 48,
        padding: 8,
        fontSize: 16,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#467FD3',
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    buttonLabel: {
        fontSize: 16,
        lineHeight: 32,
        color: '#ffffff',
        paddingVertical: 8,
        paddingHorizontal: 24,
    },
    footer: {
        flexDirection: 'row',
    },
    footerText: {
        fontSize: 14,
        lineHeight: 24,
        marginRight: 8,
    },
    footerLink: {
        fontSize: 14,
        lineHeight: 24,
        color: '#467FD3',
    },
})

export default Login
