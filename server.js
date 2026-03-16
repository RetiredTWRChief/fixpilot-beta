import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req,res)=>{
  res.json({ ok:true, message:"FixPilot backend running" });
});

app.listen(PORT, ()=>{
  console.log("FixPilot backend running on port", PORT);
});
