// GET LANGUAGES

get_languages()
async function get_languages() {
    const languages = await fetch("http://localhost:8000/languages", {
        method: "GET"
    })
    const result = await languages.json()

    const picker = document.getElementById("dataPicker");


    result.languages.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        picker.appendChild(option);
    });

}

let blob_u = null
let id_audio = null
let translate_content = null
let to_language = null
let can_record = false
let is_recording = false
let recorder = null
let chunks = []
let text1 = "Hola, soy Nicolas.<ds> Como estas?"
let text2 = "HI, I'm Nicolas.<ds> How Are you?"
let audioURL = ""
let actual = "";
let id_cont = 0


navigator.mediaDevices.getUserMedia({ audio: true })

// TRANSLATION CONFIG

const src_picker = document.getElementById("language-picker");
const picker = document.getElementById("dataPicker");
let snd_button = document.getElementById("send")



const playback = document.querySelector(".playback")
const playback_t = document.querySelector(".playback_t")


start.addEventListener("click", ToggleMic);


const recognition = new webkitSpeechRecognition()
recognition.lang = 'es-ES'
recognition.continuous = true
recognition.onresult = event => {
    for (const result of event.results) {
        actual = (result[0].transcript)
    }
}

// AUDIO RECORDING SETUP  

function setupAudio() {
    console.log("setup")
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(setupStream)
            .catch(err => { console.error(err) })
    }
}

function setupStream(stream) {
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        chunks.push(e.data)
    }
    recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm; codecs=opus" })
        chunks = []
        blob_u = blob
        audioURL = window.URL.createObjectURL(blob)
        id_audio = audioURL.split("/")[3]
        console.log(id_audio)
        if (picker.value.trim() !== "") {
            snd_button.className = "availiable"
        }
        playback.src = audioURL


    }
    can_record = true
}

// MIC BUTTON CONFIG 

function ToggleMic() {
    if (!can_record) return;
    is_recording = !is_recording
    if (is_recording) {
        recorder.start()
        recognition.start()
        start.classList.add("is-recording")
        start.textContent = "Stop"

    } else {
        recorder.stop()
        recognition.stop()
        start.classList.remove("is-recording")
        start.textContent = "Record Again"


    }

}

setupAudio()


// pickers config 


src_picker.addEventListener("change", () => {
    recognition.lang = src_picker.value
    if (src_picker.value.trim() === "" | !id_audio) {
        snd_button.className = "not_availiable"
    }
    else {
        snd_button.className = "availiable"
    }
});


picker.addEventListener("change", () => {

    if (picker.value.trim() === "" | !id_audio | src_picker.value.trim()) {
        snd_button.className = "not_availiable"
    }
    else {
        snd_button.className = "availiable"
    }
});


// API CONNECTION BUTTON 


snd_button.addEventListener("click", async () => {
    snd_button.style.visibility = "hidden"
    if (picker.value.trim() && id_audio !== null && src_picker.value.trim()) {

        const div = document.createElement("audio");
        div.src = audioURL
        div.controls = true;
        div.classList.add("temp_audio")

        const div2 = document.createElement("audio");

        div2.controls = true;
        div2.classList.add("temp_audio")

        const input = document.getElementById("display");
        const output = document.getElementById("display");



        const text = await fetch("http://localhost:8000/translate/" + id_audio + "/" + picker.value,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: actual
                })
            }

        )

        let result = await text.json()
        translate_content = result
    

        text1 = result.splitted_raw_text.replace("<ds> ", "<ds>").replace("<ds><ds>", "<ds>")
        text2 = result.translated_text.replace("<ds> ", "<ds>").replace("<ds><ds>", "<ds>")
        to_language = result.detected_language

        document.getElementById("source").textContent = to_language
        document.getElementById("final").textContent = picker.value


        addText()
        input.append(div)
        console.log(text2)
        console.log(text1)
        addHover()

        let url = "http://localhost:8000/translated/" + id_audio + ".mp3"

        wait(url).then(url => {
            if (url !== null) {
                div2.src = url
                output.append(div2)
                playback.src = ""
                id_audio = null
                snd_button.className = "not-availiable"
            }
        });

    }
    else {
        console.log("There is no Audio to translate, or the language was not selected")
    }
    snd_button.style.visibility = "visible"
});

// AUDIOFILE REQUEST 

async function wait(url) {
    while (true) {
        try {
            const response = await fetch(url, { method: "GET" });

            if (response.ok) {
                console.log("Success:", url);
                return url;
            }
            if (response.status === 500) {
                return null
            }
        } catch (error) {
            console.error("Trying again..", error);
        }

        console.log("Fetching");
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// ADD TEXT TO DISPLAY

function addText() {
    const input = document.getElementById("display");
    const output = document.getElementById("display");

    const div_container = document.createElement("div");
    div_container.className = "display_text"
    const div_container2 = document.createElement("div");
    div_container2.className = "display_text"



    let lt1 = text1.split("<ds>")
    let lt2 = text2.split("<ds>")
    let size = 0
    if (lt1.length > lt2.length) {
        size = lt2.length
    } else {
        size = lt1.length
    }

    for (let i = 0; i < size; i++) {

        const div = document.createElement("div");
        const div2 = document.createElement("div");

        div.classList.add("s" + id_cont.toString(), "p");
        div.textContent = lt1[i];
        div2.classList.add("s" + id_cont.toString(), "p");
        div2.textContent = lt2[i];
        div_container.appendChild(div);
        div_container2.appendChild(div2);

        input.appendChild(div_container)
        input.appendChild(div_container2)
        id_cont++
    }
}

// ADD HOVER FOR TRANSLATION IDENTIFICATION

function addHover() {
    const elements = document.querySelectorAll(".p");
    for (let i = 0; i < elements.length; i++) {
        let selector = elements[i].classList[0]

        const appliers = document.querySelectorAll("." + selector.toString());
        appliers.forEach(el => {

            el.addEventListener("mouseenter", () => {
                const appliers = document.querySelectorAll("." + selector.toString());
                appliers.forEach(el => { el.style.backgroundColor = "rgb(215, 125, 206)"; el.style.color = "rgb(255, 255, 255)" });
            });
            el.addEventListener("mouseleave", () => {
                const appliers = document.querySelectorAll("." + selector.toString());
                appliers.forEach(el => { el.style.backgroundColor = ""; el.style.color = "rgb(0, 0, 0)" });
            }
            );
        });

    }
}

const displayDiv = document.querySelector(".display");

displayDiv.addEventListener("scroll", () => {

    if (displayDiv.scrollTop + displayDiv.clientHeight >= displayDiv.scrollHeight - 10) {
        displayDiv.style.maskImage = "none";
        displayDiv.style.webkitMaskImage = "none";
    } else {

        displayDiv.style.maskImage = "linear-gradient(to bottom, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0) 100%)";
        displayDiv.style.webkitMaskImage = "linear-gradient(to bottom, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0) 100%)";
    }
});