import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { ApiResponse, RagInfo } from "../../types";

export const ragApi = createApi({
    reducerPath: "ragApi",
    baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_API_KEY }),
    endpoints: build => ({
        ragQuery: build.mutation<ApiResponse<string>, RagInfo>({
            query(body) {
                return {
                    url: 'rags',
                    method: 'POST',
                    body
                }
            }
        })
    })
})

export const { useRagQueryMutation } = ragApi;