import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from .schemas import TransactionItem

def preprocess_transactions(transactions: List[TransactionItem]) -> Tuple[pd.DataFrame, int]:
    """
    Takes a list of transaction items, validates and transforms them into
    a chronological monthly aggregate DataFrame.
    Returns (monthly_df, distinct_months_count).
    """
    if not transactions:
        return pd.DataFrame(), 0

    records = []
    for t in transactions:
        try:
            records.append({
                "amount": float(t.amount),
                "category": t.category or "Other",
                "date": pd.to_datetime(t.date)
            })
        except Exception:
            continue

    if not records:
        return pd.DataFrame(), 0

    df = pd.DataFrame(records)
    df = df[df["amount"] > 0]

    if df.empty:
        return pd.DataFrame(), 0

    # Extract Year and Month
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["period"] = df["date"].dt.to_period("M")

    # Group by monthly period
    monthly = df.groupby("period").agg(
        total_amount=("amount", "sum"),
        transaction_count=("amount", "count"),
        year=("year", "first"),
        month=("month", "first")
    ).reset_index()

    monthly = monthly.sort_values(by="period").reset_index(drop=True)
    distinct_months_count = len(monthly)

    # Add chronological time index (t = 0, 1, 2, ...)
    monthly["time_idx"] = np.arange(len(monthly))

    return monthly, distinct_months_count
