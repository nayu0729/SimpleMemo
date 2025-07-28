/**
 * XSS対策のためのセキュリティユーティリティ
 */

// 危険な文字とHTMLタグのパターン
const DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi, // onclick, onload等のイベントハンドラー
    /data:text\/html/gi,
]

// HTMLエスケープ用のマップ
const HTML_ESCAPE_MAP: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
}

/**
 * HTMLエスケープ処理
 */
export const escapeHtml = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return ''
    }
    return text.replace(/[&<>"'/]/g, (match) => HTML_ESCAPE_MAP[match] || match)
}

/**
 * 危険なスクリプトやHTMLタグを除去
 */
export const removeDangerousContent = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return ''
    }

    let sanitized = text
    DANGEROUS_PATTERNS.forEach((pattern) => {
        sanitized = sanitized.replace(pattern, '')
    })

    return sanitized
}

/**
 * 入力値の基本的なサニタイゼーション
 */
export const sanitizeInput = (input: string): string => {
    if (!input || typeof input !== 'string') {
        return ''
    }

    // 危険なコンテンツを除去
    let sanitized = removeDangerousContent(input)

    // HTMLエスケープ
    sanitized = escapeHtml(sanitized)

    // 連続する空白を正規化
    sanitized = sanitized.replace(/\s+/g, ' ')

    // 前後の空白をトリム
    sanitized = sanitized.trim()

    return sanitized
}

/**
 * メールアドレスのバリデーション
 */
export const validateEmail = (
    email: string
): { isValid: boolean; error?: string; sanitized: string } => {
    const sanitized = sanitizeInput(email)

    if (sanitized.length === 0) {
        return {
            isValid: false,
            error: 'メールアドレスを入力してください',
            sanitized,
        }
    }

    // メールアドレスの基本形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitized)) {
        return {
            isValid: false,
            error: '正しいメールアドレスの形式で入力してください',
            sanitized,
        }
    }

    // 長さ制限（一般的なメールアドレスの上限）
    if (sanitized.length > 320) {
        return {
            isValid: false,
            error: 'メールアドレスが長すぎます',
            sanitized: sanitized.substring(0, 320),
        }
    }

    // 危険文字の追加チェック
    if (containsForbiddenContent(sanitized)) {
        return {
            isValid: false,
            error: '使用できない文字が含まれています',
            sanitized,
        }
    }

    return {
        isValid: true,
        sanitized,
    }
}

/**
 * パスワード強度の評価
 */
export const evaluatePasswordStrength = (
    password: string
): {
    score: number // 0-4
    feedback: string[]
    strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong'
} => {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
        score++
    } else {
        feedback.push('8文字以上で入力してください')
    }

    if (/[a-z]/.test(password)) {
        score++
    } else {
        feedback.push('小文字を含めてください')
    }

    if (/[A-Z]/.test(password)) {
        score++
    } else {
        feedback.push('大文字を含めてください')
    }

    if (/[0-9]/.test(password)) {
        score++
    } else {
        feedback.push('数字を含めてください')
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score++
    } else {
        feedback.push('記号を含めてください')
    }

    const strengthMap = {
        0: 'very_weak',
        1: 'weak',
        2: 'fair',
        3: 'good',
        4: 'strong',
    } as const

    return {
        score,
        feedback,
        strength: strengthMap[score as keyof typeof strengthMap],
    }
}

/**
 * パスワードのバリデーション
 */
export const validatePassword = (
    password: string
): {
    isValid: boolean
    error?: string
    sanitized: string
    strength?: ReturnType<typeof evaluatePasswordStrength>
} => {
    const sanitized = removeDangerousContent(password) // パスワードはHTMLエスケープしない

    if (sanitized.length === 0) {
        return {
            isValid: false,
            error: 'パスワードを入力してください',
            sanitized,
        }
    }

    // 最小長制限
    if (sanitized.length < 6) {
        return {
            isValid: false,
            error: 'パスワードは6文字以上で入力してください',
            sanitized,
        }
    }

    // 最大長制限
    if (sanitized.length > 128) {
        return {
            isValid: false,
            error: 'パスワードが長すぎます（128文字以内）',
            sanitized: sanitized.substring(0, 128),
        }
    }

    // 危険パターンのチェック
    if (containsForbiddenContent(password)) {
        return {
            isValid: false,
            error: '使用できない文字または形式が含まれています',
            sanitized,
        }
    }

    const strength = evaluatePasswordStrength(sanitized)

    return {
        isValid: true,
        sanitized,
        strength,
    }
}

