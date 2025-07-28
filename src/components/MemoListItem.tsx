import { JSX } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Link } from 'expo-router'

import Icon from './Icon'
import { sanitizeForDisplay } from '../utils/xssSecurity'

interface MemoListItemProps {
    title?: string
    date?: string
    content?: string
    onDelete?: () => void
}

const MemoListItem = ({
    title = '買い物リスト',
    date = '2025年7月25日 20:38',
    content = '',
    onDelete,
}: MemoListItemProps): JSX.Element => {
    // タイトルと日付をサニタイズ
    const sanitizedTitle = sanitizeForDisplay(title)
    const sanitizedDate = sanitizeForDisplay(date)

    // タイトルの長さ制限（30文字で切り詰め）
    const displayTitle =
        sanitizedTitle.length > 30 ? sanitizedTitle.substring(0, 30) + '...' : sanitizedTitle

    const handleDelete = (): void => {
        if (onDelete) {
            onDelete()
        } else {
            // TODO: 実際の削除処理を実装
            console.log('削除処理（未実装）')
        }
    }

    return (
        <Link href="/memo/detail" asChild>
            <TouchableOpacity style={styles.memoListItem}>
                <View style={styles.memoContent}>
                    <Text style={styles.memoListItemTitle} numberOfLines={1}>
                        {displayTitle}
                    </Text>
                    <Text style={styles.memoListItemDate} numberOfLines={1}>
                        {sanitizedDate}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                    <Icon name="delete" size={32} color="#B0B0B0" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Link>
    )
}

const styles = StyleSheet.create({
    memoListItem: {
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 19,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.15)',
    },
    memoContent: {
        flex: 1,
        marginRight: 12,
    },
    memoListItemTitle: {
        fontSize: 16,
        lineHeight: 32,
        fontWeight: '500',
    },
    memoListItemDate: {
        fontSize: 12,
        lineHeight: 16,
        color: '#848484',
    },
    deleteButton: {
        padding: 4,
    },
})

export default MemoListItem
