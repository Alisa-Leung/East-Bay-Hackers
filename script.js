document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("audioUpload");
    const audioPlayer = document.getElementById("audioPlayer");
    fileInput.addEventListener("change", (event) => {
        uploadAndDisplayAudio(fileInput, audioPlayer);
    })
})

function uploadAndDisplayAudio(fileInput, audioPlayer){
    const file = fileInput.files[0];
    if (file){
        const objectURL = URL.createObjectURL(file);
        audioPlayer.src = objectURL;
        audioPlayer.load();
    }
}