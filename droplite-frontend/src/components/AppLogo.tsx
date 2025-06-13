import React from 'react';
import { Box, Typography } from '@mui/material';

interface AppLogoProps {
  size?: number;
  withText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 40, withText = true }) => {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Box
        width={size}
        height={size}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="primary.main"
        color="primary.contrastText"
        borderRadius="50%"
        sx={{
          boxShadow: 1,
          fontWeight: 'bold',
          fontSize: size * 0.6,
          userSelect: 'none'
        }}
      >
        D
      </Box>
      {withText && (
        <Typography 
          variant="h5" 
          component="h1" 
          fontWeight="bold"
          color="primary"
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          DropLite
        </Typography>
      )}
    </Box>
  );
};

export default AppLogo;
