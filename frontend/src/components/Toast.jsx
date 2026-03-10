import React from 'react';
import { ToastContainer, toast as _toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const toast = _toast;

export default function Toast() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
}
