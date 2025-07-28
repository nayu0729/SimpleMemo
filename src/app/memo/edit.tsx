import { JSX, useState, useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Alert } from 'react-native'

import { router } from 'expo-router'

import CircleButton from '../../components/CircleButton'
import Icon from '../../components/Icon'
import {
    validateMemoContent,
    containsForbiddenContent,
    sanitizeForDisplay,
} from '../../utils/xssSecurity'

const Edit = (): JSX.Element => {
    const [content, setContent] = useState('')
    const [isValid, setIsValid] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        // 既存メモの初期化（実際にはpropsやrouteパラメータから取得）
        const existingContent = '買い物\nリスト' // 現在のハードコード値

        // 既存コンテンツもサニタイズして表示
        const sanitizedExisting = sanitizeForDisplay(existingContent)
        setContent(sanitizedExisting)
    }, [])

    const handleTextChange = (text: string): void => {
        // 禁止コンテンツのリアルタイムチェック
        if (containsForbiddenContent(text)) {
            Alert.alert('セキュリティエラー', '使用できない文字または形式が含まれています')
            return
        }

        // 文字数制限のリアルタイムチェック（10,000文字）
        if (text.length > 10000) {
            Alert.alert('入力制限', 'メモの内容は10,000文字以内で入力してください')
            return
        }

        setContent(text)

        // エラー状態をリセット
        if (!isValid) {
            setIsValid(true)
            setErrorMessage('')
        }
    }

    const handlePress = (): void => {
        // バリデーション実行
        const validation = validateMemoContent(content)

        if (!validation.isValid) {
            setIsValid(false)
            setErrorMessage(validation.error || 'エラーが発生しました')
            Alert.alert('入力エラー', validation.error)
            return
        }

        // サニタイズされた内容で更新処理（将来のFirestore更新用）
        const sanitizedContent = validation.sanitized
        console.log('更新する内容（サニタイズ済み）:', sanitizedContent)

        // TODO: Firestoreへの更新処理をここに実装

        router.back()
    }

    return (
        <KeyboardAvoidingView behavior="height" style={styles.container} keyboardVerticalOffset={75}>
            <View style={styles.inputContainer}>
                <TextInput
                    multiline
                    value={content}
                    onChangeText={handleTextChange}
                    style={[styles.input, !isValid && styles.inputError]}
                    placeholder="メモの内容を入力してください"
                    maxLength={10000}
                    textAlignVertical="top"
                />
                {!isValid && <Text style={styles.errorText}>{errorMessage}</Text>}
                <View style={styles.characterCount}>
                    <Text style={styles.characterCountText}>{content.length}/10,000文字</Text>
                </View>
            </View>
            <CircleButton onPress={handlePress}>
                <Icon name="check" size={40} color="#ffffff" />
            </CircleButton>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    inputContainer: {
        paddingVertical: 32,
        paddingHorizontal: 27,
        flex: 1,
    },
    input: {
        flex: 1,
        textAlignVertical: 'top',
        fontSize: 16,
        lineHeight: 24,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 4,
        padding: 12,
    },
    inputError: {
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginTop: 8,
        marginBottom: 4,
    },
    characterCount: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    characterCountText: {
        fontSize: 12,
        color: '#888888',
    },
})

export default Edit
