import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from typing import Dict, Any, Tuple

def train_and_predict(monthly_df: pd.DataFrame) -> Tuple[float, Dict[str, Any]]:
    """
    Fits a Linear Trend Regression model on historical monthly expenses
    and predicts the next month's estimated expense.
    
    Returns (predicted_expense, details_dict).
    """
    n_points = len(monthly_df)
    X = monthly_df[["time_idx"]].values  # Shape: (n, 1)
    y = monthly_df["total_amount"].values  # Shape: (n,)

    # Train linear regression model
    model = LinearRegression()
    model.fit(X, y)

    # Next month's time index is n_points
    next_time_idx = np.array([[n_points]])
    raw_prediction = float(model.predict(next_time_idx)[0])

    # Compute metrics for viva/explanation
    slope = float(model.coef_[0])
    intercept = float(model.intercept_)
    r2_score = float(model.score(X, y)) if n_points >= 3 else 0.0

    avg_expense = float(np.mean(y))
    last_expense = float(y[-1])
    min_observed = float(np.min(y))
    max_observed = float(np.max(y))

    # Realistic boundary guardrails:
    # Future expense cannot be negative or drastically disconnected from past patterns
    lower_bound = max(100.0, min_observed * 0.6)
    upper_bound = max(max_observed * 1.5, avg_expense * 2.0)

    # Guard clamped prediction
    clamped_prediction = max(lower_bound, min(upper_bound, raw_prediction))
    final_prediction = round(clamped_prediction)

    # Determine trend label
    if slope > 150:
        trend = "upward"
    elif slope < -150:
        trend = "downward"
    else:
        trend = "stable"

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    history = []
    for _, row in monthly_df.iterrows():
        m_idx = int(row["month"]) - 1
        history.append({
            "period": str(row["period"]),
            "label": f"{month_names[m_idx]} {int(row['year'])}",
            "amount": round(float(row["total_amount"])),
            "count": int(row["transaction_count"]),
        })

    details = {
        "average_monthly": round(avg_expense),
        "last_month_expense": round(last_expense),
        "trend_slope": round(slope, 2),
        "trend_direction": trend,
        "intercept": round(intercept, 2),
        "r2_score": round(max(0.0, r2_score), 3),
        "monthly_history": history,
    }

    return float(final_prediction), details
