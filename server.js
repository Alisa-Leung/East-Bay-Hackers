import http from "http";
import { GetBody, ServeFile } from "./fileServer";

const PORT = 5000;

const Server = http.createServer((req, res) => {
    const Body = GetBody(req);
    ServeFile(req, res);
});

Server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}!`);
});