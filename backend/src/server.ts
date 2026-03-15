import app from './app';
import { checkDbConnection } from './config/db';
import { ENV } from './config/env';

const startServer = async () => {
  await checkDbConnection();
  
  app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
};

startServer();
