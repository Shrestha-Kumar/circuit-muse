import { motion } from "framer-motion";
import { Cpu, Database, Zap, BarChart3, Layers, Shield } from "lucide-react";

const stats = [
  {
    icon: Cpu,
    title: "Base Model",
    value: "CodeLlama-3B",
    detail: "3 billion parameter foundation",
    color: "text-primary",
  },
  {
    icon: Zap,
    title: "Fine-Tuning",
    value: "QLoRA 4-bit",
    detail: "Rank-16 adapters, <1% trainable params",
    color: "text-secondary",
  },
  {
    icon: Layers,
    title: "Hardware",
    value: "RTX 4050",
    detail: "6GB VRAM, single GPU training",
    color: "text-primary",
  },
  {
    icon: Database,
    title: "Dataset",
    value: "Custom HDL Corpus",
    detail: "Curated Verilog modules & testbenches",
    color: "text-secondary",
  },
  {
    icon: Shield,
    title: "Verification",
    value: "Self-Checking",
    detail: "Automated testbench validation",
    color: "text-primary",
  },
  {
    icon: BarChart3,
    title: "Output Quality",
    value: "Synthesizable",
    detail: "Clean RTL ready for FPGA/ASIC",
    color: "text-secondary",
  },
];

const ModelDetails = () => {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            Under the <span className="text-secondary text-glow-purple">Hood</span>
          </h2>
          <p className="text-muted-foreground">
            Training specifications and model architecture.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass group rounded-xl p-6 transition-all hover:border-primary/20"
            >
              <stat.icon
                size={20}
                className={`mb-3 ${stat.color} transition-transform group-hover:scale-110`}
              />
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </p>
              <p className={`mb-1 text-xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModelDetails;
