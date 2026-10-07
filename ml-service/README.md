# FinSight — Machine Learning Service

## Overview
This is a dedicated microservice developed using **Python**, **FastAPI**, and **scikit-learn** to provide explainable expense forecasting for the FinSight platform.

## Architecture
- **Framework**: FastAPI (asynchronous, high performance, automatic OpenAPI documentation at `/docs`)
- **Data Manipulation**: Pandas & NumPy
- **Machine Learning**: scikit-learn `LinearRegression` with chronological time-indexing
- **Guardrails**:
  - **Minimum History Rule**: Requires at least 3 distinct calendar months of spending history before issuing predictions.
  - **Insufficient Data Handling**: Returns structured `insufficient_data` status with helpful guidance rather than inaccurate guesses.
  - **Boundary Guardrails**: Clamps predictions within safe statistical bounds ($0.6 \times \text{min}$ to $1.5 \times \text{max}$) to prevent negative or unrealistic forecasts.

## API Endpoints
- `GET /`: Service metadata
- `GET /health`: Health status
- `POST /predict`: Generates expense estimation given a transaction list

## Viva / Explanation Points
1. **Why separate from Node.js?**
   - Keeps the Python data science and machine learning ecosystem decoupled from the I/O-heavy Node.js web server. Allows independent scaling and maintenance.
2. **Why Linear Regression?**
   - Personal finances follow trends (inflation, seasonal baseline habits, lifestyle creep). Linear trend regression is easily interpretable, fast, explainable, and avoids black-box deep learning overfitting on modest personal finance datasets.
3. **Data Preprocessing**:
   - Individual transactions are grouped by calendar month (`YYYY-MM`). Outliers and negative values are sanitized.
