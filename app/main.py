from fastapi import FastAPI, UploadFile, File, HTTPException
from services.translator_ai import GeminiAI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from services.speech_to_text import Recognizer
import shutil
from pydantic import BaseModel
from fastapi.responses import FileResponse
from services.translation_service import translate_speech
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Iniciando la aplicación...")
    yield  
    print("Cerrando la aplicación...")

app = FastAPI(lifespan=lifespan)
   
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O especifica los dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos HTTP (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)
UPLOAD_DIR = "audio"
AUDIO_DIR = "processed"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class TranslationRequest(BaseModel):
    text: str

@app.post("/translate/{name}/{to}")
def translate( name:str,to:str, request: TranslationRequest):

    return translate_speech(name, to, request.text )

@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"message": "Audio subido con éxito", "filename": file.filename}
    

@app.get("/languages")
async def get_languages():
    gen = GeminiAI()
    gen.load_config()
    return {"languages":gen.get_languages()}

    
@app.get("/translated/{filename}")
async def get_audio(filename: str):
    """
    """
    file_path = os.path.join(AUDIO_DIR, f"{filename}")
    
  
    if not os.path.isfile(file_path) or  ".mp3" not in filename:
        raise HTTPException(status_code=404, detail= "Archivo no encontrado")
    

    return FileResponse(file_path, media_type="audio/mpeg", filename=filename)