import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { ApiResponse, LoginInfo, LoginResponse } from "../../types";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_API_URL }),
    endpoints: build => ({
        loginUser: build.mutation<ApiResponse<LoginResponse>, LoginInfo>({
            query(body) {
                return {
                    url: 'auth/login',
                    method: 'POST',
                    body
                }
            }
        })
    })
})

export const { useLoginUserMutation } = authApi;