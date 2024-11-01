import { style } from "@vanilla-extract/css";

export const loadingUnit = style({
  display: "inline-block",
  padding: "1em",
  backgroundColor: "rgba(0,0,0,.65)",
  borderRadius: "50%",
  position: "fixed",
  bottom: "1em",
  left: "50%",
  zIndex: 1000,
  transform: "translateX(-50%)",
});
