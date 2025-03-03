from services.speech_to_text import Recognizer
from services.translator_ai import GeminiAI
from gtts import gTTS
def translate_speech(name:str, to:str, rec: Recognizer) ->dict:
    """
    Function to process the speech and translate it to a given language.
    Params:
    name: Audio file name
    To: Language to translate the audio

    Return:
    Dict in JSON shape.
    Contains:
    detected_language: The detected source language
    translated_text: The translated text
    splited_raw_text: Source text corrected

    """

    text = rec.recognize(name)
 
    languages = {
        "English":"en",
        "Spanish": "es",
        "French": "fr",
        "German": "de",
        "Chinese": "zh",
        "Japanese": "ja",
        "Portuguese": "pt",
        "Russian": "ru",
        "Arabic": "ar",
        "Italian": "it",
        "Korean": "ko"
    }
    result = GeminiAI().translate(language=to,text=text)

    try: 
        text_ = result['translated_text'] 
    except:
        text_ = result.translated_text 
    tts = gTTS(text=text_.replace("<ds>",""), lang=languages[to])  
    tts.save(f"./processed/{name}.mp3")
    return result
