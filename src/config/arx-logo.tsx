import * as React from "react";

export type ARXLogoProps = React.SVGProps<SVGSVGElement> & {
  isCheckedIn?: boolean;
  isOnBreak?: boolean;
};

export const ARXLogo: React.FC<ARXLogoProps> = ({
  isCheckedIn = false,
  isOnBreak = false,
  className = "",
  ...props
}) => (
  <svg
    width="136.05865mm"
    height="117.82993mm"
    viewBox="0 0 136.05865 117.82993"
    id="svg1"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <g
      id="layer1"
      transform="translate(-0.407122,-6.296154)"
    >
      <g
        id="g66"
        transform="translate(-35.86566,-46.256711)"
      >
        {/* Status keyframes: green pulse (checked-in) & yellow pulse (on break) */}
        <style>
          {`
            @keyframes arxGreenPulse {
              0%, 100% { fill-opacity: 1; filter: drop-shadow(0 0 2px rgba(34, 197, 94, 0.8)); }
              50% { fill-opacity: 0.35; filter: drop-shadow(0 0 0px rgba(34, 197, 94, 0)); }
            }
            @keyframes arxYellowPulse {
              0%, 100% { fill-opacity: 1; filter: drop-shadow(0 0 3px rgba(234, 179, 8, 0.9)); }
              50% { fill-opacity: 0.3; filter: drop-shadow(0 0 0px rgba(234, 179, 8, 0)); }
            }
            .arx-status-green  { animation: arxGreenPulse  1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .arx-status-yellow { animation: arxYellowPulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          `}
        </style>

        {/* Center status triangle:
            🟡 Yellow blinking  → on break
            🟢 Green blinking   → checked-in (not on break)
            ⚪ White            → checked-out / normal */}
        <path
          id="path60"
          className={
            isOnBreak
              ? "arx-status-yellow"
              : isCheckedIn
                ? "arx-status-green"
                : ""
          }
          style={{
            fill: isOnBreak ? "#EAB308" : isCheckedIn ? "#22C55E" : "#FFFFFF",
            fillOpacity: 1,
            strokeWidth: 0.264583,
            transition: "fill 0.4s ease",
          }}
          d="m 104.30216,102.19738 -17.336926,29.55995 17.336926,-8.92452 17.33641,8.92452 z"
        />

        {/* Bottom-left */}
        <path
          id="path61"
          style={{
            fill: "#FFFFFF",
            fillOpacity: 1,
            strokeWidth: 0.264583,
          }}
          d="M 36.272782,170.3828 89.908723,138.77302 72.110742,170.3828 Z"
        />

        {/* Left side */}
        <path
          id="path62"
          style={{
            fill: "#FFFFFF",
            fillOpacity: 1,
            strokeWidth: 0.264583,
          }}
          d="M 40.738557,162.64785 56.777527,134.86754 H 66.510018 L 81.483397,109.44687 H 71.454157 L 89.908723,77.482622 L 100.98111,96.519168 L 74.116403,143.14037 Z"
        />

        {/* Top diamond */}
        <path
          id="path51"
          style={{
            fill: "#FFFFFF",
            fillOpacity: 1,
            strokeWidth: 0.264583,
          }}
          d="M 104.30216,52.552865 93.551396,71.172917 104.30216,90.644596 115.05241,71.172917 Z"
        />

        {/* Bottom-right */}
        <path
          id="path65"
          style={{
            fill: "#FFFFFF",
            fillOpacity: 1,
            strokeWidth: 0.264583,
          }}
          d="m 172.33144,170.3828 -53.63622,-31.60978 17.79809,31.60978 z"
        />

        {/* Right side */}
        <path
          id="path66"
          style={{
            fill: "#FFFFFF",
            fillOpacity: 1,
            strokeWidth: 0.264583,
          }}
          d="M 167.86566,162.64785 151.8266,134.86754 H 142.09406 L 127.12059,109.44687 H 137.1499 L 118.69522,77.482622 L 107.62277,96.519168 L 134.48764,143.14037 Z"
        />
      </g>
    </g>
  </svg>
);

export default ARXLogo;
