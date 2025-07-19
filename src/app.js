import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import routes from "./routes/index.js";
import eventEmitter from './utils/logging.js';
import xssSanitizer from './middlewares/xss.js';
import helmet from 'helmet';
import compression from 'compression';
import { authLimiter } from './utils/rateLimiter.js';
import pc from './configs/pinecone.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(xssSanitizer())

app.use(helmet())

// gzip compression
app.use(compression())

app.use(cors())
// app.options("*", cors())


app.use('/v1', routes);

app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
	app.use("/v1/auth", authLimiter)
}


app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: `Your server is up and running....${process.pid}`
	})
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    eventEmitter.emit('logging', `[App] Server started on port ${PORT}`);
});
