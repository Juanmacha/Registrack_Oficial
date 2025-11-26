import React from "react";

const DownloadButton = ({ 
  type = "excel", // "excel" o "pdf"
  onClick, 
  title, 
  className = "",
  disabled = false 
}) => {
  const getButtonStyles = () => {
    const baseStyles = "w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg";
    
    if (type === "excel") {
      return `${baseStyles} bg-green-600 text-white hover:bg-green-700 border-2 border-green-600 ${className}`;
    } else if (type === "pdf") {
      return `${baseStyles} bg-red-600 text-white hover:bg-red-700 border-2 border-red-600 ${className}`;
    }
    
    return baseStyles;
  };

  const getIcon = () => {
    if (type === "excel") {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else if (type === "pdf") {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return null;
  };

  const getText = () => {
    return ""; // Solo mostrar ícono, sin texto
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonStyles()}
      title={title || (type === "excel" ? "Descargar Excel" : "Descargar PDF")}
    >
      {getIcon()}
    </button>
  );
};

export default DownloadButton;
