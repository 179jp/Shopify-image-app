import styled from "styled-components";

const boxShadowLv1 = "0rem .0625rem 0rem 0rem rgba(26, 26, 26, .07)";
const boxShadowLv2 = "0rem .125rem .25rem 0rem rgba(26, 26, 26, .07)";
const boxShadowInset = "0rem 0rem 0rem .0625rem rgba(0, 0, 0, .08) inset";

const appKeyGradient = "linear-gradient(45deg, #A7D3A6 0%, #ADD2C2 100%)";

export const CardUnit = styled.div`
  background: #fff;
  box-shadow: ${boxShadowLv1};
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.8s;
  &:hover {
    background: ${appKeyGradient};
    img {
      opacity: 0.8;
    }
    transition: all 0.2s;
  }
`;
export const ProductUnitWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
