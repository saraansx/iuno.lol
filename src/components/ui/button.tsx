import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`w-full bg-[#609fda]/10 backdrop-blur-xl border border-[#609fda]/20 hover:bg-[#609fda]/20 text-[#609fda] text-sm font-light py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(96,159,218,0.05)] hover:shadow-[0_0_25px_rgba(96,159,218,0.1)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[0.5] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
