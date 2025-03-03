
get_languages()
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

navigator.mediaDevices.getUserMedia({ audio: true })


let snd_button = document.getElementById("send")
const picker = document.getElementById("dataPicker");


const playback = document.querySelector(".playback")
const playback_t = document.querySelector(".playback_t")


start.addEventListener("click", ToggleMic);



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
        const audioURL = window.URL.createObjectURL(blob)
        id_audio = audioURL.split("/")[3]
        console.log(id_audio)
    if (picker.value.trim()!==""){
              snd_button.className = "availiable"
        }
        playback.src = audioURL


    }
    can_record = true
}
function ToggleMic() {
    if (!can_record) return;
    is_recording = !is_recording
    if (is_recording) {
        recorder.start()
        start.classList.add("is-recording")
         start.textContent ="Stop"
       
    } else {
        recorder.stop()
        start.classList.remove("is-recording")
         start.textContent ="Record Again"


    }

}

async function uploadAudio(audioBlob) {
    const formData = new FormData();
    formData.append("file", audioBlob, id_audio + ".webm");

    try {
        const response = await fetch("http://localhost:8000/upload-audio", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log("Servidor respondió:", result);
    } catch (error) {
        console.error("Error al enviar el audio:", error);
    }
}
setupAudio()


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




picker.addEventListener("change", () => {

    if (picker.value.trim() === "" | !id_audio ) {
        snd_button.className = "not_availiable"
    }
    else {
        snd_button.className = "availiable"
    }
});

snd_button.addEventListener("click", async () => {
    snd_button.style.visibility = "hidden"
    if (picker.value.trim() && id_audio !== null) {  
        await uploadAudio(blob_u, picker.value);

        const text = await fetch("http://localhost:8000/translate/"+ id_audio +"/"+picker.value,
            {method: "POST" }

        )
  
        let result = await text.json()
        translate_content = result
    
        text1 = result.splited_raw_text
        text2 = result.translated_text
        console.log(text1)
        console.log(text2)
        to_language =result.detected_language

        document.getElementById("source").textContent = to_language
        document.getElementById("final").textContent = picker.value
        
       
        addText()
        addHover()

        let url =  "http://localhost:8000/translated/"+ id_audio +".mp3"

        wait(url).then(url => {
            get_audio(url)
        });
     
    }
    else{
        console.log("There is no Audio to translate, or the language was not selected")
    }
    snd_button.style.visibility = "visible"
});

async function wait(url) {
    while (true) {
        try {
            const response = await fetch(url, { method: "GET" });

            if (response.ok) {
                console.log("Success:", url);
                return url;  
            }
        } catch (error) {
            console.error("Trying again..", error);
        }

        console.log("Fetching");
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}
async function get_audio(url){
    playback_t.style.visibility =  "visible" 
    playback_t.src = url
    snd_button.className = "not_availiable"
}


function addText(){
    const input = document.getElementById("text_input");
    const output = document.getElementById("text_output");
    input.innerHTML =""
    output.innerHTML =""

    let lt1= text1.split("<ds>")
    let lt2= text2.split("<ds>")

    for (let i = 0; i< lt1.length;i++){

        const div = document.createElement("div");
        const div2 = document.createElement("div");

        div.classList.add("s"+i.toString(), "p"); 
        div.textContent = lt1[i]; 
        div2.classList.add("s"+i.toString(), "p"); 
        div2.textContent = lt2[i]; 
        input.appendChild(div); 
        output.appendChild(div2); 

    }
}

function addHover(){
    const elements = document.querySelectorAll(".p");
    for (let i = 0 ; i< elements.length;i++){
        let selector = elements[i].classList[0]

        const appliers = document.querySelectorAll("."+selector.toString());
        appliers.forEach(el => {

            el.addEventListener("mouseenter", ()=> {
                const appliers = document.querySelectorAll("."+selector.toString());
                appliers.forEach(el => {el.style.backgroundColor = "rgb(142, 215, 125)";el.style.color = "rgb(26, 64, 34)"});
            });
            el.addEventListener("mouseleave", ()=>{
                const appliers = document.querySelectorAll("."+selector.toString());
                appliers.forEach(el => {el.style.backgroundColor = "";el.style.color = "black"});
            }
            );
        });

    }
}
addHover()