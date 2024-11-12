import express from 'express';

const app = express()

app.get("/", (req, res) => {
  res.send("Express on Vercel")
})

module.exports = app;