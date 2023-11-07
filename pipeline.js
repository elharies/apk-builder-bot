const axios = require('axios')
const {config} = require("dotenv");

const hostGitlab = "https://gitlab-engineering.koinworks.com"
const project_id = process.env.PROJECT_ID
const authToken = process.env.AUTH_TOKEN
const pipeline_api = `${hostGitlab}/api/v4/projects/${project_id}/pipelines`

async function getStatusPipeline(pipelineId) {
    return await axios.get(`${pipeline_api}/${pipelineId}`, {
        'headers': { 'PRIVATE-TOKEN': authToken }
    }).then(async res => {
        return res
    }).catch(err => {
        console.log(err)
        return err
    })
}

async function cancelPipeline(pipelineId) {
    return await axios.post(`${pipeline_api}/${pipelineId}/cancel`, null, {
        'headers': { 'PRIVATE-TOKEN': authToken }
    }).then(async res => {
        return res
    }).catch(err => {
        console.log(err)
        return err
    })
}

module.exports = {
    getStatusPipeline,
    cancelPipeline
}