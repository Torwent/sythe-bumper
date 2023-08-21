declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string | undefined
			SYTHE_USER: string
			SYTHE_USER: string
			SYTHE_PASS: string
			SYTHE_THREAD: string
			SYTHE_POST: string
			SUPABASE_URL: string
			SUPABASE_ANON_KEY: string
		}
	}
}
export {}
