# Supply Chain Planning: Demand Forecasting & Inventory Optimization

A beginner-friendly Supply Chain Planning project covering the core planner workflow: forecast demand, classify the portfolio, set safety stock and reorder points, and calculate order quantities.

## Business problem
A distribution company manages 40 SKUs across 5 categories with lead times from 7 to 45 days. Planners need accurate forecasts and inventory rules that protect availability on important items without overspending on stock.

## What the project does
1. **Data** (`src/generate_data.py`): 36 months of synthetic demand with trend, seasonality and variability (1,440 rows).
2. **Forecasting** (`src/analysis.py`): compares Naive, 3-month moving average, exponential smoothing and seasonal naive in a 6-month backtest (WAPE). Each SKU uses its best-fit method.
3. **ABC-XYZ classification**: ABC by annual value (80/15/5 rule), XYZ by coefficient of variation.
4. **Inventory policy**: safety stock = Z x forecast error std dev x sqrt(lead time), with service levels 97.5% (A), 95% (B), 90% (C); reorder point = demand during lead time + safety stock.
5. **EOQ**: sqrt(2DS/H) with $50 per order and 20% annual holding cost.
6. **Deck** (`deck/`): 6-slide PowerPoint summary.

## Key results
- Exponential smoothing was the most accurate method overall (24.7% WAPE vs 27.4-27.7% for the others).
- 13 of 40 SKUs (Class A) account for about 79% of annual value.
- Class-based service levels shift safety stock toward Class A: $115k vs $103k with a uniform 95% policy.
- Total annual ordering plus holding cost under EOQ: about $45k.

## Run it
```bash
pip install pandas numpy matplotlib
python src/generate_data.py
python src/analysis.py
```

## Structure
```
data/      demand_history.csv
src/       generate_data.py, analysis.py
outputs/   method comparison, ABC-XYZ matrix, inventory policy per SKU
charts/    abc_pareto.png, method_comparison.png
deck/      Supply_Chain_Planning_Project.pptx (+ build.js)
```

## Skills demonstrated
Demand forecasting, forecast accuracy (WAPE), ABC-XYZ analysis, safety stock, reorder point, EOQ, inventory policy design, Python (pandas), PowerPoint storytelling.

*Data is synthetic and for learning purposes only.*
