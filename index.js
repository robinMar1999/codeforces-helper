import express from 'express'
import {getContestSet, getProblemList} from './helpers.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url';


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log(path.join(__dirname, 'public'));


const app = express();

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, 'public')))

app.get("/", async (req,res)=> {
    res.render("index", {
        problems: [],
        handles: "tourist",
        problemLevel: "A",
        contestType: "div1",
        start: 0,
        count: 20,
        getUnsolved: true
    })
})

app.get("/problems", async (req,res) => {
    // console.log(req)
    const handles = req.query.handles.split(",")
    const problemLevel = req.query.problemLevel
    const contestType = req.query.contestType
    const getUnsolved = req.query.getUnsolved
    const contestSet = await getContestSet(contestType)
    let problemList = await getProblemList(contestSet, handles, problemLevel, getUnsolved);
    let start = 0, count = 100
    if(req.query.start) {
        start = parseInt(req.query.start)
    }
    if(req.query.count) {
        count = parseInt(req.query.count)
    }

    problemList = problemList.slice(start, start + count)

    // console.log(contestSet);
    res.render("index", {
        problems: problemList,
        handles: handles,
        problemLevel: problemLevel,
        contestType: contestType,
        start: start,
        count: count,
        getUnsolved: getUnsolved === "on" ? true : false
    })
})

app.get("/problems/:contestType/json", async (req,res) => {
    // console.log(req)
    const handles = req.query.handles.split(";")
    const problemLevel = req.query.problemLevel
    const contestSet = await getContestSet(req.params.contestType)
    const problemList = await getProblemList(contestSet, handles, problemLevel);
    // console.log(contestSet);
    res.json( {
        problems: problemList
    })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})

