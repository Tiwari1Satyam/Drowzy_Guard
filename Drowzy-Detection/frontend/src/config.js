const config = {
    BACKEND_URL: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001' 
        : window.location.origin
};

export default config;