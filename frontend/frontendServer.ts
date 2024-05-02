// Simple Node.js express server to serve the frontend for a production build
// Requires that the application is built via "npm run build"
import express from 'express';
import path from 'path';


const app = express();


// Serve static files
app.use(express.static(path.join(__dirname, 'out')));

// Handle all other requests by serving the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3010;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
