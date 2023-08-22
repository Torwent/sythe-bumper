import "./lib/alias"
import env from "$lib/env"
import { createClient } from "@supabase/supabase-js"
import { Database } from "$lib/types/supabase"
import XenNode from "xen-node"
import { convertTime, formatRSNumber, generateRandomIndices } from "$lib/utils"
import { Script, TotalStats } from "$lib/types/collection"

//Init env Vars
const options = { auth: { autoRefreshToken: true, persistSession: false } }
export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, options)

const xenNode = new XenNode("https://www.sythe.org/", {
	verbose: console.log,
	username: env.SYTHE_USER,
	password: env.SYTHE_PASS
})

main()

async function main() {
	//Loop throught in..
	const bumpInterval = parseInt(env.BUMP_HOUR_INTERVAL) * 60 * 60 * 1000
	const editInterval = parseInt(env.EDIT_MINUTE_INTERVAL) * 60 * 1000
	const loginInterval = 24 * 60 * 60 * 1000 //24 h

	let data = await getData()
	await login()
	if (env.ENVIRONMENT === "development") {
		await editMainPost(env.SYTHE_POST, data.premiumItems, data.freeItems, data.totalStatData)
		await bumpThread(env.SYTHE_THREAD, data.premiumItems, data.freeItems)
	} else if (env.ENVIRONMENT === "production") {
		setInterval(async () => await login(), loginInterval)

		setInterval(async () => {
			data = (await getData()) ?? data
			await editMainPost(env.SYTHE_POST, data.premiumItems, data.freeItems, data.totalStatData)
		}, editInterval)

		setInterval(
			async () => await bumpThread(env.SYTHE_THREAD, data.premiumItems, data.freeItems),
			bumpInterval
		)
	}
}

//login and get cookies
async function login() {
	const cookies = (await xenNode.xenLogin(env.SYTHE_USER, env.SYTHE_PASS)) as string[]

	try {
		const isLogged = await xenNode.checkLogin(cookies)
		console.log(isLogged)
	} catch (error: any) {
		if (error.isAxiosError) console.error(error)
	}
}

async function getData() {
	const { data, error } = await supabase
		.schema("scripts")
		.from("scripts")
		.select(
			`id, url, title, description, content, categories, published,
		   protected!left (broken),
		   stats_simba!left (experience, gold, runtime, levels)`
		)
		.eq("published", "True")
		.eq("protected.broken", "False")
		.returns<Script[]>()

	if (error) {
		console.error(error)
		return
	}

	const { data: totalStatData, error: err } = await supabase
		.rpc("get_stats_total")
		.returns<TotalStats[]>()

	if (err) {
		console.error(err)
		return
	}

	//Lists of Items filterd by category
	const freeItems: Script[] = []
	const premiumItems: Script[] = []
	data.forEach((item) => {
		if (item.categories.includes("Free")) freeItems.push(item)
		else if (item.categories.includes("Premium")) premiumItems.push(item)
	})

	return { freeItems, premiumItems, totalStatData: totalStatData[0] }
}

