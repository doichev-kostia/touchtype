import HomePage from "./static/index.html";

let port = 3000;
let host = "0.0.0.0";
Bun.serve({
	port,
	hostname: host,
	routes: {
		"/*": HomePage
	},
})

console.log(`[INFO] main.server_listening addr=http://${host}:${port};`);
