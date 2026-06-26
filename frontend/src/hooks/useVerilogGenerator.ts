import { useState, useCallback } from "react";
import { pickMockExample } from "@/lib/mockData";

interface GenerateState {
  designCode: string;
  testbenchCode: string;
  isGenerating: boolean;
  statusMessage: string;
  error: string | null;
  isDemoMode: boolean;
}

export function useVerilogGenerator() {
  const [state, setState] = useState<GenerateState>({
    designCode: "",
    testbenchCode: "",
    isGenerating: false,
    statusMessage: "",
    error: null,
    isDemoMode: false,
  });

  const generate = useCallback(async (instruction: string) => {
    if (!instruction.trim()) return;

    console.log("Starting generation for:", instruction);

    setState((s) => ({
      ...s,
      isGenerating: true,
      designCode: "",
      testbenchCode: "",
      error: null,
      statusMessage: "Initializing...",
    }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const apiUrl =
        import.meta.env.VITE_API_BASE_URL ||
        "https://PASTE-YOUR-URL-HERE.trycloudflare.com";

      console.log(`Sending request to ${apiUrl}/generate...`);

      const res = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Backend Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Backend Response received:", data);

      const rawOutput =
        data.output ||
        data.code ||
        data.response ||
        data.generated_text ||
        "";

      if (!rawOutput) {
        throw new Error("Backend replied, but output was empty.");
      }

      // Clean special tokens from model output
      const cleanOutput = rawOutput
        .replace(/<\|endoftext\|>/g, "")
        .replace(/<\|im_end\|>/g, "")
        .replace(/```verilog/g, "")
        .replace(/```/g, "")
        .trim();

      // ✅ Success — show clean Verilog in Design Source tab
      setState((s) => ({
        ...s,
        isGenerating: false,
        statusMessage: "",
        designCode: cleanOutput,
        testbenchCode: "",
        isDemoMode: false,
        error: null,
      }));

    } catch (err: any) {
      console.error("Generation FAILED:", err);

      let errorMessage = "Connection failed";
      if (err.name === "AbortError") {
        errorMessage = "Timeout: The model took too long (>2 mins).";
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Fall back to demo mode
      const mockCode = pickMockExample(instruction);

      setState((s) => ({
        ...s,
        isGenerating: false,
        statusMessage: "",
        designCode: mockCode,
        testbenchCode: "// Testbench not available in demo mode",
        isDemoMode: true,
        error: errorMessage,
      }));
    }
  }, []);

  return { ...state, generate };
}
