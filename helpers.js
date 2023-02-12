import fetch from 'node-fetch';

const baseUri = "https://codeforces.com/api";

const divIdToSearchString = {
    div1: "Div. 1",
    div2: "Div. 2",
    div3: "Div. 3",
    div4: "Div. 4"
}

const getContestSet = async (contestType) => {
    const contestListUri = `${baseUri}/contest.list`
    const response = await fetch(contestListUri)
    const data = await response.json()
    const contestList = data.result
    const divBasedContestList = contestList.filter(contest => contest.name.includes(divIdToSearchString[contestType]))
    const divBasedContestSet = new Set()
    divBasedContestList.forEach(contest => {
        divBasedContestSet.add(contest.id)
    })
    return divBasedContestSet;
}

const getProblemList = async (contestSet, handles, problemLevel, getUnsolved) => {
    const problemsUri = `${baseUri}/problemset.problems`
    
    const problemResponse = await fetch(problemsUri)
    const problemData = await problemResponse.json()
    const problems = problemData.result.problems
    const problemLevelBasedProblems = problems.filter(problem => problem.index.includes(problemLevel))
    let divBasedProblems = problemLevelBasedProblems.filter(problem => contestSet.has(problem.contestId))
    var userSubmissionsSet = new Set()
    
    for(let handle of handles) {
        const userSubmissionUri = `${baseUri}/user.status?handle=${handle}`
        const userSubmissionsResponse = await fetch(userSubmissionUri)
        const userSubmissionData = await userSubmissionsResponse.json()
        const submissions = userSubmissionData.result
        submissions.forEach(submission => {
            if(submission.verdict == "OK") {
                userSubmissionsSet.add(`${submission.problem.contestId}-${submission.problem.index}`)
            }
        })
    }
    const userMappedProblems = divBasedProblems.map(problem => {
        const problemId = `${problem.contestId}-${problem.index}`
        return {
            contestId: problem.contestId,
            index: problem.index,
            name: problem.name,
            isSolved: userSubmissionsSet.has(problemId),
            url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
        }
    })
    userMappedProblems.sort((a,b) => {
        if(a.contestId  < b.contestId)
            return 1;
        return -1;
    })

    const solvedFilteredProblems = userMappedProblems.filter(problem => {
        if(getUnsolved) {
            return !problem.isSolved;
        } else {
            return true;
        }
    })

    return solvedFilteredProblems;
}



export { getContestSet, getProblemList}