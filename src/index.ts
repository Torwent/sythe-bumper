import "./lib/alias"
import env from "$lib/env"
import { createClient } from "@supabase/supabase-js"
import XenNode from "xen-node"
import util from "util"

//Init env Vars
const options = { auth: { autoRefreshToken: true, persistSession: false } }
export const supabase = createClient(
	env.SUPABASE_URL || "",
	env.SUPABASE_ANON_KEY || "",
	options
)

const username = env.SYTHE_USER || ""
const password = env.SYTHE_PASS || ""
const threadID = env.SYTHE_THREAD || ""
const postID = env.SYTHE_POST || ""

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

	const { data, error } = await supabase
		.from("scripts_public")
		.select("title, description, url, categories, published")
		.eq("published", "True")

	if (error) return console.error(error)

	var bumpOutPut: string =
		"Bump, check out [URL='https://waspscripts.com/']WaspScripts[/URL]. \n\nCheck out some of the scripts we have to offer:"

	var premium: string = "Premium:"
	var free: string = "Free:"

	//Lists of Items filterd by category
	var freeItems: Item[] = []
	var premiumItems: Item[] = []
	data.forEach((item) => {
		if (item.categories.includes("Free")) freeItems.push(item)
		else if (item.categories.includes("Premium")) premiumItems.push(item)
	})
	shuffleArray(premiumItems)
	shuffleArray(freeItems)

	for (let i = 0; i < 3; i++) {
		const url1 = freeItems[i].url
		const title1 = freeItems[i].title
		var description1 = freeItems[i].description.trim()
		if(!description1.endsWith(".") && !description1.endsWith("!")) description1 = description1 + ".";
		free = util.format(
			"%s \n - [URL='https://waspscripts.com/scripts/%s']%s[/URL] - %s",
			free,
			url1,
			title1,
			description1
		)

		const url2 = premiumItems[i].url
		const title2 = premiumItems[i].title
		var description2 = premiumItems[i].description.trim()
		if(!description2.endsWith(".") && !description2.endsWith("!")) description2 = description2 + ".";
		premium = util.format(
			"%s \n - [URL='https://waspscripts.com/scripts/%s']%s[/URL] - %s",
			premium,
			url2,
			title2,
			description2
		)
	}

	bumpOutPut = util.format("%s \n\n %s \n\n %s", bumpOutPut, premium, free)
	//console.log(bumpOutPut)

	try {
		//await xenNode.post(bumpOutPut, threadID)
		await xenNode.editPost("abcde", `${postID}/save#`)
	} catch (error: any) {
		console.log(error)
	}
}

//Loop throught every 4 hours and 10 min
const bumpInterval = 4 * 60 * 60 * 1000 + 10 * 60 * 1000

// setInterval(async () => {
// 	await run()
// }, 5000)

run()

interface Item {
	title: string
	description: string
	url: string
	categories: string[]
}

function shuffleArray(array: any[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
}