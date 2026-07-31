import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`w-full bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white text-sm font-normal py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[0.5] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
