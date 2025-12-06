document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("audioUpload");
    const audioPlayer = document.getElementById("audioPlayer");
    const analyzeButton = document.getElementById("analyzeButton");

    fileInput.addEventListener("change", (event) => {
        uploadAndDisplayAudio(fileInput, audioPlayer);
    });
    
    analyzeButton.addEventListener("click", () => {
        console.log(data);
    });
    
    async function uploadAndDisplayAudio(fileInput, audioPlayer) {
        const file = fileInput.files[0];
        if (file) {
            const objectURL = URL.createObjectURL(file);
            audioPlayer.src = objectURL;
            audioPlayer.load();
            fileType = file.type;
        }
    }
});


const API_KEY = process.env.API_KEY;
const reader = new FileReader();
let data;

reader.onload = async function(e){
    const base64Data = e.target
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
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
                        {
                            inline_data: {
                                mime_type: fileType,
                                data: base64Data
                            }
                        }
                    ]
                }]
            })
        }
    )
    data = response.json();
}