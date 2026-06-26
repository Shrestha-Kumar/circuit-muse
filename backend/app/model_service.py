"""
Keeps the model loading + inference logic completely separate from the
API layer. The router calls model_service.generate(...) and doesn't
need to know anything about Unsloth, tokenizers, or CUDA.
"""

import torch

from .config import settings


class ModelService:
    def __init__(self) -> None:
        self.model = None
        self.tokenizer = None

    def load(self) -> None:
        """Loads model weights once. Call this at app startup, not per-request."""
        from unsloth import FastVisionModel

        self.model, self.tokenizer = FastVisionModel.from_pretrained(
            model_name=settings.model_path,
            load_in_4bit=True,
            max_seq_length=settings.max_seq_length,
        )
        FastVisionModel.for_inference(self.model)
        print("✅ Model loaded")

    def generate(self, instruction: str, temperature: float = 0.1, max_tokens: int = 512) -> str:
        if self.model is None or self.tokenizer is None:
            raise RuntimeError("Model is not loaded yet — call model_service.load() at startup.")

        messages = [
            {"role": "system", "content": "You are an expert Verilog and RTL design engineer."},
            {"role": "user", "content": instruction},
        ]
        text = self.tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        inputs = self.tokenizer(text=[text], return_tensors="pt").to("cuda")

        with torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=temperature > 0,
                use_cache=True,
            )

        generated = output_ids[0][inputs["input_ids"].shape[1]:]
        return self.tokenizer.decode(generated, skip_special_tokens=True)


# Single shared instance — imported by both main.py (to call .load()) and
# the router (to call .generate()).
model_service = ModelService()
