import http from "http";
import { GetBody, ServeFile } from "./fileServer.js";

const PORT = 5000;

const Server = http.createServer(async (req, res) => {
    GetBody(req);
    ServeFile(req, res);
});

Server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}!`);
});