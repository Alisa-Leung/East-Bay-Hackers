import fs from "fs";
import url from "url";
import mimetypes from "mime-types";

async function GetBody(req) {
    return new Promise((res, rej) => {
        let Body = "";
        req.on("data", (chunk) => {
            Body += chunk
        })
        req.on("end", () => {
            try {
                res(JSON.parse(Body));
            } catch(err) {
                console.log(err);
            }
        });
        req.on("error", rej);
    });
}

function ServeFile(req, res) {
    const URL = url.parse(req.url, true);
    let FileName = URL.path.replace(/^\/+|\/+$/g, "");

    if (FileName === "") {
        // Default to index.html
        FileName = "index.html";
    }

    console.log(FileName);

    fs.readFile(FileName, (err, FileData) => {
        if (err) {
            res.writeHead(404, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                message: `There was an issue reading file "${FileName}`
            }));
            return;
        }
        res.setHeader("X-Content-Type-Options", "nosniff");
        
        const FileMime = mimetypes.lookup(FileName);
        res.writeHead(200, {"Content-Type": FileMime});
        res.end(FileData);
    })
}

export { GetBody, ServeFile };