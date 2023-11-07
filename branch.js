const axios = require('axios')

const hostGitlab = "https://gitlab-engineering.koinworks.com"
const hostGithub = "https://api.github.com"
const project_id = process.env.PROJECT_ID;
const authToken = process.env.AUTH_TOKEN;
const githubToken = process.env.GITHUB_TOKEN

const branches_api = `${hostGitlab}/api/v4/projects/${project_id}/repository/branches`;
const pipeline_api = `${hostGitlab}/api/v4/projects/${project_id}/pipelines`;

async function getListBranchSubmodule(page, data, nameRepository) {
    return await axios.get(getEndpointBranchesGithub(nameRepository), {
        headers: {
            "Authorization": `Bearer ${githubToken}`,
            "X-GitHub-Api-Version": '2022-11-28',
            'Accept': 'application/vnd.github+json'
        },
        params: {
            "per_page": 100,
            "page": page
        }
    }).then(async res => {
        // console.log(JSON.stringify(res.data))
        if ((!res || !res.data) && page === 1) {
            return [
                {
                    text: {
                        type: "plain_text",
                        text: "master",
                        emoji: false
                    },
                    value: "master"
                }
            ]
        }

        let filteredData = filterBranchesByPattern(res.data)

        filteredData.forEach(d => {
            const branch = {
                text: {
                    type: "plain_text",
                    text: d.name,
                    emoji: false
                },
                value: d.name
            }
            data.push(branch)
        })
        if (res.data.length !== 0) {
            return await getListBranchSubmodule(page + 1, data, nameRepository)
        } else {
            return data
        }
    }).catch(err => {
        console.log(err)
        return []
    })
}

async function getBranchesSuperAppGitlab(page, data) {
    return await axios.get(branches_api, {
        headers: {"PRIVATE-TOKEN": authToken},
        params: {
            "per_page": 100,
            "page":page
        }
    })
        .then(async res => {
            // const data = []
            if (!res || !res.data && page === 1) {
                return [
                    {
                        text: {
                            type: "plain_text",
                            text: "master",
                            emoji: false
                        },
                        value: "master"
                    }
                ]
            }

            let filteredData = res.data.filter(item => {
                const today = new Date()
                const itemDate = new Date(item.commit.authored_date)

                return itemDate >= getLimitDataByMonthsBefore(1) && itemDate <= today
            })
            filteredData.forEach(d => {
                const branch = {
                    text: {
                        type: "plain_text",
                        text: d.name,
                        emoji: false
                    },
                    value: d.name
                }
                data.push(branch)
            })
            if (res.data.length !== 0) {
                return await getBranchesSuperAppGitlab(page + 1, data)
            } else {
                return data
            }
        })
        .catch(err => {
            console.log(err)
            return []
        })
}

function getEndpointBranchesGithub(nameRepo) {
    return `${hostGithub}/repos/koinworks/${nameRepo}/branches`
}

function getLimitDataByMonthsBefore(monthBefore) {
    const today = new Date()
    const threeMonthsAgo = new Date()
    return threeMonthsAgo.setMonth(today.getMonth() - monthBefore)
}

function filterBranchesByPattern(branches) {
    const regexPattern = /^rc-\d+\.\d+\.\d+$/
    return branches.filter(branch => {
        return regexPattern.test(branch.name) || branch.name === 'master'
    })
}

module.exports = {
    getListBranchSubmodule,
    getBranchesSuperAppGitlab
}