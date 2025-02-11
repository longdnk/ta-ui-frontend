import { useState } from "react"
import { stringSimilarity } from "string-similarity-js";

export const useQuestion = () => {

    const [isSimilar, setIsSimilar] = useState<boolean>(false)

    const list = ["hi", "helo", "hello", "xin chào", "chào bạn", "chào", "bạn tên gì", "xin chào, bạn tên gì"]

    const THRESHOLD = 0.8

    const checkSimilarity = (input: any): boolean => {
        let result = false
        for (const item of list) {
            const score = stringSimilarity(input, item.toLowerCase())
            if (score >= THRESHOLD) {
                setIsSimilar(true)
                return true
            }
        }
        setIsSimilar(result)
        return result
    }

    return { checkSimilarity, isSimilar }
};