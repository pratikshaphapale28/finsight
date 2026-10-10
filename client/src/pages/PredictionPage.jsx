import React from 'react';
import { Navigate } from 'react-router-dom';

// Retired standalone prediction page — replaced by AI Financial Assistant
const PredictionPage = () => {
  return <Navigate to="/assistant" replace />;
};

export default PredictionPage;
