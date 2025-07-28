import { JSX, useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import { Link, router } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { auth } from '../../config'
import Button from '../../components/Button'
import { validateEmail, validatePassword, containsForbiddenContent } from '../../utils/xssSecurity'

interface ValidationState {
    email: { isValid: boolean; error: string }
    password: { isValid: boolean; error: string }
}

const LogIn = (): JSX.Element => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [validation, setValidation] = useState<ValidationState>({
        email: { isValid: true, error: '' },
        password: { isValid: true, error: '' }
    })
    const [isLoading, setIsLoading] = useState(false)

    const handleEmailChange = (text: string): void => {
        // 基本的なXSSチェック
        if (containsForbiddenContent(text)) {
            Alert.alert('セキュリティエラー', '使用できない文字が含まれています')
            return
        }

        setEmail(text)
        
        // エラー状態をリセット
        if (!validation.email.isValid) {
            setValidation(prev => ({
                ...prev,
                email: { isValid: true, error: '' }
            }))
        }
    }

    const handlePasswordChange = (text: string): void => {
        // 基本的なXSSチェックとlength制限
        if (containsForbiddenContent(text)) {
            Alert.alert('セキュリティエラー', '使用できない文字が含まれています')
            return
        }

        if (text.length > 128) {
            Alert.alert('入力制限', 'パスワードは128文字以内で入力してください')
            return
        }

        setPassword(text)
        
        // エラー状態をリセット
        if (!validation.password.isValid) {
            setValidation(prev => ({
                ...prev,
                password: { isValid: true, error: '' }
            }))
        }
    }

    const handlePress = (): void => {
        if (isLoading) return

        // バリデーション実行
        const emailValidation = validateEmail(email)
        const passwordValidation = validatePassword(password)

        const newValidation: ValidationState = {
            email: { 
                isValid: emailValidation.isValid, 
                error: emailValidation.error || '' 
            },
            password: { 
                isValid: passwordValidation.isValid, 
                error: passwordValidation.error || '' 
            }
        }

        setValidation(newValidation)

        // バリデーションエラーがある場合は処理を中断
        if (!emailValidation.isValid || !passwordValidation.isValid) {
            const errors = []
            if (!emailValidation.isValid) errors.push(emailValidation.error)
            if (!passwordValidation.isValid) errors.push(passwordValidation.error)
            
            Alert.alert('入力エラー', errors.join('\n'))
            return
        }

        // サニタイズされた値でログイン処理
        const sanitizedEmail = emailValidation.sanitized
        const sanitizedPassword = passwordValidation.sanitized

        setIsLoading(true)
        
        signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword)
            .then((userCredential) => {
                console.log('ログイン成功:', userCredential.user.uid)
                router.replace('/memo/list')
            })
            .catch((error) => {
                const { code, message } = error
                console.log('ログインエラー:', code)
                
                // ユーザーフレンドリーなエラーメッセージ
                let userMessage = 'ログインに失敗しました'
                switch (code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        userMessage = 'メールアドレスまたはパスワードが正しくありません'
                        break
                    case 'auth/too-many-requests':
                        userMessage = 'ログイン試行回数が上限に達しました。しばらく時間をおいてからお試しください'
                        break
                    case 'auth/user-disabled':
                        userMessage = 'このアカウントは無効化されています'
                        break
                    case 'auth/invalid-email':
                        userMessage = 'メールアドレスの形式が正しくありません'
                        break
                    default:
                        userMessage = 'ログインに失敗しました'
                }
                Alert.alert('ログインエラー', userMessage)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    return (
        <View style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.title}>Log In</Text>
                
                <View style={styles.inputGroup}>
                    <TextInput
                        style={[
                            styles.input,
                            !validation.email.isValid && styles.inputError
                        ]}
                        value={email}
                        onChangeText={handleEmailChange}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="Email Address"
                        textContentType="emailAddress"
                        autoComplete="email"
                        maxLength={320}
                        editable={!isLoading}
                    />
                    {!validation.email.isValid && (
                        <Text style={styles.errorText}>{validation.email.error}</Text>
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <TextInput
                        style={[
                            styles.input,
                            !validation.password.isValid && styles.inputError
                        ]}
                        value={password}
                        onChangeText={handlePasswordChange}
                        autoCapitalize="none"
                        secureTextEntry
                        placeholder="Password"
                        textContentType="password"
                        autoComplete="password"
                        maxLength={128}
                        editable={!isLoading}
                    />
                    {!validation.password.isValid && (
                        <Text style={styles.errorText}>{validation.password.error}</Text>
                    )}
                </View>

                <Button 
                    label={isLoading ? "ログイン中..." : "Submit"} 
                    onPress={handlePress}
                    disabled={isLoading}
                />
                
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Not registered?</Text>
                    <Link href="/auth/signUp" asChild replace>
                        <TouchableOpacity disabled={isLoading}>
                            <Text style={[
                                styles.footerLink,
                                isLoading && styles.linkDisabled
                            ]}>Sign Up here!</Text>
                        </TouchableOpacity>
                    </Link>
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
    inputGroup: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        backgroundColor: '#ffffff',
        height: 48,
        padding: 8,
        fontSize: 16,
        borderRadius: 4,
    },
    inputError: {
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        marginTop: 8,
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
    linkDisabled: {
        opacity: 0.5,
    },
})

export default LogIn
