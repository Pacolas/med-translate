import sounddevice as sd


from scipy.io.wavfile import write

class Microphone:
    def __init__(self, duration=5, rate=44100):
        self.duration = duration
        self.rate = rate

    def grabar(self, output="./audio/output.wav"):
        print("Recording...")
        audio = sd.rec(int(self.duration * self.rate), samplerate=self.rate, channels=1, dtype="int16")
        sd.wait()
        write(output, self.rate, audio)
        print(f"Done {output}")

   
