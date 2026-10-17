const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/mnt/skills/public/pptx/scripts/apply_theme.js");
const D = require("./data.json");
const THEME = { name: "SCP", headFontFace: "Calibri", bodyFontFace: "Calibri",
  colors: { dk1:"1B2A3A", lt1:"FFFFFF", dk2:"0F2236", lt2:"F3F6F9", accent1:"1F7A8C", accent2:"E07A1F", accent3:"6A994E", accent4:"7B5EA7", accent5:"5C6B7A", accent6:"BF4342", hlink:"1F7A8C", folHlink:"5C6B7A" } };
const pres = new pptxgen(); pres.layout = "LAYOUT_16x9"; pres.theme = { headFontFace: "Calibri", bodyFontFace: "Calibri" };
const C = pres.SchemeColor;
pres.defineSlideMaster({ title: "TITLE", background: { color: "0F2236" } });
pres.defineSlideMaster({ title: "CONTENT", background: { color: "FFFFFF" },
  objects: [{ rect: { x: 0, y: 0, w: 10, h: 0.12, fill: { color: "1F7A8C" } } }],
  slideNumber: { x: 9.2, y: 5.25, color: "5C6B7A", fontSize: 10 } });
const T = (s, t) => s.addText(t, { x: 0.5, y: 0.3, w: 9, h: 0.7, fontSize: 26, bold: true, color: C.text1, margin: 0, isTextBox: true });
const chartBase = { catAxisLabelFontSize: 11, valAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  catAxisLabelColor: "5C6B7A", valAxisLabelColor: "5C6B7A", valGridLine: { color: "E1E7ED", size: 0.5 }, catGridLine: { style: "none" }, valAxisMinVal: 0,
  showValue: true, dataLabelFontSize: 11, dataLabelFontFace: "+mn-lt", dataLabelColor: "1B2A3A", showTitle: true, titleFontSize: 12, titleColor: "1B2A3A", titleFontFace: "+mn-lt", barDir: "col" };
const side = (s, items, x, y0, gap) => items.forEach((p, i) => {
  const y = y0 + i * gap;
  s.addShape(pres.ShapeType.rect, { x, y, w: 0.07, h: gap - 0.25, fill: { color: C.accent2 }, objectName: "Accent " + i });
  s.addText(p[0], { x: x + 0.2, y, w: 3.2, h: 0.35, fontSize: 14, bold: true, color: C.text1, margin: 0, isTextBox: true });
  s.addText(p[1], { x: x + 0.2, y: y + 0.38, w: 3.2, h: gap - 0.65, fontSize: 11, color: C.accent5, valign: "top", margin: 0, isTextBox: true });
});

// 1
let s = pres.addSlide({ masterName: "TITLE" });
s.addText("Supply Chain Planning", { x: 0.7, y: 1.5, w: 8.6, h: 0.9, fontSize: 40, bold: true, color: C.background1, margin: 0, isTextBox: true });
s.addText("Demand forecasting and inventory optimization for a 40-SKU distribution portfolio", { x: 0.7, y: 2.5, w: 8, h: 0.8, fontSize: 18, color: "BFD7DE", margin: 0, isTextBox: true });
s.addText("Forecasting  |  ABC-XYZ analysis  |  Safety stock  |  Reorder point  |  EOQ", { x: 0.7, y: 4.4, w: 8.5, h: 0.4, fontSize: 12, color: "8FA9B5", margin: 0, isTextBox: true });

// 2
s = pres.addSlide({ masterName: "CONTENT" }); T(s, "Approach: from demand signal to inventory policy");
[["1", "Forecast", "Compare 4 methods in a 6-month backtest and pick the best per SKU"],
 ["2", "Classify", "ABC by annual value and XYZ by demand variability"],
 ["3", "Buffer", "Safety stock and reorder point, with service level set by ABC class"],
 ["4", "Order", "Economic order quantity to balance ordering and holding cost"]].forEach((r, i) => {
  const x = 0.5 + i * 2.28;
  s.addShape(pres.ShapeType.rect, { x, y: 1.4, w: 2.1, h: 2.9, fill: { color: C.background2 }, line: { color: "D5DDE5", width: 0.75 }, objectName: "Card " + r[1] });
  s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: 1.6, w: 0.5, h: 0.5, fill: { color: C.accent1 }, objectName: "Badge " + r[0] });
  s.addText(r[0], { x: x + 0.2, y: 1.6, w: 0.5, h: 0.5, align: "center", valign: "middle", fontSize: 16, bold: true, color: C.background1, margin: 0, isTextBox: true });
  s.addText(r[1], { x: x + 0.2, y: 2.25, w: 1.7, h: 0.4, fontSize: 18, bold: true, color: C.text1, margin: 0, isTextBox: true });
  s.addText(r[2], { x: x + 0.2, y: 2.7, w: 1.7, h: 1.4, fontSize: 12, color: C.accent5, valign: "top", margin: 0, isTextBox: true });
});
s.addText("Data is synthetic: 40 SKUs, 5 categories, 36 months, lead times from 7 to 45 days.", { x: 0.5, y: 4.6, w: 9, h: 0.4, fontSize: 11, italic: true, color: C.accent5, margin: 0, isTextBox: true });

