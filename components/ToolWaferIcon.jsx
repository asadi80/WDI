function ToolWaferIcon({ x, y, notch }) {
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${notch}deg)`,
        zIndex: 50,
      }}
    >
      {/* Wafer body */}
      <div className="relative w-20 h-20 rounded-full bg-white border-4 border-blue-600 shadow-lg flex items-center justify-center">

        {/* Notch (BLUE TRIANGLE) */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2
                     w-0 h-0
                     border-l-[6px] border-r-[6px] border-b-[10px]
                     border-l-transparent border-r-transparent
                     border-b-blue-600"
        />

        {/* Debug label */}
        <span className="text-[10px] font-bold text-blue-700">
          WAFER
        </span>
      </div>
    </div>
  );
}
