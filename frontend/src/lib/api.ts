// src/lib/api.ts
import { API_URL } from "../config";

export async function generateVerilog(
  instruction: string,
  temperature = 0.1,
  maxTokens = 512
): Promise<string> {
  const res = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instruction,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (data.status === "error") throw new Error(data.error);
  return data.output;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
