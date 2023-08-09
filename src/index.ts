import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import XenNode from "xen-node"

const options = { auth: { autoRefreshToken: true, persistSession: false } }
export const supabase = createClient(
	process.env.SUPABASE_URL || "",
	process.env.SUPABASE_ANON_KEY || "",
	options
)

const username = process.env.SYTHE_USER || ""
const password = process.env.SYTHE_PASS || ""
const threadID = process.env.SYTHE_THREAD || ""

const xenNode = new XenNode("https://www.sythe.org/", {
	verbose: console.log,
	username: username,
	password: password
})

async function run() {
	const cookies = (await xenNode.xenLogin(username, password)) as string[]

	try {
		const isLogged = await xenNode.checkLogin(cookies)
		console.log(isLogged)
	} catch (error) {
		console.error(error) //?? this prints but post is made.
	}

	const { data, error } = await supabase.from("scripts_public").select("title, description, url")

	if (error) return console.error(error)

	console.log(data)

	/* try {
		await xenNode.post("hello world1", threadID)
	} catch (error: any) {
		console.log(error)
	} */
}

run()
