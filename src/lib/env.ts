import fs from "fs"
import dotenv from "dotenv"

const envFiles = [".env.local", "stack.env", ".env"]

for (const file of envFiles) {
	if (fs.existsSync(file)) {
		dotenv.config({ path: file })
		break // stop after the first one found
	}
}

if (Object.keys(process.env).length === 0) {
	console.warn("No environment variables found!")
}

export default process.env
