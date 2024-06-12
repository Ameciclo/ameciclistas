import { useRouter } from 'next/router';

const TelegramWebhook = () => {
  const router = useRouter();
  const { message } = router.query;
  console.log(message);

  return <p>Received message: {message}</p>;
}

export default TelegramWebhook;