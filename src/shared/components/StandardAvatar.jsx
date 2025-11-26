import React from "react";

const StandardAvatar = ({ nombre, color = "#2563eb", size = "md" }) => {
  // Generar iniciales de forma segura
  const iniciales = React.useMemo(() => {
    if (!nombre || typeof nombre !== 'string') return "??";

    return nombre
      .trim()
      .split(" ")
      .filter(n => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";
  }, [nombre]);

  // Tamaños estandarizados
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 aspect-square`}
      style={{ backgroundColor: color + "20" }} // 20% opacity
    >
      <span
        className="text-blue-600 font-semibold"
        style={{ color: color }}
      >
        {iniciales}
      </span>
    </div>
  );
};

export default StandardAvatar;
