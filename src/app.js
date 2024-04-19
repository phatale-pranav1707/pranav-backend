import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser';

const app=express();

//cors na khalil way ne use karave
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) // server chya power nusar aapn "16kb" chi json file ghyavi jast nahi, limit set nahi kel tari chalel, aapn 16kb paryntch jason accept kru

app.use(express.urlencoded({extended:true})) // url kdun pn data milele he express la sangitle jate, extended : true means nesting of objects pn hote

app.use(express.static("public")) // kahi vela images , file pn db madhe stores karavya lagtil so static kele ahe, ani he sarv public folder madun yeil

app.use(cookieParser())





export {app}