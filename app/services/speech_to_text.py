
import whisper


class Recognizer():
    def __init__(self):
      
        self.model = whisper.load_model ("medium", device="cpu") 
    def recognize(self,name:str):
        """
        Given an audio filename, it translate it to text
        
        Params:
        name: Str: Audio file name

        return;
        str: Transcripted audio

        """
        result = self.model.transcribe(f"./audio/{name}.webm")
       
        return result["text"]
    

