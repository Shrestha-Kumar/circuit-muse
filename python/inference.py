# Verilog AI — Standalone Colab Inference Script
# Run this on Google Colab with T4 GPU
# Weights required: /content/drive/MyDrive/qwen_verilog_stage4_final

from google.colab import drive
drive.mount('/content/drive')

import os, gc, torch
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

!pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
!pip install --no-deps xformers trl peft accelerate bitsandbytes datasets

import torch
from unsloth import FastVisionModel
from transformers import TextStreamer

torch.cuda.empty_cache()

model, tokenizer = FastVisionModel.from_pretrained(
    model_name = "/content/drive/MyDrive/qwen_verilog_stage4_final",
    load_in_4bit = True,
    max_seq_length = 2048,
)
FastVisionModel.for_inference(model)
print("✅ Model loaded and ready")

def generate_verilog(instruction, max_tokens=1024):
    messages = [
        {"role": "system", "content": "You are an expert Verilog and RTL design engineer."},
        {"role": "user",   "content": instruction}
    ]
    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer(text=[text], return_tensors="pt").to("cuda")
    streamer = TextStreamer(tokenizer, skip_prompt=True)
    print(f"\n{'='*50}\nPROMPT: {instruction}\n{'='*50}")
    _ = model.generate(
        **inputs, streamer=streamer,
        max_new_tokens=max_tokens,
        temperature=0.1, do_sample=True, use_cache=True
    )

# Interactive loop
while True:
    text = input('\nEnter instruction (or "quit" to exit): ')
    if text.lower() == 'quit':
        break
    generate_verilog(text)
