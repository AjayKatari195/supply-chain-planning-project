"""Generate a synthetic distribution-company dataset: 40 SKUs x 36 months."""
import numpy as np, pandas as pd

rng = np.random.default_rng(7)
months = pd.date_range("2023-01-01", periods=36, freq="MS")
cats = ["Grocery", "Household", "Apparel", "Electronics", "Health"]

skus = []
for i in range(1, 41):
    skus.append(dict(
        sku=f"SKU{i:02d}",
        category=cats[i % 5],
        base=float(np.exp(rng.normal(6.0, 1.5))),      # monthly demand, skewed (few big sellers)
        cv=float(rng.uniform(0.08, 0.55)),             # demand variability
        seasonal=float(rng.choice([0, 0.1, 0.25], p=[0.4, 0.3, 0.3])),
        trend=float(rng.normal(0.004, 0.006)),
        unit_cost=round(float(np.exp(rng.normal(2.3, 0.8))), 2),
        lead_time_days=int(rng.choice([7, 14, 21, 30, 45])),
    ))

rows = []
for s in skus:
    peak = rng.integers(1, 13)
    for i, m in enumerate(months):
        season = 1 + s["seasonal"] * np.cos(2 * np.pi * (m.month - peak) / 12)
        d = s["base"] * (1 + s["trend"] * i) * season * max(rng.normal(1, s["cv"]), 0.1)
        rows.append([m, s["sku"], s["category"], int(d), s["unit_cost"], s["lead_time_days"]])

df = pd.DataFrame(rows, columns=["month", "sku", "category", "units_sold", "unit_cost", "lead_time_days"])
df.to_csv("data/demand_history.csv", index=False)
print(df.shape)
