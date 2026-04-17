const fetch = require("node-fetch")

exports.handler = async (event) => {

  const { action, id, group } = JSON.parse(event.body)

  const GROUP_GISTS = {
    Trainer: "4edcf4d341cd4f7d5d0fb8a50f8b8c3c",
    Gym_Leader: "e110c37b3e0b8de83a33a1b0a5eb64e8",
    Elite_Four: "d9db3a72fed74c496fd6cc830f9ca6e9"
  }

  const GROUP_FILES = {
    Trainer: "trainer_ids.txt",
    Gym_Leader: "gym_ids.txt",
    Elite_Four: "elite_ids.txt"
  }

  const TOKEN = process.env.GITHUB_TOKEN

  const gistId = GROUP_GISTS[group]
  const file = GROUP_FILES[group]

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  })

  const gist = await res.json()

  let ids = (gist.files[file].content || "")
    .split("\n")
    .filter(x => x)

  ids = ids.filter(x => x !== id)

  if (action === "online") ids.push(id)

  const content = ids.join("\n") || "\u200B"

  await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      files: {
        [file]: { content }
      }
    })
  })

  return {
    statusCode: 200,
    body: "OK"
  }
}
