import fs from "fs";
import url from "url";
import mimetypes from "mime-types";

const API_KEY = process.env.API_KEY;

async function GetBody(req) {
    return new Promise((res, rej) => {
        let Body = "";
        req.on("data", (chunk) => {
            Body += chunk;
        });
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

async function ServeFile(req, res) {
    const URL = url.parse(req.url, true);
    let FileName = URL.path.replace(/^\/+|\/+$/g, "");

    if (FileName === "") {
        // Default to index.html
        FileName = "index.html";
    }

    const ClonedFilePath = "dynamic.html";
    console.log(FileName);

    if (FileName === "index.html") {
        try {
            new Promise((res, req) => {
                return fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents:[{
                            parts: [
                                {
                                    text: `Analyze this audio file and identify the musical pitches present in order throughout the file. Separate the notes into bars as if you would using sheet music. Additionally, include the length of each note.`
                                },
                                {}
                            ]
                        }]
                    })
                }
            );
        })
        .then((result) => {
            fs.copyFileSync(FileName, ClonedFilePath)
            const DynamicData = fs.readFileSync(ClonedFilePath, "utf-8");

            if (!DynamicData) {
                res.setHeader({"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: "There was a problem creating the dynamic HTML file!"
                }));
                return;
            }

            console.log("Result");
            console.log(JSON.parse(result));
            const Result = DynamicData.replace(/\<\/body>/g, JSON.parse(result) + "</body>");
            fs.writeFileSync(ClonedFilePath, Result, "utf-8");
            console.log("Successfully created the dynamic HTML file!");
        });
    } catch(err) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({
            message: err
        }));
        return;
    }
    }

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

        if (fs.existsSync(ClonedFilePath)) {
            fs.unlinkSync(ClonedFilePath);
        }
    })
}

export { GetBody, ServeFile };