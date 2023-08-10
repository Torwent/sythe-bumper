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

	const { data, error } = await supabase.from("scripts_public").select("title, description, url, categories")

	if (error) return console.error(error)

	var bumpOutPut: string = "Bump, check out [URL='https://waspscripts.com/']WaspScripts[/URL]. \n\nCheck out some of the scripts we have to offer:"
	
	var premium: string = 'Premium:'
	var free: string = 'Free:'

	//Lists of Items filterd by category
	var freeItems: Item[] = [];
	var premiumItems: Item[] = [];
	data.forEach(item => {
		if(item.categories.includes("Free"))
			freeItems.push(item)
		else if(item.categories.includes("Premium"))
			premiumItems.push(item)
	});
	shuffleArray(premiumItems)
	shuffleArray(freeItems)

	const util = require('util');

	//free Items
	for (let i = 0; i < 3; i++) {
		const url = freeItems[i].url
		const title = freeItems[i].title
		const description = freeItems[i].description
		free = util.format("%s \n - [URL='https://waspscripts.com/scripts/%s']%s[/URL] - %s.", free, url , title, description);
	}

	//premium Items
	for (let i = 0; i < 3; i++) {
		const url = premiumItems[i].url
		const title = premiumItems[i].title
		const description = premiumItems[i].description
		premium = util.format("%s \n - [URL='https://waspscripts.com/scripts/%s']%s[/URL] - %s.", premium, url , title, description);
	}

	bumpOutPut = util.format("%s \n\n %s \n\n %s", bumpOutPut, premium, free)
	console.log(bumpOutPut)

	
	// try {
	// 	await xenNode.post(bumpOutPut, threadID)
	// } catch (error: any) {
	// 	console.log(error)
	// }
}

//Loop throught every 4 hours and 10 min
const bumpInterval = 4 * 60 * 60 * 1000 + 10 * 60 * 1000
setInterval(async () => {
	await run();
}, bumpInterval);



interface Item {
	title: string;
	description: string;
	url: string;
	categories: string[];
}

function shuffleArray(array: any[]) {
	for (let i = array.length - 1; i > 0; i--) {
	  const j = Math.floor(Math.random() * (i + 1));
	  [array[i], array[j]] = [array[j], array[i]];
	}
}