// 3
s = pres.addSlide({ masterName: "CONTENT" }); T(s, "Exponential smoothing is the most accurate single method");
s.addChart(pres.charts.BAR, [{ name: "WAPE %", labels: D.methods, values: D.wape }], { ...chartBase, x: 0.5, y: 1.2, w: 5.4, h: 3.7, chartColors: ["1F7A8C"], showLegend: false,
  dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", title: "Backtest WAPE % (last 6 months, all SKUs)", objectName: "Method chart" });
side(s, [["Best overall: " + D.methods[0], D.wape[0] + "% WAPE across all SKUs"],
         ["No method wins everywhere", "Best method differs by SKU, so each SKU uses its own best fit"],
         ["Lower is better", "WAPE = total absolute error / total actual demand"]], 6.3, 1.3, 1.25);

// 4
s = pres.addSlide({ masterName: "CONTENT" }); T(s, "A third of SKUs drive about 79% of value");
s.addChart(pres.charts.BAR, [{ name: "% of SKUs", labels: D.abc.map(c => "Class " + c), values: D.sku_share }, { name: "% of annual value", labels: D.abc.map(c => "Class " + c), values: D.val_share }],
  { ...chartBase, x: 0.5, y: 1.2, w: 5.4, h: 3.7, chartColors: ["8FA9B5", "E07A1F"], showLegend: true, legendPos: "b", legendFontSize: 11, legendFontFace: "+mn-lt",
    dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", title: "Share of SKUs vs share of annual value (%)", objectName: "ABC chart", barGapWidthPct: 60 });
side(s, [["Class A: tight control", D.nA + " of " + D.n + " SKUs, about 79% of value; review often, highest service level"],
         ["Class B: standard", "Routine reorder rules at a 95% service level"],
         ["Class C: keep it simple", "Low value; 90% service level and simple reorder rules"]], 6.3, 1.3, 1.25);

// 5
s = pres.addSlide({ masterName: "CONTENT" }); T(s, "Service levels by class redirect safety stock to Class A");
s.addChart(pres.charts.BAR, [{ name: "Uniform 95%", labels: D.abc.map(c => "Class " + c), values: D.ss_uni }, { name: "By ABC class (97.5 / 95 / 90%)", labels: D.abc.map(c => "Class " + c), values: D.ss_diff }],
  { ...chartBase, x: 0.5, y: 1.2, w: 5.4, h: 3.7, chartColors: ["8FA9B5", "1F7A8C"], showLegend: true, legendPos: "b", legendFontSize: 11, legendFontFace: "+mn-lt",
    dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", title: "Safety stock value, USD thousands", objectName: "Safety stock chart", barGapWidthPct: 60 });
side(s, [["Class A rises, Class C falls", "Extra buffer goes where stock-outs cost the most; Class C is trimmed"],
         ["Total: $" + (D.tot_diff / 1000).toFixed(0) + "k vs $" + (D.tot_uni / 1000).toFixed(0) + "k", "A deliberate investment for higher availability on key SKUs"],
         ["EOQ ordering policy", "Annual ordering plus holding cost of about $" + (D.eoq_cost / 1000).toFixed(0) + "k across all SKUs"]], 6.3, 1.3, 1.25);

// 6
s = pres.addSlide({ masterName: "CONTENT" }); T(s, "Recommendations and next steps");
[["Review forecasts monthly", "Track WAPE and bias by SKU in a regular S&OP review."],
 ["Focus on AZ items", "High value and high variability: add demand sensing or safety stock reviews."],
 ["Shorten lead times", "Long-lead SKUs need far more safety stock; work with suppliers."],
 ["Improve the models", "Add promotions and holidays; try Holt-Winters or ML forecasts."]].forEach((r, i) => {
  const x = 0.5 + (i % 2) * 4.6, y = 1.3 + Math.floor(i / 2) * 1.7;
  s.addShape(pres.ShapeType.rect, { x, y, w: 4.4, h: 1.5, fill: { color: C.background2 }, line: { color: "D5DDE5", width: 0.75 }, objectName: "Rec card " + i });
  s.addShape(pres.ShapeType.rect, { x, y, w: 0.08, h: 1.5, fill: { color: C.accent1 }, objectName: "Rec accent " + i });
  s.addText(r[0], { x: x + 0.3, y: y + 0.2, w: 3.9, h: 0.4, fontSize: 16, bold: true, color: C.text1, margin: 0, isTextBox: true });
  s.addText(r[1], { x: x + 0.3, y: y + 0.65, w: 3.9, h: 0.7, fontSize: 12, color: C.accent5, valign: "top", margin: 0, isTextBox: true });
});
(async () => { await pres.writeFile({ fileName: "deck/Supply_Chain_Planning_Project.pptx" }); await applyTheme("deck/Supply_Chain_Planning_Project.pptx", THEME); console.log("done"); })();
