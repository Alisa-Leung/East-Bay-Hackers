document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("audioUpload");
    const audioPlayer = document.getElementById("audioPlayer");
    const analyzeButton = document.getElementById("analyzeButton");
    const resultsDiv = document.getElementById("results")
    
    let audioContext;
    let audioBuffer;
    
    fileInput.addEventListener("change", (event) => {
        uploadAndDisplayAudio(fileInput, audioPlayer);
    });
    analyzeButton.addEventListener("click", () => {
        if (audioBuffer) {
            analyzePitches(audioBuffer, resultsDiv);
        } else {
            resultsDiv.textContent = "Please upload an audio file first!";
        }
    });
    
    async function uploadAndDisplayAudio(fileInput, audioPlayer) {
        const file = fileInput.files[0];
        if (file) {
            const objectURL = URL.createObjectURL(file);
            audioPlayer.src = objectURL;
            audioPlayer.load();
            
            // Load audio for analysis
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            resultsDiv.textContent = "Audio loaded! Click 'Analyze Pitches' to detect notes.";
        }
    }
    
    function analyzePitches(buffer, resultsDiv) {
        const channelData = buffer.getChannelData(0); // Get first channel
        const sampleRate = buffer.sampleRate;
        
        // Analyze audio in chunks
        const chunkDuration = 0.1; // 100ms chunks
        const chunkSize = Math.floor(sampleRate * chunkDuration);
        const numChunks = Math.floor(channelData.length / chunkSize);
        
        const detectedNotes = [];
        
        for (let i = 0; i < numChunks; i++) {
            const start = i * chunkSize;
            const end = start + chunkSize;
            const chunk = channelData.slice(start, end);
            
            const frequency = detectPitch(chunk, sampleRate);
            if (frequency > 0) {
                const note = frequencyToNote(frequency);
                const time = (start / sampleRate).toFixed(2);
                detectedNotes.push({ time, frequency: frequency.toFixed(2), note });
            }
        }
    }
    
    function detectPitch(audioData, sampleRate) {
        // Autocorrelation method for pitch detection
        const minFreq = 80; // ~E2
        const maxFreq = 1200; // ~D6
        const minPeriod = Math.floor(sampleRate / maxFreq);
        const maxPeriod = Math.floor(sampleRate / minFreq);
        
        let bestCorrelation = 0;
        let bestPeriod = 0;
        
        for (let period = minPeriod; period < maxPeriod; period++) {
            let correlation = 0;
            for (let i = 0; i < audioData.length - period; i++) {
                correlation += audioData[i] * audioData[i + period];
            }
            
            if (correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestPeriod = period;
            }
        }
        
        // Return frequency if correlation is strong enough
        if (bestCorrelation > 0.01 && bestPeriod > 0) {
            return sampleRate / bestPeriod;
        }
        return 0;
    }
    
    function frequencyToNote(frequency) {
        const A4 = 440;
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Calculate semitones from A4
        const semitones = 12 * Math.log2(frequency / A4);
        const noteNumber = Math.round(semitones) + 69; // MIDI note number (A4 = 69)
        
        const octave = Math.floor(noteNumber / 12) - 1;
        const noteName = noteNames[noteNumber % 12];
        
        return `${noteName}${octave}`;
    }
    /*
        for (let i = 1; i < notes.length; i++) {
            if (notes[i].note !== currentNote) {
                html += `<div class='note-item'>
                    <span class='time'>${startTime}s - ${notes[i-1].time}s</span>
                    <span class='note'>${currentNote}</span>
                    <span class='freq'>${notes[i-1].frequency} Hz</span>
                </div>`;
                currentNote = notes[i].note;
                startTime = notes[i].time;
            }
        }
        
        // Add last note
        const lastNote = notes[notes.length - 1];
        html += `<div class='note-item'>
            <span class='time'>${startTime}s - ${lastNote.time}s</span>
            <span class='note'>${currentNote}</span>
            <span class='freq'>${lastNote.frequency} Hz</span>
        </div>`;
        
        html += "</div>";
        resultsDiv.innerHTML = html;
    }
    */
});