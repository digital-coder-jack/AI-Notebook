import 'dotenv/config';
import { createApp } from './app.js';

const PORT = process.env.PORT || 8080;
const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Study Sphere backend listening on port ${PORT}`);
});
