import fs from "fs"
import dotenv from "dotenv"
const envFiles = [".env.local", "stack.env", ".env"]
let foundEnv = false
for (let i = 0; i < envFiles.length; i++) {
	if (fs.existsSync(envFiles[i])) {
		foundEnv = true
		dotenv.config({ path: envFiles[i] })
		break
	}
}

if (!foundEnv) throw new Error(".env file not found!")

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			SYTHE_USER: string
			SYTHE_PASS: string
			SYTHE_THREAD: string
			SYTHE_POST: string
			BUMP_HOUR_INTERVAL: string
			EDIT_MINUTE_INTERVAL: string
			SUPABASE_URL: string
			SUPABASE_ANON_KEY: string
			ENVIRONMENT: "development" | "production"
		}
	}
}

export default process.env
