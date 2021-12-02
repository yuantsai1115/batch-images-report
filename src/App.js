import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Copyright from './components/Copyright';
import StepperController from './controllers/StepperController';


export default function App() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" align="center">
          批次匯入截圖與照片至文件
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom align="center" mb={3}>
          批次匯入成對的模型截圖與現場照片至Word文件中
        </Typography>
        <StepperController />
        <Copyright />
      </Box>
    </Container>
  );
}
