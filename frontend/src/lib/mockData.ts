// Pre-written Verilog examples for demo/mock mode
export const MOCK_EXAMPLES: Record<string, string> = {
  default: `module spi_master (
  input  wire        clk,
  input  wire        rst_n,
  input  wire        start,
  input  wire  [7:0] data_in,
  output reg         sclk,
  output reg         mosi,
  output reg         cs_n,
  output reg         done,
  input  wire        miso
);

  // State encoding
  localparam IDLE    = 2'b00;
  localparam TRANSFER = 2'b01;
  localparam DONE    = 2'b10;

  reg [1:0] state;
  reg [2:0] bit_cnt;
  reg [7:0] shift_reg;
  reg [7:0] rx_data;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      state     <= IDLE;
      sclk      <= 1'b0;
      mosi      <= 1'b0;
      cs_n      <= 1'b1;
      done      <= 1'b0;
      bit_cnt   <= 3'd0;
      shift_reg <= 8'd0;
    end else begin
      case (state)
        IDLE: begin
          done <= 1'b0;
          if (start) begin
            cs_n      <= 1'b0;
            shift_reg <= data_in;
            bit_cnt   <= 3'd7;
            state     <= TRANSFER;
          end
        end
        TRANSFER: begin
          sclk <= ~sclk;
          if (sclk) begin
            mosi      <= shift_reg[7];
            shift_reg <= {shift_reg[6:0], miso};
            if (bit_cnt == 0)
              state <= DONE;
            else
              bit_cnt <= bit_cnt - 1;
          end
        end
        DONE: begin
          cs_n  <= 1'b1;
          sclk  <= 1'b0;
          done  <= 1'b1;
          rx_data <= shift_reg;
          state <= IDLE;
        end
      endcase
    end
  end

endmodule`,

  counter: `module counter_8bit (
  input  wire       clk,
  input  wire       rst_n,
  input  wire       enable,
  output reg  [7:0] count,
  output wire       overflow
);

  assign overflow = (count == 8'hFF) & enable;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
      count <= 8'h00;
    else if (enable)
      count <= count + 1'b1;
  end

endmodule`,

  uart: `module uart_tx (
  input  wire       clk,
  input  wire       rst_n,
  input  wire [7:0] data,
  input  wire       start,
  output reg        tx,
  output reg        busy
);

  localparam BAUD_DIV = 434; // 50MHz / 115200
  
  reg [9:0] shift_reg;
  reg [3:0] bit_idx;
  reg [8:0] baud_cnt;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      tx       <= 1'b1;
      busy     <= 1'b0;
      bit_idx  <= 0;
      baud_cnt <= 0;
    end else if (!busy && start) begin
      shift_reg <= {1'b1, data, 1'b0};
      busy      <= 1'b1;
      bit_idx   <= 0;
      baud_cnt  <= 0;
    end else if (busy) begin
      if (baud_cnt == BAUD_DIV - 1) begin
        baud_cnt <= 0;
        tx       <= shift_reg[0];
        shift_reg <= {1'b1, shift_reg[9:1]};
        if (bit_idx == 9) busy <= 1'b0;
        else bit_idx <= bit_idx + 1;
      end else begin
        baud_cnt <= baud_cnt + 1;
      end
    end
  end

endmodule`,
};

export const STATUS_MESSAGES = [
  "Parsing instruction…",
  "Tokenizing prompt…",
  "Routing logic gates…",
  "Synthesizing RTL…",
  "Verifying testbench…",
  "Optimizing datapath…",
  "Generating output…",
];

export function pickMockExample(instruction: string): string {
  const lower = instruction.toLowerCase();
  if (lower.includes("counter")) return MOCK_EXAMPLES.counter;
  if (lower.includes("uart") || lower.includes("serial")) return MOCK_EXAMPLES.uart;
  return MOCK_EXAMPLES.default;
}
