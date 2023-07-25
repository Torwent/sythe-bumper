import "dotenv/config"
import XenNode from "xen-node"

const username = process.env.SYTHE_USER || ""
const password = process.env.SYTHE_PASS || ""
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

	try {
		await xenNode.post("hello world2", "4262562")
	} catch (error) {
		//console.log(error)
	}
}

run()
