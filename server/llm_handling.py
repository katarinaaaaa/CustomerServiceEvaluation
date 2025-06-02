import os
import logging
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

class ModelHandler():
    def __init__(self):
        self.client = OpenAI(base_url=os.getenv("MODEL_PORT"), api_key="lm-studio")
        self.system_prompt = "Ты следишь за качеством работы операторов клиентской службы."
        self.temp = 0.8

    def get_answer(self, prompt):
        try:
            completion = self.client.chat.completions.create(
                model="vikhr-customer-service-evaluation",
                messages=[
                    {"role": "system", "content": self.system_prompt },
                    {"role": "user", "content": prompt },
                ],
                temperature=self.temp,
            )
            answer = completion.choices[0].message.content.strip()
        except:
            return None
        return answer
