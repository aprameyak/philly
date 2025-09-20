import os
import json
from dotenv import load_dotenv
from mistralai import Mistral
from cerebras.cloud.sdk import Cerebras
from utils import danger_scores

# Load environment variables
load_dotenv()

# client = Mistral(api_key=api_key)
client = Cerebras(
  api_key=os.environ.get("CEREBRAS"),
)


# Model selection
model = "llama-4-scout-17b-16e-instruct" #"open-mistral-7b"
suffix = ""  # Leave empty if not rendering in HTML

# Prompt template as a lambda
prompt = lambda events, lat, long, time: f"""
You are a safety analyst. 

Task:
- Evaluate the safety of the location at latitude {lat} and longitude {long} at {time}.
- Provide a **danger score** from 1 (very safe) to 5 (very dangerous).
- List **key reasons** for this score based on nearby events.
- Consider the **recency** of the crimes commited in the past

Nearby Events (2025, within 100 meters):
{events} 

Output Format (JSON):
{{
    "danger_score": <integer 1-5>,
    "reasons": [
        "<reason 1>",
        "<reason 2>",
        "...",
    ],
}}
Respond ONLY in this JSON format. Do not include explanations outside the JSON.
""" + suffix

def generate(events, lat, long, time):
    """
    Generates a danger score and reasons based on nearby events.
    Returns JSON as string.
    """
    try:
        response = client.chat.completions.create( #.complete
            model=model,
            messages=[{"role": "user", "content": prompt(events, lat, long, time)}],
            temperature=0,
            # suffix=suffix,  # Mistral chat API doesn't need separate suffix if included in prompt
            # min_tokens=1,  # Uncomment to enforce minimum tokens
        )
        content = response.choices[0].message.content
        if content.startswith("```"):
           content = content.strip("`").strip()
        content = content.replace("json", "") #Startswith
        content = json.loads(content)
        content['events'] = events

        return content

    except Exception as e:
        raise e



#------------------------------------------------------------------------------------------------------------------------
#------------------------------------------------------------------------------------------------------------------------
#------------------------------------------------------------------------------------------------------------------------




#danger score prompt
danger_score_prompt = lambda event, description : f"""
You are a safety analyst. 

Task:
- Evaluate the safety of the event at {event} given {description}

Examples of danger classification: 
 {danger_scores}

Output Format (JSON):
{{
    "danger_score": <integer 1-5>
}}
Respond ONLY in this JSON format. Do not include explanations outside the JSON.
""" + suffix


def score_single(event, description):
    """
    Generates a danger score and reasons based on nearby events.
    Returns JSON as string.
    """
    try:
        response = client.chat.completions.create( #.complete
            model=model,
            messages=[{"role": "user", "content": danger_score_prompt(event, description)}],
            temperature=0,
            # suffix=suffix,  # Mistral chat API doesn't need separate suffix if included in prompt
            # min_tokens=1,  # Uncomment to enforce minimum tokens
        )
        content = response.choices[0].message.content
        if content.startswith("```"):
           content = content.strip("`").strip()
        content = content.replace("json", "") #Startswith
        content = json.loads(content)

        return content

    except Exception as e:
        raise e