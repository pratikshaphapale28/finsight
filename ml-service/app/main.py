from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PredictionRequest, PredictionResponse
from .preprocessing import preprocess_transactions
from .model import train_and_predict

app = FastAPI(
    title="FinSight Machine Learning Prediction Service",
    description="Regression-based expense estimation service for FinSight financial management system.",
    version="1.0.0",
)

# Enable CORS for communication with Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "FinSight ML Service",
        "model_type": "Linear Trend Regression (scikit-learn)",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
def predict_expense(request: PredictionRequest):
    """
    Receives historical transactions, processes monthly aggregates,
    enforces minimum 3-month history rule, and produces next-month expense estimate.
    """
    try:
        if not request.transactions:
            return PredictionResponse(
                status="insufficient_data",
                predictedExpense=None,
                message="No expense transactions provided. Please record your transactions to enable predictive planning.",
                historicalMonthsCount=0,
                requiredMonths=3
            )

        monthly_df, distinct_months = preprocess_transactions(request.transactions)

        # Minimum-history rule: at least 3 distinct calendar months of spending
        if distinct_months < 3:
            return PredictionResponse(
                status="insufficient_data",
                predictedExpense=None,
                message=f"Insufficient data for prediction. You have {distinct_months} month{'s' if distinct_months != 1 else ''} of recorded expenses. FinSight requires at least 3 months of historical data to generate a reliable forecast.",
                historicalMonthsCount=distinct_months,
                requiredMonths=3
            )

        # Train regression model and infer next month
        predicted_value, details = train_and_predict(monthly_df)

        return PredictionResponse(
            status="success",
            predictedExpense=predicted_value,
            message="Prediction generated from historical spending patterns.",
            historicalMonthsCount=distinct_months,
            requiredMonths=3,
            trend=details.get("trend_direction"),
            details=details
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction pipeline error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
