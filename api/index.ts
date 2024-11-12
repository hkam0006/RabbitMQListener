import express from 'express';
import dotenv from 'dotenv'
import amqp from 'amqplib';

dotenv.config()

let channel: amqp.Channel;
const app = express()

const RABBITMQ_URL = process.env.CLOUDAMQP_HOST as string
const QUEUE_NAME = process.env.QUEUE_NAME as string

async function startRabbitMQListener() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`Listening to RabbitMQ queue: ${QUEUE_NAME}`);

    // Consume messages from the queue
    channel.consume(
      QUEUE_NAME,
      (message) => {
        if (message) {
          const content = message.content.toString();
          console.log(`Received message: ${content}`);
          channel.ack(message); // Acknowledge the message
        }
      },
      { noAck: false }
    );

    // Handle connection close
    connection.on('close', () => {
      console.log('RabbitMQ connection closed.');
      setTimeout(startRabbitMQListener, 5000); // Reconnect after a delay
    });

    connection.on('error', (error) => {
      console.error('RabbitMQ connection error:', error);
      setTimeout(startRabbitMQListener, 5000); // Retry connection
    });
  } catch (error) {
    console.error('Error starting RabbitMQ listener:', error);
    setTimeout(startRabbitMQListener, 5000); // Retry connection
  }
}

startRabbitMQListener()

app.get("/", (req, res) => {
  res.send("Express on Vercel")
})

module.exports = app;