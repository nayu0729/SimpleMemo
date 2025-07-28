import { JSX, useEffect, useState } from 'react'
import { StyleSheet, View, Alert } from 'react-native'
import { router, useNavigation } from 'expo-router'

import MemoListItem from '../../components/MemoListItem'
import CircleButton from '../../components/CircleButton'
import Icon from '../../components/Icon'
import LogOutButton from '../../components/LogOutButton'
import { sanitizeForDisplay } from '../../utils/xssSecurity'

interface MemoItem {
    id: string
    title: string
    content: string
    date: string
}

const handlePress = (): void => {
    router.push('/memo/create')
}

const List = (): JSX.Element => {
    const navigation = useNavigation()
    const [memos, setMemos] = useState<MemoItem[]>([])

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => {
                return (
                    <LogOutButton />
                )
            },
        })

        // モックデータ（実際にはFirestoreから取得）
        const mockMemos = [
            {
                id: '1',
                title: '買い物リスト',
                content: '牛乳\nパン\n卵',
                date: '2025年7月25日 20:38'
            },
            {
                id: '2', 
                title: '会議メモ',
                content: 'プロジェクトの進捗について話し合い',
                date: '2025年7月24日 15:30'
            },
            {
                id: '3',
                title: 'TODO',
                content: 'アプリの仕上げ\nデプロイ準備',
                date: '2025年7月23日 10:15'
            }
        ]

        // データをサニタイズして設定
        const sanitizedMemos = mockMemos.map(memo => ({
            ...memo,
            title: sanitizeForDisplay(memo.title),
            content: sanitizeForDisplay(memo.content),
            date: sanitizeForDisplay(memo.date)
        }))

        setMemos(sanitizedMemos)
    }, [])

    const handleDeleteMemo = (id: string) => {
        Alert.alert(
            '削除確認',
            'このメモを削除しますか？',
            [
                {
                    text: 'キャンセル',
                    style: 'cancel'
                },
                {
                    text: '削除',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Firestoreから削除
                        setMemos(prev => prev.filter(memo => memo.id !== id))
                        console.log(`メモ削除: ${id}`)
                    }
                }
            ]
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.memoList}>
                {memos.map((memo) => (
                    <MemoListItem
                        key={memo.id}
                        title={memo.title}
                        date={memo.date}
                        content={memo.content}
                        onDelete={() => handleDeleteMemo(memo.id)}
                    />
                ))}
            </View>

            <CircleButton onPress={handlePress}>
                <Icon name="plus" size={40} color="#ffffff" />
            </CircleButton>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    memoList: {
        flex: 1,
    },
})

export default List
