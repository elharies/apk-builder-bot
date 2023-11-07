// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const dotenv = require('dotenv');
dotenv.config();
const FormData = require('form-data');
const axios = require("axios");
const {getListBranchSubmodule, getBranchesSuperAppGitlab} = require("./branch")
const {getStatusPipeline, cancelPipeline} = require("./pipeline")

const hostGitlab = "https://gitlab-engineering.koinworks.com"
const project_id = process.env.PROJECT_ID;
const triggerToken = process.env.TRIGGER_TOKEN;
const trigger_api = `${hostGitlab}/api/v4/projects/${project_id}/trigger/pipeline`;
// https://slack.dev/bolt-js/concepts#updating-pushing-views

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3000
});

// All the room in the world for your code

(async () => {
    // Start your app
    await app.start();

    console.log("⚡️ Bolt app is running!");
})();

// Listen for a slash command invocation
app.command("/buildapk", async ({ ack, payload, context }) => {
    // Acknowledge the command request
    ack();

    const userId = payload.user_id

    const androidKoingaji = "android-koingaji"
    const androidKoinbond = "android-koinbond"
    const androidKoingold = "android-koingold"
    const androidKoinneo = "android-koinneo"
    const androidKoinbisnis = "android-koinbisnis"
    const androidKoinrevolver = "android-koinrevolver"
    const androidKoinbill = "android-koinrevolver"
    const androidKoinlearn = "android-koinlearn"
    const androidKoindeposito = "android-koindeposito"
    const androidKoinp2p = "android-koinp2p"

    let typeBuild = ""
    if (payload.text.toLowerCase().includes("development")) {
        typeBuild = "build_dev"
    } else if (payload.text.toLowerCase().includes("uat")) {
        typeBuild = "build_uat"
    } else if (payload.text.toLowerCase().includes("staging")) {
        typeBuild = "build_stg"
    }

    const resultLoading = await app.client.views.open({
        token: context.botToken,
        trigger_id: payload.trigger_id,
        view: {
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": "Build APK"
            },
            "close": {
                "type": "plain_text",
                "text": "Cancel"
            },
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "plain_text",
                        "text": ":man-biking: Now loading..."
                    }
                }
            ]
        }
    })
    try {
        await new Promise(r => setTimeout(r, 500))
        if (typeBuild.toLowerCase().includes("dev") || typeBuild.toLowerCase().includes("uat") || typeBuild.toLowerCase().includes("stg")) {
            const defaultBranch = {
                text: {
                    type: "plain_text",
                    text: "master",
                    emoji: false
                },
                value: "master"
            }
            let branchSuperapp = [defaultBranch]
            let branchGaji = [defaultBranch]
            let branchBond = [defaultBranch]
            let branchGold = [defaultBranch]
            let branchNeo = [defaultBranch]
            let branchBisnis = [defaultBranch]
            let branchRevolver = [defaultBranch]
            let branchBill = [defaultBranch]
            let branchLearn = [defaultBranch]
            let branchDeposito = [defaultBranch]
            let branchP2p = [defaultBranch]
            await getBranchesSuperAppGitlab(1, []).then(data => {
                console.log(`final: ${data.length}`)
                branchSuperapp = data
            })
            await getListBranchSubmodule(1, [], androidKoingaji).then(data => {
                console.log(`Final gaji: ${data.length}`)
                branchGaji = data
            })
            await getListBranchSubmodule(1, [], androidKoinbond).then(data => {
                branchBond = data
            })
            await getListBranchSubmodule(1, [], androidKoingold).then(data => {
                branchGold = data
            })
            await getListBranchSubmodule(1, [], androidKoinneo).then(data => {
                branchNeo = data
            })
            await getListBranchSubmodule(1, [], androidKoinbisnis).then(data => {
                branchBisnis = data
            })
            await getListBranchSubmodule(1, [], androidKoinrevolver).then(data => {
                branchRevolver = data
            })
            await getListBranchSubmodule(1, [], androidKoinbill).then(data => {
                branchBill = data
            })
            await getListBranchSubmodule(1, [], androidKoinlearn).then(data => {
                branchLearn = data
            })
            await getListBranchSubmodule(1, [], androidKoindeposito).then(data => {
                branchDeposito = data
            })
            await getListBranchSubmodule(1, [], androidKoinp2p).then(data => {
                branchP2p = data
            })

            const result = await app.client.views.update({
                view_id: resultLoading.view.id,
                // View payload
                view: {
                    type: "modal",
                    // View identifier
                    callback_id: "view_1",
                    private_metadata: typeBuild,
                    title: {
                        type: "plain_text",
                        text: `Build APK ${payload.text}`,
                    },
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `Hello *<@${payload.user_name}>*, Kamu ingin APK dari branch apa nih. Saya bisa membantumu untuk build APK yang kamu inginkan\n\n`,
                            },
                        },
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchSuperapp,
                                action_id: "select_superapp",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch Superapp",
                                emoji: true,
                            },
                        }, // input superapp
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchGaji,
                                action_id: "select_gaji",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch KoinGaji",
                                emoji: true,
                            },
                        }, // input gaji
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchBond,
                                action_id: "select_bond",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch KoinBond",
                                emoji: true,
                            },
                        }, // input bond
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchGold,
                                action_id: "select_gold",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch KoinGold",
                                emoji: true,
                            },
                        }, // input gold
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchNeo,
                                action_id: "select_neo",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch KoinNeo",
                                emoji: true,
                            },
                        }, // input neo
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchBisnis,
                                action_id: "select_bisnis",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch KoinBisnis",
                                emoji: true,
                            },
                        }, // input bisnis
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchRevolver,
                                action_id: "select_invoice",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch KoinRevolver/KoinInvoice",
                                emoji: true,
                            },
                        }, // input Invoice
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchBill,
                                action_id: "select_bill",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch KoinBill",
                                emoji: true,
                            },
                        }, // input Bill
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchLearn,
                                action_id: "select_learn",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch KoinLearn",
                                emoji: true,
                            },
                        }, // input Learn
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchDeposito,
                                action_id: "select_deposito",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch KoinDeposito",
                                emoji: true,
                            },
                        }, // input Deposito
                        {
                            type: "input",
                            element: {
                                type: "static_select",
                                initial_option: defaultBranch,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Select an item",
                                    emoji: true,
                                },
                                options: branchP2p,
                                action_id: "select_p2p",
                            },
                            label: {
                                type: "plain_text",
                                text: "Pilih Branch KoinP2P",
                                emoji: true,
                            },
                        }, // input p2p
                    ],
                    submit: {
                        type: "plain_text",
                        text: "Submit",
                    },
                },

            });
            console.log(result);
        } else {
            await app.client.views.update({
                view_id: resultLoading.view.id,
                view: {
                    "type": "modal",
                    "title": {
                        "type": "plain_text",
                        "text": "Gagal Build APK"
                    },
                    "close": {
                        "type": "plain_text",
                        "text": "Oke"
                    },
                    "blocks": [
                        {
                            "type": "image",
                            "image_url": "https://us-tuna-sounds-images.voicemod.net/03b4cde0-8bd8-49f6-9e30-742059305dfd-1694326159056.png",
                            "alt_text": "error"
                        },
                        {
                            "type": "section",
                            "block_id": "sectionBlockOnlyMrkdwn",
                            "text": {
                                "type": "mrkdwn",
                                "text": `:x: Maaf yaa puh. Kayaknyaa kamu salah input type variantnya.\nType variatnya itu uat, development, dan staging*`
                            }
                        }
                    ]
                }
            })
        }
    } catch (error) {
        await app.client.views.update({
            view_id: resultLoading.view.id,
            view: {
                "type": "modal",
                "title": {
                    "type": "plain_text",
                    "text": "Gagal Build APK"
                },
                "close": {
                    "type": "plain_text",
                    "text": "Oke"
                },
                "blocks": [
                    {
                        "type": "image",
                        "image_url": "https://us-tuna-sounds-images.voicemod.net/03b4cde0-8bd8-49f6-9e30-742059305dfd-1694326159056.png",
                        "alt_text": "error"
                    },
                    {
                        "type": "section",
                        "block_id": "sectionBlockOnlyMrkdwn",
                        "text": {
                            "type": "mrkdwn",
                            "text": `:x: Maaf yaa puh. Kayaknyaa lagi ada error. Nanti coba lagi yaa atau coba :call_me_hand: *<@${userId}>*`
                        }
                    }
                ]
            }
        })
        console.error(error);
    }
});

