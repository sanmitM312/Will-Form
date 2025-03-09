'use client'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NavBar = ({ title = "Our Service" }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <AppBar position="static" color="#FFFFFF" elevation={2} sx={{ width: '100%' }}>
      <Toolbar>
        {pathname !== '/' && (
          <Button 
            color="inherit" 
            onClick={handleBackClick} 
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
          </Button>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;