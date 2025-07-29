import { Router } from "express";

const router = Router();

router.get("",(req,res)=>{
    res.json("Hey, thanks for checking on me, I am good!, how are you?");
});

export default router;
