"""Supply Chain Planning analysis
1. Compare 4 forecasting methods (backtest on last 6 months)
2. ABC (value) + XYZ (variability) classification
3. Safety stock, reorder point and EOQ with service levels by ABC class
"""
import numpy as np, pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

df = pd.read_csv("data/demand_history.csv", parse_dates=["month"])
H = 6
ORDER_COST, HOLD_RATE = 50.0, 0.20        # $ per order, annual holding cost % of unit cost
Z = {"A": 1.96, "B": 1.65, "C": 1.28}     # 97.5%, 95%, 90% service levels

# ---- forecasting methods (each returns h-step forecast) ----
def naive(y, h, n=None):         return np.repeat(y[-1], h)
def moving_avg(y, h, n=None):    return np.repeat(y[-3:].mean(), h)
def exp_smooth(y, h, n=None):
    l = y[0]
    for v in y[1:]: l = 0.3 * v + 0.7 * l
    return np.repeat(l, h)
def seasonal_naive(y, h, n=None): return y[-12:][:h]
METHODS = {"Naive": naive, "Moving avg (3m)": moving_avg, "Exp. smoothing": exp_smooth, "Seasonal naive": seasonal_naive}

# ---- 1. backtest ----
res, best_rows, fut = [], [], []
for sku, g in df.groupby("sku"):
    y = g.sort_values("month")["units_sold"].values.astype(float)
    train, test = y[:-H], y[-H:]
    errs = {}
    for name, f in METHODS.items():
        p = f(train, H)
        errs[name] = (np.abs(test - p).sum() / test.sum(), np.sqrt(((test - p) ** 2).mean()))
        res.append(dict(sku=sku, method=name, wape=errs[name][0], abs_err=np.abs(test - p).sum(), actual=test.sum()))
    best = min(errs, key=lambda k: errs[k][0])
    best_rows.append(dict(sku=sku, best_method=best, best_wape=errs[best][0], rmse=errs[best][1],
                          fcst_monthly=float(METHODS[best](y, 3).mean())))
res, best = pd.DataFrame(res), pd.DataFrame(best_rows)
meth = res.groupby("method").apply(lambda d: d.abs_err.sum() / d.actual.sum(), include_groups=False).rename("wape").reset_index()
meth.to_csv("outputs/method_comparison.csv", index=False)
print(meth.round(3)); print(best.best_method.value_counts())

# ---- 2. ABC-XYZ (last 12 months) ----
last12 = df[df.month > df.month.max() - pd.DateOffset(months=12)]
cls = last12.groupby("sku").agg(annual_units=("units_sold", "sum"), mean=("units_sold", "mean"),
        std=("units_sold", "std"), unit_cost=("unit_cost", "first"), lead_time_days=("lead_time_days", "first"),
        category=("category", "first")).reset_index()
cls["annual_value"] = cls.annual_units * cls.unit_cost
cls = cls.sort_values("annual_value", ascending=False).reset_index(drop=True)
cls["cum_share"] = cls.annual_value.cumsum() / cls.annual_value.sum()
cls["ABC"] = np.where(cls.cum_share <= 0.80, "A", np.where(cls.cum_share <= 0.95, "B", "C"))
cls.loc[0, "ABC"] = "A"
cls["cv"] = cls["std"] / cls["mean"]
cls["XYZ"] = np.where(cls.cv < 0.25, "X", np.where(cls.cv < 0.40, "Y", "Z"))
cls["class"] = cls.ABC + cls.XYZ

# ---- 3. inventory policy ----
inv = cls.merge(best, on="sku")
lt = inv.lead_time_days / 30
inv["z"] = inv.ABC.map(Z)
inv["safety_stock"] = (inv.z * inv.rmse * np.sqrt(lt)).round()
inv["reorder_point"] = (inv.fcst_monthly * lt + inv.safety_stock).round()
inv["eoq"] = np.sqrt(2 * inv.annual_units * ORDER_COST / (HOLD_RATE * inv.unit_cost)).round()
inv["orders_per_year"] = (inv.annual_units / inv.eoq).round(1)
inv["annual_cost"] = (inv.annual_units / inv.eoq * ORDER_COST + inv.eoq / 2 * HOLD_RATE * inv.unit_cost).round(0)
inv["ss_value"] = (inv.safety_stock * inv.unit_cost).round(0)
inv["ss_value_uniform95"] = (1.65 * inv.rmse * np.sqrt(lt) * inv.unit_cost).round(0)
inv.to_csv("outputs/inventory_policy.csv", index=False)

abc = inv.groupby("ABC").agg(skus=("sku", "count"), value=("annual_value", "sum"), ss_value=("ss_value", "sum")).reset_index()
abc["value_share"] = abc.value / abc.value.sum()
abc.to_csv("outputs/abc_summary.csv", index=False)
print(abc.round(3))
print("Safety stock differentiated:", inv.ss_value.sum(), " uniform 95%:", inv.ss_value_uniform95.sum())
print("Total EOQ cost:", inv.annual_cost.sum())
print(pd.crosstab(inv.ABC, inv.XYZ))
pd.crosstab(inv.ABC, inv.XYZ).to_csv("outputs/abc_xyz_matrix.csv")

# ---- charts for the repo ----
fig, ax = plt.subplots(figsize=(8, 4))
ax.bar(range(len(cls)), cls.annual_value / 1000, color="#1f7a8c")
ax2 = ax.twinx(); ax2.plot(range(len(cls)), cls.cum_share * 100, color="#e07a1f"); ax2.axhline(80, ls="--", c="grey", lw=.7)
ax.set_xlabel("SKUs ranked by annual value"); ax.set_ylabel("Annual value (USD k)"); ax2.set_ylabel("Cumulative %")
ax.set_title("ABC Pareto: a few SKUs drive most of the value"); plt.tight_layout(); plt.savefig("charts/abc_pareto.png", dpi=150); plt.close()
fig, ax = plt.subplots(figsize=(6, 4))
(meth.set_index("method").wape * 100).plot.bar(ax=ax, color="#2a6f97"); ax.set_ylabel("WAPE %"); ax.set_title("Forecast method comparison (backtest)")
plt.xticks(rotation=15); plt.tight_layout(); plt.savefig("charts/method_comparison.png", dpi=150); plt.close()
