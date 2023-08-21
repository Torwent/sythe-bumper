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

	const { data, error } = await supabase.schema("scripts")
		.from("scripts")
		.select(`id, url, title, description, content, categories, subcategories, published,
		   protected!left (assets, revision, username, avatar, revision_date, broken),
		   stats_simba!left (experience, gold, runtime, levels, unique_users_total, online_users_total)`)
		.eq("published", "True")
		
	if (error) return console.error(error)

	//console.log(data)

	const { data: totalStatData, error: err } = await supabase.rpc("get_stats_total")
	
	if (err) return console.error(err)

	//console.log(totalStatData)
	

	

	var bumpOutPut: string =
		"Bump, check out [URL='https://waspscripts.com/']WaspScripts[/URL]. \n\nCheck out some of the scripts we have to offer:"

	var premium: string = "[b]Premium:[/b]"
	var free: string = "[b]Free:[/b]"

	//Lists of Items filterd by category
	var freeItems: any[] = []
	var premiumItems: any[] = []
	data.forEach((item) => {
		if (item.categories.includes("Free")) freeItems.push(item)
		else if (item.categories.includes("Premium")) premiumItems.push(item)
	})

	//Bumps
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

	//Stats a experience, gold e runtimes
	//Edit Main Post
	var editPostOutPut: string = `[CENTER][b]I'm here to invite you guys to the[/b] [URL='https://waspscripts.com/']WaspScripts[/URL].\n\n
	WaspScripts is a botting website that hosts a collection of scripts for Simba.\n\n
	All scripts are [color=#FF0000]C[/color][color=#FF9900]o[/color][color=#CBFF00]l[/color][color=#32FF00]o[/color][color=#00FF66]r[/color] [color=#0065FF]o[/color][color=#3200FF]n[/color][color=#CC00FF]l[/color][color=#FF0098]y[/color] and [b]OSRS exclusive[/b].\n\n
	Being [b]Simba[/b] scripts they are also [b]open source[/b].\n\n
	There's [color=#a6ff4d]Free[/color] and [color=#ff8000]Premium[/color] scripts available for several things.\n\n
	You need to use [b]Simba 1400[/b] and install [b]SRL-Development[/b] and [b]WaspLib[/b].\n\n
	You can find several guides on the server including a setup guide.\n\n
	Everything is quite high quality and it's probably among the best color bots your will find publicly available (as in, that's not kept for private use).\n\n
	Scripts have a lot of antiban features that can easily be tweaked to your taste and if you need some really heavy tweaking you can always modify the source code.\n\n
	It's also possible to minimize and use your mouse or bot on multiple accounts thanks to remote input included in SRL.\n\n
	[b]If you need any help with anything just let me know in discord![/b]\n\n
	See you guys there!\n\n[/CENTER]`

	premium = "[SIZE=7][b]Premium:[/b][/SIZE]"
	free = "[SIZE=7][b]Free:[/b][/SIZE]"

	//all premium scripts
	for (let i = 0; i < premiumItems.length; i++) {
		const url = premiumItems[i].url
		const title = premiumItems[i].title
		var description = premiumItems[i].description.trim()
		const experience = formatRSNumber(premiumItems[i].stats_simba.experience);
		const gold = premiumItems[i].stats_simba.gold;
		const runtime = convertTime(premiumItems[i].stats_simba.runtime);
		var stats: string = ""
		if(runtime !== "") stats = `[INDENT]- experience: ${experience} ,gold: ${gold} ,runtime: ${runtime} [/INDENT]`
		if(!description.endsWith(".") && !description.endsWith("!")) description = description + ".";
		premium = util.format(
			"%s\n\n - [URL='https://waspscripts.com/scripts/%s']%s[/URL] - %s %s",
			premium,
			url,
			title,
			description,
			stats
		)
	}

	//all free scripts
	for (let i = 0; i < freeItems.length; i++) {
		const url = freeItems[i].url
		const title = freeItems[i].title
		var description = freeItems[i].description.trim()
		const experience = formatRSNumber(freeItems[i].stats_simba.experience);
		const gold = freeItems[i].stats_simba.gold;
		const runtime = convertTime(freeItems[i].stats_simba.runtime);
		var stats: string = ""
		if(runtime != "") stats = `[INDENT]- experience: ${experience} ,gold: ${gold} ,runtime: ${runtime} [/INDENT]`
		if(!description.endsWith(".") && !description.endsWith("!")) description = description + ".";
		free = util.format(
			"%s\n\n - [URL='https://waspscripts.com/scripts/%s']%s[/URL] - %s %s",
			free,
			url,
			title,
			description,
			stats
		)
	}

	
	//totalStats
	const totalStats : string = `[CENTER][size=7]
	[color=#f97316]Total Experience Earned:[/color] ${formatRSNumber(totalStatData[0].experience)}
	[color=#f97316]Total Gold Earned:[/color] ${formatRSNumber(totalStatData[0].gold)}
	[color=#f97316]Total Levels Earned:[/color] ${totalStatData[0].levels}
	[color=#f97316]Total Runtime:[/color] ${convertTime(totalStatData[0].runtime)}
	[/size][/CENTER]`
	editPostOutPut = util.format("%s \n\n %s \n\n %s \n\n %s", editPostOutPut, totalStats ,premium, free)

	try {
		//await xenNode.post(bumpOutPut, threadID)
		await xenNode.editPost(editPostOutPut, `${postID}/save#`)
		

	} catch (error: any) {
		console.log(error)
	}
}

//Loop throught every 4 hours and 10 min
const bumpInterval = 4 * 60 * 60 * 1000 + 10 * 60 * 1000

setInterval(async () => {
	await run()
}, bumpInterval)

//run()
  
function shuffleArray(array: any[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
}


function convertTime(t: number): string {
	let years,
		days,
		hours,
		minutes,
		seconds,
		total_days,
		total_hours,
		total_minutes,
		total_seconds: number
	let result: string = ""

	total_seconds = Math.floor(t / 1000)
	total_minutes = Math.floor(total_seconds / 60)
	total_hours = Math.floor(total_minutes / 60)
	total_days = Math.floor(total_hours / 24)

	years = Math.floor(total_days / 365)

	seconds = total_seconds % 60
	minutes = total_minutes % 60
	hours = total_hours % 24
	days = total_days % 365

	if (years > 0) result += years.toString() + "y "
	if (days > 0) result += days.toString() + "d "
	if (hours > 0) result += hours.toString() + "h "
	if (minutes > 15 && result !== "") result += minutes.toString() + "m"

	if ((days = 0 && seconds > 0)) result += " " + seconds.toString() + "s"
		
	return result
}

function formatRSNumber(n: number): string {
	let i: number = 0
	let f: number = n
	let arr: string[] = ["", "K", "M", "B", "T"]

	while (Math.abs(f) >= 1000) {
		i++
		f = f / 1000
	}

	return parseFloat(f.toFixed(2)).toString() + " " + arr[i]
}