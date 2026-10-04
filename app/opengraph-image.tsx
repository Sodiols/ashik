import { ImageResponse } from "next/og";
export const alt = "Ashik Rabbani — Independent Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#fff",
        color: "#000",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "48px 60px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>ASHIK RABBANI</span>
        <span>INDEPENDENT DESIGNER · BANGLADESH</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 152,
          marginTop: 75,
          fontStyle: "italic",
        }}
      >
        Visual
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 160,
          letterSpacing: "-9px",
          alignSelf: "flex-end",
          marginTop: -38,
        }}
      >
        Designer
      </div>
    </div>,
    size,
  );
}
