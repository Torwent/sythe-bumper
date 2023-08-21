export function generateRandomIndices(maxIndex: number, count: number): number[] {
	const indices: number[] = []
	while (indices.length < count) {
		const randomIndex = Math.floor(Math.random() * maxIndex)
		if (!indices.includes(randomIndex)) {
			indices.push(randomIndex)
		}
	}
	return indices
}

export function convertTime(t: number): string {
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

export function formatRSNumber(n: number): string {
	let i: number = 0
	let f: number = n
	let arr: string[] = ["", "K", "M", "B", "T"]

	while (Math.abs(f) >= 1000) {
		i++
		f = f / 1000
	}

	return parseFloat(f.toFixed(2)).toString() + " " + arr[i]
}
