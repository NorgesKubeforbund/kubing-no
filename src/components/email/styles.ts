import { CSSProperties } from "react";

export const body: CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: "#f0f0f0",
};

export const outer: CSSProperties = {
  width: "100%",
  backgroundColor: "#f0f0f0",
};

export const outerCell: CSSProperties = {
  padding: "24px 12px",
};

export const container: CSSProperties = {
  width: "600px",
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#fcfcfc",
  fontFamily: "Arial, Helvetica, sans-serif",
};

export const header: CSSProperties = {
  backgroundColor: "#282C34",
  padding: "16px",
};

export const logo: CSSProperties = {
  display: "block",
  width: "120px",
  height: "120px",
  border: 0,
};

export const titleCell: CSSProperties = {
  verticalAlign: "middle",
  paddingLeft: "16px",
};

export const title: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: "24px",
  lineHeight: 1.3,
};

export const content: CSSProperties = {
  padding: "16px 16px 8px 16px",
  color: "#171717",
  fontSize: "14px",
  lineHeight: 1.5,
};

export const h2: CSSProperties = {
  fontSize: "20px",
  margin: "0 0 16px 0",
};

export const h2First: CSSProperties = {
  ...h2,
  marginTop: 0,
};

export const text: CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.5,
  margin: "0 0 14px 0",
};

export const hr: CSSProperties = {
  border: "none",
  borderTop: "1px solid #d4d4d4",
  margin: "24px 0",
};
