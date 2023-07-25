declare global {
	namespace NodeJS {
		interface ProcessEnv {
			SYTHE_USER: string
			SYTHE_PASS: string
		}
	}
}

export {}
