import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Copy, Check, Terminal, Cpu, AlertTriangle, FileCode, FileJson } from "lucide-react";
import { useVerilogGenerator } from "@/hooks/useVerilogGenerator";

const PROMPTS = [
  "Design a SPI Master",
  "Design an 8-bit counter with overflow",
  "Design a UART transmitter",
  "Design a 4-bit ALU",
  "Design a FIFO buffer",
];

const Playground = () => {
  const [instruction, setInstruction] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'testbench'>('design');
  
  const { 
    designCode, 
    testbenchCode, 
    isGenerating, 
    statusMessage, 
    isDemoMode, 
    generate 
  } = useVerilogGenerator();

  const currentCode = activeTab === 'design' ? designCode : testbenchCode;

  const handleGenerate = () => {
    setActiveTab('design');
    generate(instruction);
  };

  const handleCopy = async () => {
    if (!currentCode) return;
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="playground" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            The <span className="text-primary text-glow-green">Playground</span>
          </h2>
          <p className="text-muted-foreground">
            Describe hardware in natural language. Get synthesizable Verilog.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl overflow-hidden border border-border"
        >
          {/* Top bar */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-background/50">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <span className="ml-3 font-mono text-xs text-muted-foreground">
              verilog-playground
            </span>
            {isDemoMode && (
              <span className="ml-auto flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                <AlertTriangle size={10} />
                Demo Mode
              </span>
            )}
          </div>

          {/* CHANGED: h-[600px] -> min-h-[600px]. This allows the window to grow! */}
          <div className="grid md:grid-cols-2 min-h-[600px]"> 
            
            {/* Left - Input */}
            <div className="flex flex-col border-r border-border p-6 bg-background/20">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Terminal size={14} />
                <span className="font-mono">input</span>
              </div>

              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Describe your hardware design..."
                className="flex-1 min-h-[300px] resize-y rounded-lg border border-border bg-background/50 p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />

              {/* Quick prompts */}
              <div className="my-4 flex flex-wrap gap-2">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setInstruction(p)}
                    className="rounded-md border border-border bg-muted/30 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !instruction.trim()}
                className="group flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 glow-green mt-auto"
              >
                <Cpu
                  size={18}
                  className={isGenerating ? "animate-spin" : ""}
                />
                {isGenerating ? "Generating..." : "Generate Circuit"}
              </button>
            </div>

            {/* Right - Output */}
            <div className="flex flex-col bg-background/30 w-full overflow-hidden">
              {/* Tab Bar */}
              <div className="flex items-center justify-between border-b border-border px-2 shrink-0">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('design')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'design'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FileCode size={14} />
                    Design Source
                  </button>
                  <button
                    onClick={() => setActiveTab('testbench')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'testbench'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FileJson size={14} />
                    Testbench
                  </button>
                </div>

                {currentCode && (
                  <button
                    onClick={handleCopy}
                    className="mr-2 flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>

              {/* Code Area - REMOVED overflow-auto so it expands the parent instead */}
              <div className="flex-1 p-4 font-mono text-xs leading-relaxed sm:text-sm overflow-x-auto">
                {isGenerating ? (
                  <div className="flex h-full min-h-[400px] items-center justify-center">
                    <div className="text-center">
                      <Cpu
                        size={32}
                        className="mx-auto mb-4 animate-spin text-primary"
                      />
                      <p className="font-mono text-sm text-primary text-glow-green">
                        {statusMessage}
                      </p>
                      <div className="mt-3 flex justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-1 w-8 rounded-full bg-primary/30"
                            style={{
                              animation: `pulse-glow 1.5s ease-in-out ${i * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : currentCode ? (
                  <pre className="text-foreground">
                    {currentCode.split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="mr-4 inline-block w-8 select-none text-right text-muted-foreground/30 shrink-0">
                          {i + 1}
                        </span>
                        <VerilogLine line={line} />
                      </div>
                    ))}
                  </pre>
                ) : (
                  <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center text-muted-foreground/50">
                    <Play size={24} className="mb-2 opacity-20" />
                    <p className="font-mono text-sm">
                      // Generated {activeTab === 'design' ? 'Verilog module' : 'Testbench'} will appear here...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* Simple Verilog syntax highlighting - Kept unchanged */
const VerilogLine = ({ line }: { line: string }) => {
  const keywords =
    /\b(module|endmodule|input|output|wire|reg|always|begin|end|if|else|case|endcase|assign|localparam|posedge|negedge|or|initial|task|endtask|integer)\b/g;
  const types = /\b(parameter|function|endfunction)\b/g;
  const comments = /(\/\/.*$)/;
  
  const commentMatch = line.match(comments);
  if (commentMatch) {
    const idx = line.indexOf("//");
    return (
      <span>
        <VerilogLine line={line.slice(0, idx)} />
        <span className="text-green-600/80 italic">{line.slice(idx)}</span>
      </span>
    );
  }

  return (
    <span>
      {line.split(/(\b\w+\b)/g).map((part, i) => {
        if (part.match(keywords))
          return <span key={i} className="text-purple-400 font-semibold">{part}</span>;
        if (part.match(/^\d+$/) || part.match(/^\d+'[bhd]\w+$/)) 
           return <span key={i} className="text-orange-400">{part}</span>;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default Playground;