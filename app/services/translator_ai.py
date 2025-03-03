
from google import generativeai
import json
import ast
import os 
class  GeminiAI():
    def __init__(self):
        generativeai.configure(
            api_key=os.getenv("API-KEY"),
        )
        
        model_name = "gemini-2.0-pro-exp-02-05"
        
        generate_content_config = {
            "temperature":1,
            "top_p":0.95,
            "top_k":64,
            "max_output_tokens":8192,
            "response_mime_type":"text/plain",
        }
        model = generativeai.GenerativeModel(model_name=model_name, 
                                            generation_config=generate_content_config
                                            )
        convo = model.start_chat(history=[    ])
     
        self.model =  convo
        self.model_name = model_name

    def load_config(self, config_path="./config/config.json"):
        """
        Loads or updtes the config (Model, languages supported).

        Params:
        config_path: name of the config file.

        return:
        Str. The updated config file if it is not valid.

        """
        try:
            with open(config_path, "r") as f:
                config = json.load(f)
            
            self.model_name = config.get("model", self.model_name)
            lt_lang= lambda: config.get("languages", [])
            self.languages = ast.literal_eval(lt_lang())
     
                
     
            if len(self.languages) == 0:
                self.languages = self.load_languages()
                config = { 
                    "model": self.model_name,
                    "languages": self.load_languages() 
                  }
                with open("./config/config.json", "w") as f:
                    json.dump(config, f, indent=4)
                
        
            return config
        except FileNotFoundError:
            print("Config file not found, returning default settings.")
            return {"model": self.model_name, "languages": self.languages()}

    def load_languages(self):
        """

        Asks Gemini its supported languages for the task.

        Return: List: Languages supported by the model.
        
        """

        with open("./prompts/get_languages.txt", "r", encoding="utf-8") as file:
            prompt = file.read()
        self.model.send_message(prompt)
        text = self.model.last.text
        languages = text[text.find("["):text.find("]")+1]
       
        self.languages =ast. literal_eval(languages)
        return languages
    def get_languages(self):
        """
        Returns:
        Languages: List: A list of the supported languages"""
        return self.languages
    
    def load_prompt(self, language, text):
        """
        Loads the prompt that will be used to translate the text
        Params:
        Language: Specify the language to translate the text
        Text: The text to translate
        returns 
        string: The prompt with the needed specifications for the task."""
        with open("./prompts/translate.txt", "r", encoding="utf-8") as file:
            prompt = file.read()
        response = prompt.replace("SPECIFIC_LANGUAGE",language)
        response = response.replace("INPUT_TEXT",text)
        
        return response
    
    def translate(self, language, text)->dict:
        """

        Translate a text to a specific language using Gemini and the prompt.

        Params: 
        language: The specific language the text will be translated to
        text: The source text to be translated
        
        Return
        A JSON with the following field
        detected_language: Source language detected
        translated_text: Translated text to the Language specified
        splited_raw_text: The source text corrected.

        """
        prompt = self.load_prompt(language, text)
        self.model.send_message(prompt)

        translate = self.model.last.text
        response = translate[translate.find("{"):translate.find("}")+1]
        try: 
            response = json.loads(response)
        except:
            response =  translate[translate.find("{"):translate.find("}")+1]
        return response
    
    
def test():

    client = GeminiAI()
    client.load_config()
    
    translate = client.translate("German", "Hola, soy Aleman. Me gustaria que me des algo, y  mi mama le gusta la carne")
    response = translate[translate.find("{"):translate.find("}")+1]
    print(translate)
    print(response)

