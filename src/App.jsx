import { Outlet } from "react-router-dom";
import { Button, Container, Typography, Box } from "@mui/material";

function App() {
  return (
    <Container maxWidth="lg" className="min-h-screen py-10">
      <Box className="flex flex-col items-center gap-6 text-center">
        <Typography variant="h2" className="font-bold text-blue-600">
          Najot Ta'lim
        </Typography>
        <Typography variant="body1" className="text-gray-600 max-w-2xl">
          React Router, Tailwind CSS va Material UI muvaffaqiyatli o'rnatildi!
          Endi loyihani boshlashingiz mumkin.
        </Typography>
        <Button variant="contained" color="primary" size="large">
          Boshlash
        </Button>
      </Box>
      <Box className="mt-10">
        <Outlet />
      </Box>
    </Container>
  );
}

export default App;
