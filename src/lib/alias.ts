import "module-alias/register"
import { addAliases } from "module-alias"
console.log("HERE")
addAliases({
	$lib: __dirname
})