async function editMainPost(
	postID: string,
	premiumItems: Script[],
	freeItems: Script[],
	totalStatData: TotalStats
) {
	let editPostOutPut: string = `[CENTER][b]I'm here to invite you guys to the[/b] [URL='https://waspscripts.com/']WaspScripts[/URL].\n\n
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

	let premium: string = "[SIZE=7][b]Premium:[/b][/SIZE]"
	let free: string = "[SIZE=7][b]Free:[/b][/SIZE]"

	let i: number = 0
	while (i < freeItems.length || i < premiumItems.length) {
		//all free scripts
		if (i < freeItems.length) {
			const url = freeItems[i].url
			const title = freeItems[i].title
			let description = freeItems[i].description.trim()
			if (!description.endsWith(".") && !description.endsWith("!")) description = description + "."

			//stats
			const experience = formatRSNumber(freeItems[i].stats_simba.experience)
			const gold = freeItems[i].stats_simba.gold
			const runtime = convertTime(freeItems[i].stats_simba.runtime)
			let stats: string = ""
			if (runtime != "")
				stats = `[INDENT][SIZE=3]- [B]experience[/B]: ${experience} , [B]gold[/B]: ${gold} , [B]runtime[/B]: ${runtime}[/SIZE][/INDENT]`

			free = `${free}\n\n - [URL='https://waspscripts.com/scripts/${url}']${title}[/URL] - ${description} ${stats}`
		}

		//all premium scripts
		if (i < premiumItems.length) {
			const url = premiumItems[i].url
			const title = premiumItems[i].title
			let description = premiumItems[i].description.trim()
			if (!description.endsWith(".") && !description.endsWith("!")) description = description + "."

			//stats
			const experience = formatRSNumber(premiumItems[i].stats_simba.experience)
			const gold = premiumItems[i].stats_simba.gold
			const runtime = convertTime(premiumItems[i].stats_simba.runtime)
			let stats: string = ""
			if (runtime !== "")
				stats = `[INDENT]- experience: ${experience} ,gold: ${gold} ,runtime: ${runtime} [/INDENT]`

			premium = `${premium}\n\n - [URL='https://waspscripts.com/scripts/${url}']${title}[/URL] - ${description} ${stats}`
		}

		i++
	}

	//totalStats
	const totalStats: string = `[CENTER][size=7]
	[color=#f97316]Total Experience Earned:[/color] ${formatRSNumber(totalStatData.experience)}
	[color=#f97316]Total Gold Earned:[/color] ${formatRSNumber(totalStatData.gold)}
	[color=#f97316]Total Levels Earned:[/color] ${totalStatData.levels}
	[color=#f97316]Total Runtime:[/color] ${convertTime(totalStatData.runtime)}
	[/size][/CENTER]`

	editPostOutPut = `${editPostOutPut} \n\n ${totalStats} \n\n ${premium} \n\n ${free}`

	if (env.ENVIRONMENT === "production") {
		try {
			await xenNode.editPost(editPostOutPut, `${postID}/save#`)
		} catch (error: any) {
			if (error.isAxiosError) console.error(error)
		}
	} else if (env.ENVIRONMENT == "development") {
		console.log(editPostOutPut)
	}
}

//Bump a thread
async function bumpThread(threadID: string, premiumItems: Script[], freeItems: Script[]) {
	const premiumIndices = generateRandomIndices(premiumItems.length, 3)
	const freeIndices = generateRandomIndices(freeItems.length, 3)

	let premium: string = "[b]Premium:[/b]"
	let free: string = "[b]Free:[/b]"

	for (let i = 0; i < 3; i++) {
		const freeIndex = freeIndices[i]
		const urlFree = freeItems[freeIndex].url
		const titleFree = freeItems[freeIndex].title
		let descriptionFree = freeItems[freeIndex].description.trim()
		if (!descriptionFree.endsWith(".") && !descriptionFree.endsWith("!")) descriptionFree += "."
		free = `${free} \n - [URL='https://waspscripts.com/scripts/${urlFree}']${titleFree}[/URL] - ${descriptionFree}`

		const premiumIndex = premiumIndices[i]
		const urlPremium = premiumItems[premiumIndex].url
		const titlePremium = premiumItems[premiumIndex].title
		let descriptionPremium = premiumItems[premiumIndex].description.trim()
		if (!descriptionPremium.endsWith(".") && !descriptionPremium.endsWith("!"))
			descriptionPremium += "."

		premium = `${premium} \n - [URL='https://waspscripts.com/scripts/${urlPremium}']${titlePremium}[/URL] - ${descriptionPremium}`
	}

	const bumpOutPut: string = `Bump, check out [URL='https://waspscripts.com/']WaspScripts[/URL]. \n\nCheck out some of the scripts we have to offer: \n\n ${premium} \n\n ${free}`

	if (env.ENVIRONMENT == "production") {
		try {
			await xenNode.post(bumpOutPut, threadID)
		} catch (error: any) {
			if (error.isAxiosError) console.error(error)
		}
	} else if (env.ENVIRONMENT == "development") {
		console.log(bumpOutPut)
	}
}