app.view("view_1", ({ ack, body, view, client, logger }) => {
    // Acknowledge the view_submission event
    ack();

    // Do whatever you want with the input data - here we're saving it to a DB then sending the user a verifcation of their submission

    // Assume there's an input block with `test_input` as the block_id and `dreamy_input` as the action_id
    // const val = view["state"]["values"]["test_input"]["dreamy_input"];
    const user = body['user']['id']

    const blockId1 = view["blocks"][1]['block_id']
    const blockId2 = view["blocks"][2]['block_id']
    const blockId3 = view["blocks"][3]['block_id']
    const blockId4 = view["blocks"][4]['block_id']
    const blockId5 = view["blocks"][5]['block_id']
    const blockId6 = view["blocks"][6]['block_id']
    const blockId7 = view["blocks"][7]['block_id']
    const blockId8 = view["blocks"][8]['block_id']
    const blockId9 = view["blocks"][9]['block_id']
    const blockId10 = view["blocks"][10]['block_id']
    const blockId11 = view["blocks"][11]['block_id']

    const valueSuperapp = view["state"]["values"][blockId1]['select_superapp']['selected_option']['value'];
    const valueGaji = view["state"]["values"][blockId2]['select_gaji']['selected_option']['value'];
    const valueBond = view["state"]["values"][blockId3]['select_bond']['selected_option']['value'];
    const valueGold = view["state"]["values"][blockId4]['select_gold']['selected_option']['value'];
    const valueNeo = view["state"]["values"][blockId5]['select_neo']['selected_option']['value'];
    const valueBisnis = view["state"]["values"][blockId6]['select_bisnis']['selected_option']['value'];
    const valueRevolver = view["state"]["values"][blockId7]['select_invoice']['selected_option']['value'];
    const valueBill = view["state"]["values"][blockId8]['select_bill']['selected_option']['value'];
    const valueLearn = view["state"]["values"][blockId9]['select_learn']['selected_option']['value'];
    const valueDeposito = view["state"]["values"][blockId10]['select_deposito']['selected_option']['value'];
    const valueP2p = view["state"]["values"][blockId11]['select_p2p']['selected_option']['value'];
    const valueTypeBuild = view["private_metadata"]

    // You'll probably want to store these values somewhere
    console.log(blockId1);
    console.log(valueSuperapp)
    console.log(valueTypeBuild)

    let payload = new FormData()
    payload.append("token", triggerToken)
    payload.append("ref", valueSuperapp)
    payload.append("variables[USER_ID]", user)
    payload.append("variables[GOLD_SELECTED_BRANCH]", valueGold)
    payload.append("variables[BOND_SELECTED_BRANCH]", valueBond)
    payload.append("variables[NEO_SELECTED_BRANCH]", valueNeo)
    payload.append("variables[BISNIS_SELECTED_BRANCH]", valueBisnis)
    payload.append("variables[GAJI_SELECTED_BRANCH]", valueGaji)
    payload.append("variables[INVOICE_SELECTED_BRANCH]", valueRevolver)
    payload.append("variables[BILL_SELECTED_BRANCH]", valueBill)
    payload.append("variables[LEARN_SELECTED_BRANCH]", valueLearn)
    payload.append("variables[DEPOSITO_SELECTED_BRANCH]", valueDeposito)
    payload.append("variables[P2P_SELECTED_BRANCH]", valueP2p)
    payload.append("variables[TYPE_VARIANT]", valueTypeBuild)

    axios({
        method: 'post',
        url: trigger_api,
        data: payload,
        headers: payload.getHeaders()
    }).then(async res => {
        if (res.data.id === undefined) {
            console.log(res.data.message.base)
            // handle error
            await client.chat.postMessage({
                channel: user,
                text: res.data.message.base
            })
            return
        }

        // handle success
        const ticket = res.data.id
        const ref = res.data.ref
        console.log(`Ref and Ticket ${ref} - ${ticket}`)
        await client.chat.postMessage({
            channel: user,
            mrkdwn: true,
            text:`Your request is submitted. Relax :coffee:  while I build the Apk for you!\n> This usually takes 30-45 minutes (Depends on the queue :pepelaugh2: ). I *will ping you* once its done.\n> Your ticket_id - ${ticket} \n> Branch Selected - *${ref}*\nYou can anytime do */statusbuild [ticket_id]* to know about request status`
        })
    }).catch(e => {
        sendDefaultMessageError(user).then(_ => {})
        console.log(e)
    })
});

