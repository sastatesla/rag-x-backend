
echo "Running Prisma migration..."
npx prisma migrate deploy

echo "Starting Node app..."
npm start
