import { JSX, useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import { Link, router } from 'expo-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'

import { auth } from '../../config'
import Button from '../../components/Button'
import {
    validateEmail,
    validatePassword,
    containsForbiddenContent,
    evaluatePasswordStrength,
} from '../../utils/xssSecurity'

interface ValidationState {
    email: { isValid: boolean; error: string }
    password: { isValid: boolean; error: string }
}

const SignUp = (): JSX.Element => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [validation, setValidation] = useState<ValidationState>({
        email: { isValid: true, error: '' },
        password: { isValid: true, error: '' },
    })
    const [passwordStrength, setPasswordStrength] = useState<ReturnType<
        typeof evaluatePasswordStrength
    > | null>(null)
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
            setValidation((prev) => ({
                ...prev,
                email: { isValid: true, error: '' },
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

        // パスワード強度をリアルタイムで評価
        if (text.length > 0) {
            const strength = evaluatePasswordStrength(text)
            setPasswordStrength(strength)
        } else {
            setPasswordStrength(null)
        }

        // エラー状態をリセット
        if (!validation.password.isValid) {
            setValidation((prev) => ({
                ...prev,
                password: { isValid: true, error: '' },
            }))
        }
    }

    const getStrengthColor = (strength: string): string => {
        switch (strength) {
            case 'very_weak':
                return '#FF6B6B'
            case 'weak':
                return '#FFA07A'
            case 'fair':
                return '#FFD700'
            case 'good':
                return '#90EE90'
            case 'strong':
                return '#32CD32'
            default:
                return '#999999'
        }
    }

    const getStrengthText = (strength: string): string => {
        switch (strength) {
            case 'very_weak':
                return '非常に弱い'
            case 'weak':
                return '弱い'
            case 'fair':
                return '普通'
            case 'good':
                return '良い'
            case 'strong':
                return '強い'
            default:
                return ''
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
                error: emailValidation.error || '',
            },
            password: {
                isValid: passwordValidation.isValid,
                error: passwordValidation.error || '',
            },
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

        // パスワード強度の警告（弱い場合）
        const strength = evaluatePasswordStrength(password)
        if (strength.strength === 'very_weak' || strength.strength === 'weak') {
            Alert.alert(
                'パスワード強度の警告',
                `現在のパスワード強度: ${getStrengthText(
                    strength.strength
                )}\n\nより安全なパスワードを使用することをお勧めします。続行しますか？`,
                [
                    { text: 'キャンセル', style: 'cancel' },
                    {
                        text: '続行',
                        onPress: () =>
                            performSignUp(emailValidation.sanitized, passwordValidation.sanitized),
                    },
                ]
            )
            return
        }

        performSignUp(emailValidation.sanitized, passwordValidation.sanitized)
    }

    const performSignUp = (sanitizedEmail: string, sanitizedPassword: string): void => {
        setIsLoading(true)

        createUserWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword)
            .then((userCredential) => {
                console.log('サインアップ成功:', userCredential.user.uid)
                router.replace('/memo/list')
            })
            .catch((error) => {
                const { code, message } = error
                console.log('サインアップエラー:', code)

                // ユーザーフレンドリーなエラーメッセージ
                let userMessage = 'アカウント作成に失敗しました'
                switch (code) {
                    case 'auth/email-already-in-use':
                        userMessage = 'このメールアドレスは既に使用されています'
                        break
                    case 'auth/weak-password':
                        userMessage =
                            'パスワードが弱すぎます。より強力なパスワードを設定してください'
                        break
                    case 'auth/invalid-email':
                        userMessage = 'メールアドレスの形式が正しくありません'
                        break
                    case 'auth/operation-not-allowed':
                        userMessage = 'メール/パスワード認証が無効になっています'
                        break
                    default:
                        userMessage = 'アカウント作成に失敗しました'
                }
                Alert.alert('サインアップエラー', userMessage)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    return (
        <View style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.title}>Sign Up</Text>

                <View style={styles.inputGroup}>
                    <TextInput
                        style={[styles.input, !validation.email.isValid && styles.inputError]}
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
                        style={[styles.input, !validation.password.isValid && styles.inputError]}
                        value={password}
                        onChangeText={handlePasswordChange}
                        autoCapitalize="none"
                        secureTextEntry
                        placeholder="Password"
                        textContentType="newPassword"
                        autoComplete="password-new"
                        maxLength={128}
                        editable={!isLoading}
                    />
                    {!validation.password.isValid && (
                        <Text style={styles.errorText}>{validation.password.error}</Text>
                    )}

                    {/* パスワード強度インジケーター */}
                    {passwordStrength && (
                        <View style={styles.strengthContainer}>
                            <View style={styles.strengthBar}>
                                <View
                                    style={[
                                        styles.strengthFill,
                                        {
                                            width: `${(passwordStrength.score / 4) * 100}%`,
                                            backgroundColor: getStrengthColor(
                                                passwordStrength.strength
                                            ),
                                        },
                                    ]}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.strengthText,
                                    { color: getStrengthColor(passwordStrength.strength) },
                                ]}
                            >
                                強度: {getStrengthText(passwordStrength.strength)}
                            </Text>

                            {passwordStrength.feedback.length > 0 && (
                                <View style={styles.feedbackContainer}>
                                    {passwordStrength.feedback.map((feedback, index) => (
                                        <Text key={index} style={styles.feedbackText}>
                                            • {feedback}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <Button
                    label={isLoading ? '作成中...' : 'Submit'}
                    onPress={handlePress}
                    disabled={isLoading}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already registered?</Text>
                    <Link href="/auth/logIn" asChild replace>
                        <TouchableOpacity disabled={isLoading}>
                            <Text style={[styles.footerLink, isLoading && styles.linkDisabled]}>
                                Log In
                            </Text>
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
    strengthContainer: {
        marginTop: 8,
    },
    strengthBar: {
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        marginBottom: 4,
    },
    strengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthText: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    feedbackContainer: {
        backgroundColor: '#F8F9FA',
        padding: 8,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#FFA07A',
    },
    feedbackText: {
        fontSize: 11,
        color: '#666666',
        marginBottom: 2,
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

export default SignUp
