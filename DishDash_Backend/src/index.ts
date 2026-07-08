import app from "./app";
import { PORT } from "./config";
import { connectDB } from "./database/mongodb";

async function startServer() {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server: http://localhost:${PORT}`);
    });
}

startServer();