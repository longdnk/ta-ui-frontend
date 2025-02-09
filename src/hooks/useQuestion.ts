import { useState } from "react"
import { stringSimilarity } from "string-similarity-js";

export const useQuestion = () => {

    const [isSimilar, setIsSimilar] = useState<boolean>(false)

    const list = ["hi", "hello", "xin chào", "chào bạn"]

    const THRESHOLD = 0.85

    const checkSimilarity = (input: any): boolean => {
        let result = false
        for (const item of list) {
            const score = stringSimilarity(input, item)
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