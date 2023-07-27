declare global {
	namespace NodeJS {
		interface ProcessEnv {
			SYTHE_USER: string
			SYTHE_PASS: string
			SYTHE_THREAD: string
			SUPABASE_URL: string
			SUPABASE_ANON_KEY: string
		}
	}
}

export {}
