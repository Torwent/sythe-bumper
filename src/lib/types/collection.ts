import type { Database } from "$lib/types/supabase"

export type ScriptTables<T extends keyof Database["scripts"]["Tables"]> =
	Database["scripts"]["Tables"][T]["Row"]

interface ScriptBase extends ScriptTables<"scripts"> {}
interface ScriptProtected extends ScriptTables<"protected"> {}
interface StatsSimba extends ScriptTables<"stats_simba"> {}

export interface Script extends ScriptBase {
	protected: ScriptProtected
	stats_simba: StatsSimba
}

export interface TotalStats {
	experience: number
	gold: number
	levels: number
	runtime: number
}