app.event('app_home_opened', async ({ event, client, context }) => {
    try {
        /* view.publish is the method that your app uses to push a view to the Home tab */
        const result = await client.views.publish({

            /* the user that opened your app's app home */
            user_id: event.user,

            /* the view object that appears in the app home*/
            view: {
                type: 'home',
                callback_id: 'home_view',

                /* body of the view */
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*Welcome to your _App's Home_* :tada:"
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "This button won't do much for now but you can set up a listener for it using the `actions()` method and passing its unique `action_id`. See an example in the `examples` folder within your Bolt app."
                        }
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Click me!"
                                }
                            }
                        ]
                    }
                ]
            }
        });
    }
    catch (error) {
        console.error(error);
    }
});

app.command("/statusbuild", async ({ ack, payload}) => {
    ack()

    const pipelineId = payload.text
    const userId = payload.user_id
    const userName = payload.user_name

    await getStatusPipeline(pipelineId).then(async res => {
        if (res.data.id === undefined) {
            await app.client.chat.postMessage({
                channel: userId,
                mrkdwn: true,
                text: `Holla *<@${userName}>*, Maaf yaa sepertinya lagi ada kendala atau memang gak lagi build.\n> ${res.data.error}`
            })
            return
        }

        const pipelineRes = res.data.id
        const status = res.data.status
        const branch = res.data.ref
        const link = res.data.web_url

        await app.client.chat.postMessage({
            channel: userId,
            mrkdwn: false,
            text: `Holla *<@${userName}>*, APK yg kamu minta dari branch *${branch}* (tiket: ${pipelineRes})\n> status : *${status}*\nKamu bisa cek langsung dengan klik link ini\n> ${link}`
        })
    })
})