/**
 * 認証データの包括的バリデーション
 */
export const validateAuthData = (data: {
    email: string
    password: string
}): {
    isValid: boolean
    errors: string[]
    sanitizedData: { email: string; password: string }
    passwordStrength?: ReturnType<typeof evaluatePasswordStrength>
} => {
    const errors: string[] = []

    const emailValidation = validateEmail(data.email)
    const passwordValidation = validatePassword(data.password)

    if (!emailValidation.isValid) {
        errors.push(`メール: ${emailValidation.error}`)
    }

    if (!passwordValidation.isValid) {
        errors.push(`パスワード: ${passwordValidation.error}`)
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: {
            email: emailValidation.sanitized,
            password: passwordValidation.sanitized,
        },
        passwordStrength: passwordValidation.strength,
    }
}

/**
 * メモのタイトル用バリデーション
 */
export const validateMemoTitle = (
    title: string
): { isValid: boolean; error?: string; sanitized: string } => {
    const sanitized = sanitizeInput(title)

    if (sanitized.length === 0) {
        return {
            isValid: false,
            error: 'タイトルを入力してください',
            sanitized,
        }
    }

    if (sanitized.length > 100) {
        return {
            isValid: false,
            error: 'タイトルは100文字以内で入力してください',
            sanitized: sanitized.substring(0, 100),
        }
    }

    return {
        isValid: true,
        sanitized,
    }
}

/**
 * メモの本文用バリデーション
 */
export const validateMemoContent = (
    content: string
): { isValid: boolean; error?: string; sanitized: string } => {
    const sanitized = sanitizeInput(content)

    if (sanitized.length === 0) {
        return {
            isValid: false,
            error: 'メモの内容を入力してください',
            sanitized,
        }
    }

    if (sanitized.length > 10000) {
        return {
            isValid: false,
            error: 'メモの内容は10,000文字以内で入力してください',
            sanitized: sanitized.substring(0, 10000),
        }
    }

    return {
        isValid: true,
        sanitized,
    }
}

/**
 * 表示用のテキストサニタイゼーション（軽量版）
 */
export const sanitizeForDisplay = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return ''
    }

    // 基本的な危険パターンのみチェック
    return removeDangerousContent(text)
}

/**
 * 入力文字数制限チェック
 */
export const checkInputLength = (text: string, maxLength: number): boolean => {
    return text.length <= maxLength
}

/**
 * 禁止文字列のチェック
 */
export const containsForbiddenContent = (text: string): boolean => {
    const forbiddenPatterns = [
        /javascript:/gi,
        /vbscript:/gi,
        /<script/gi,
        /<iframe/gi,
        /on\w+\s*=/gi,
    ]

    return forbiddenPatterns.some((pattern) => pattern.test(text))
}

/**
 * セキュアな文字列切り詰め（XSS攻撃を考慮）
 */
export const secureSubstring = (text: string, maxLength: number): string => {
    if (!text || typeof text !== 'string') {
        return ''
    }

    const sanitized = sanitizeForDisplay(text)
    return sanitized.length > maxLength ? sanitized.substring(0, maxLength) + '...' : sanitized
}

/**
 * メモデータの包括的バリデーション
 */
export const validateMemoData = (data: {
    title?: string
    content?: string
}): {
    isValid: boolean
    errors: string[]
    sanitizedData: { title: string; content: string }
} => {
    const errors: string[] = []

    const titleValidation = validateMemoTitle(data.title || '')
    const contentValidation = validateMemoContent(data.content || '')

    if (!titleValidation.isValid) {
        errors.push(`タイトル: ${titleValidation.error}`)
    }

    if (!contentValidation.isValid) {
        errors.push(`内容: ${contentValidation.error}`)
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: {
            title: titleValidation.sanitized,
            content: contentValidation.sanitized,
        },
    }
}

/**
 * CSP（Content Security Policy）ヘルパー
 * ※React Nativeでは直接的には使用されないが、将来WebView使用時に参考
 */
export const getCSPDirectives = (): string => {
    return [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://firestore.googleapis.com",
        "frame-src 'none'",
        "object-src 'none'",
    ].join('; ')
}
