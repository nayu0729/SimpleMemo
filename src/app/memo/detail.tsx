import { JSX, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { router } from 'expo-router'

import CircleButton from '../../components/CircleButton'
import Icon from '../../components/Icon'
import { sanitizeForDisplay } from '../../utils/xssSecurity'

interface MemoData {
    title: string
    content: string
    date: string
}

const Detail = (): JSX.Element => {
    const [memoData, setMemoData] = useState<MemoData>({
        title: '買い物リスト',
        content: '本文',
        date: '2025年7月25日 20:38',
    })

    useEffect(() => {
        // 実際の実装では、routeパラメータやFirestoreからデータを取得
        // 現在はハードコードされたデータを使用
        const rawData = {
            title: '買い物リスト',
            content: '本文',
            date: '2025年7月25日 20:38',
        }

        // データをサニタイズして設定
        setMemoData({
            title: sanitizeForDisplay(rawData.title),
            content: sanitizeForDisplay(rawData.content),
            date: sanitizeForDisplay(rawData.date),
        })
    }, [])

    const handlePress = (): void => {
        router.push('/memo/edit')
    }

    return (
        <View style={styles.container}>
            <View style={styles.memoHeader}>
                <Text style={styles.memoTitle} numberOfLines={2}>
                    {memoData.title}
                </Text>
                <Text style={styles.memoDate} numberOfLines={1}>
                    {memoData.date}
                </Text>
            </View>
            <ScrollView style={styles.memoBody} showsVerticalScrollIndicator={true}>
                <View style={styles.contentContainer}>
                    <Text style={styles.memoBodyText} selectable={true}>
                        {memoData.content}
                    </Text>
                </View>
            </ScrollView>
            <CircleButton style={{ top: 60, bottom: 'auto' }} onPress={handlePress}>
                <Icon name="pencil" size={40} color="#ffffff" />
            </CircleButton>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    memoHeader: {
        backgroundColor: '#467FD3',
        minHeight: 96,
        justifyContent: 'center',
        paddingVertical: 24,
        paddingHorizontal: 19,
    },
    memoTitle: {
        color: '#ffffff',
        fontSize: 20,
        lineHeight: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    memoDate: {
        color: '#ffffff',
        fontSize: 12,
        lineHeight: 16,
        opacity: 0.9,
    },
    memoBody: {
        flex: 1,
        paddingVertical: 32,
        paddingHorizontal: 27,
    },
    contentContainer: {
        minHeight: '100%',
    },
    memoBodyText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#000000',
    },
})

export default Detail
