export type LoginInfo = {
    user_name: string
    password: string
}

export type LoginResponse = {
    id: number;
    user_name: string;
    email: string;
    image: string;
    is_deleted: boolean;
    token: string;
    created_at: string;
    updated_at: string;
    prompt_ids: number[];
    chat_ids: number[];
    models: number[];
    role: {
        id: number;
        name: string;
        permission_ids: number[];
        created_at: string;
        updated_at: string;
    },
    default_prompt: {
        id: number;
        content: string;
        is_deleted: boolean;
        created_at: string;
        updated_at: string;
    },
    default_model: {
        id: number;
        name: string;
        detail_name: string;
        is_deleted: boolean;
        created_at: string;
        updated_at: string;
    }
};