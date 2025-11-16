/**
 * Example: Generated Card Component with styled-components
 * This is an example of code generated from a Figma card design
 */

import React from 'react';
import styled from 'styled-components/native';

const StyledContainer = styled.View`
  width: 320px;
  padding: 16px;
  background-color: #FFFFFF;
  border-radius: 12px;
  flex-direction: column;
  gap: 12px;
`;

const StyledTitle = styled.Text`
  font-family: System;
  font-size: 20px;
  font-weight: 700;
  color: #000000;
`;

const StyledDescription = styled.Text`
  font-family: System;
  font-size: 14px;
  font-weight: 400;
  color: #666666;
  line-height: 20px;
`;

export const Card: React.FC = () => {
  return (
    <StyledContainer>
      <StyledTitle>Card Title</StyledTitle>
      <StyledDescription>This is a description of the card content. It provides additional information about the card.</StyledDescription>
    </StyledContainer>
  );
};