app.command("/cancelapk", async ({ack, payload, context}) => {
    ack()

    const userId = payload.user_id
    const pipelineId = payload.text

    if (!/\d/.test(pipelineId)) {
        await sendDefaultMessageError(userId)
        return
    }

    await app.client.views.open({
        token: context.botToken,
        trigger_id: payload.trigger_id,
        view: {
            type: "modal",
            callback_id: "view_cancel_build",
            title: {
                type: "plain_text",
                text: "Batal Build ?"
            },
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Hello *<@${payload.user_name}>*, Apakah Anda yakin ingin membatalkan proses build APK? Tindakan ini akan menghentikan proses build yang sedang berlangsung dan tidak dapat dibatalkan.\n\n`,
                    }
                }
            ],
            submit: {
                type: "plain_text",
                text: "Batalkan",
            },
            close: {
                type: "plain_text",
                text: "Tetap Build"
            },
            private_metadata: pipelineId
        }
    })
})

app.view("view_cancel_build", async ({ ack, body, view, client }) => {
    ack()

    const user = body['user']['id']
    const pipelineId = view["private_metadata"]
    await cancelPipeline(pipelineId).then(async res => {
        console.log(res.data)
        if (res.data.detailed_status.text === undefined || !res.data.detailed_status.text.contains('canceled')) {
            await sendErrorMsgCancelPipeline(user)
            return
        }

        const pipelineRes = res.data.id
        const status = res.data.status
        const branch = res.data.ref
        const link = res.data.web_url

        await app.client.chat.postMessage({
            channel: user,
            mrkdwn: false,
            text: `Holla *<@${user}>*, APK yg kamu minta dari branch *${branch}* (tiket: ${pipelineRes}) berhasil di cancel\n> status : *${status}*\nKamu bisa cek langsung dengan klik link ini\n> ${link}`
        })
    }).then(err => {
        if (err !== undefined) {
            sendErrorMsgCancelPipeline(user)
            console.log(`view_cancel_build_err: ${err}`)
        }
    })
})

async function sendErrorMsgCancelPipeline(user) {
    await app.client.chat.postMessage({
        channel: user,
        mrkdwn: true,
        text: `Duh Tiba Tiba Error`,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `:x: Maaf yaa puh. Kayaknyaa gak ketemu atau emang gak lagi build. Nanti coba lagi yaa :call_me_hand: `
                }
            }
        ]
    })
}

async function sendDefaultMessageError(userId) {
    const userIdPhi = "UHK4ULV7F"
    await app.client.chat.postMessage({
        channel: userId,
        mrkdwn: false,
        text: `Duh Tiba Tiba Error`,
        blocks: [
            {
                "type": "image",
                "image_url": "https://us-tuna-sounds-images.voicemod.net/03b4cde0-8bd8-49f6-9e30-742059305dfd-1694326159056.png",
                "alt_text": "error"
            },
            {
                "type": "section",
                "block_id": "sectionBlockOnlyMrkdwn",
                "text": {
                    "type": "mrkdwn",
                    "text": `:x: Maaf yaa puh. Kayaknyaa lagi ada error. Nanti coba lagi yaa atau coba :call_me_hand: *<@${userIdPhi}>*`
                }
            }
        ],
    })
}