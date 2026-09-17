interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`w-full bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white text-sm font-normal py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[0.5] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
