import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// Import PayPal Provider
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Cấu hình ban đầu cho SDK
// Chúng ta sẽ dùng USD vì API back-end đang hardcode USD
const initialOptions = {
    "clientId": process.env.REACT_APP_PAYPAL_CLIENT_ID,
    "currency": "USD",
    "intent": "capture",
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <PayPalScriptProvider options={initialOptions}>
      <App />
    </PayPalScriptProvider>
);

reportWebVitals();